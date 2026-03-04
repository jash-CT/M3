import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from './entities/payment.entity';
import { PaymentRoute } from './entities/payment-route.entity';
import { Inject } from '@nestjs/common';
import { IPaymentProcessor } from './processor/payment-processor.interface';
import { PAYMENT_PROCESSORS } from './payments.module';
import { AuditService } from '../common/audit/audit.service';
import { KycAmlService } from '../kyc-aml/kyc-aml.service';
import { FraudService } from '../fraud/fraud.service';

export interface CreatePaymentInput {
  customerId: string;
  type: PaymentType;
  amount: string;
  currency: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  externalReference?: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(PaymentRoute)
    private readonly routeRepo: Repository<PaymentRoute>,
    private readonly audit: AuditService,
    private readonly kycAml: KycAmlService,
    private readonly fraud: FraudService,
    @Inject(PAYMENT_PROCESSORS) private readonly processors: IPaymentProcessor[],
  ) {}

  async create(input: CreatePaymentInput): Promise<Payment> {
    await this.kycAml.assertKycApproved(input.customerId);
    await this.kycAml.assertAmlCleared(input.customerId);

    const payment = this.paymentRepo.create({
      customerId: input.customerId,
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      status: PaymentStatus.PENDING,
      idempotencyKey: input.idempotencyKey ?? undefined,
      metadata: input.metadata ?? undefined,
      externalReference: input.externalReference ?? undefined,
    });
    await this.paymentRepo.save(payment);

    const risk = await this.fraud.evaluatePayment({
      paymentId: payment.id,
      customerId: payment.customerId,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      type: payment.type,
    });
    if (risk.blocked) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = risk.reason ?? 'FRAUD_BLOCKED';
      await this.paymentRepo.save(payment);
      await this.audit.log({
        entityType: 'Payment',
        entityId: payment.id,
        action: 'FRAUD_BLOCKED',
        payload: { riskScore: risk.score, reason: risk.reason },
      });
      throw this.fraud.fraudError(risk.reason);
    }

    const route = await this.selectRoute(payment.type, payment.currency);
    if (!route) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'NO_ROUTE';
      await this.paymentRepo.save(payment);
      throw new Error('No payment route available');
    }

    const processor = this.processors.find((p) => p.processorId === route.processorId);
    if (!processor) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'PROCESSOR_UNAVAILABLE';
      await this.paymentRepo.save(payment);
      throw new Error('Processor not available');
    }

    payment.status = PaymentStatus.PROCESSING;
    payment.processorId = route.processorId;
    await this.paymentRepo.save(payment);

    const result = await processor.process({
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      type: payment.type,
      customerId: payment.customerId,
      metadata: payment.metadata ?? undefined,
      idempotencyKey: payment.idempotencyKey ?? undefined,
    });

    if (result.processorReference != null) payment.processorReference = result.processorReference;
    if (result.providerResponse != null) payment.providerResponse = result.providerResponse;
    if (result.failureReason != null) payment.failureReason = result.failureReason;
    payment.status =
      result.status === 'COMPLETED'
        ? PaymentStatus.COMPLETED
        : result.status === 'FAILED'
          ? PaymentStatus.FAILED
          : PaymentStatus.PROCESSING;
    await this.paymentRepo.save(payment);

    await this.audit.log({
      entityType: 'Payment',
      entityId: payment.id,
      action: payment.status === PaymentStatus.COMPLETED ? 'COMPLETED' : 'FAILED',
      payload: { processorId: route.processorId, status: payment.status },
    });

    return payment;
  }

  private async selectRoute(
    type: PaymentType,
    currency: string,
  ): Promise<PaymentRoute | null> {
    return this.routeRepo.findOne({
      where: { paymentType: type, currency, active: true },
      order: { priority: 'ASC' },
    });
  }

  async getById(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async listByCustomer(
    customerId: string,
    limit = 50,
  ): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
