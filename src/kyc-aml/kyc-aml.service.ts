import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycCustomer, KycTier } from './entities/kyc-customer.entity';
import {
  KycVerification,
  VerificationType,
  VerificationStatus,
} from './entities/kyc-verification.entity';
import { AmlCheck, AmlCheckType } from './entities/aml-check.entity';
import { AuditService } from '../common/audit/audit.service';
import { KYCRequiredError, AMLBlockedError } from '../common/errors/errors';

export interface StartVerificationInput {
  customerId: string;
  type: VerificationType;
  providerPayload?: Record<string, unknown>;
}

export interface AmlCheckInput {
  customerId: string;
  type: AmlCheckType;
  result: 'PASS' | 'FLAG' | 'FAIL';
  score?: number;
  details?: Record<string, unknown>;
  providerReference?: string;
}

@Injectable()
export class KycAmlService {
  constructor(
    @InjectRepository(KycCustomer)
    private readonly customerRepo: Repository<KycCustomer>,
    @InjectRepository(KycVerification)
    private readonly verificationRepo: Repository<KycVerification>,
    @InjectRepository(AmlCheck)
    private readonly amlCheckRepo: Repository<AmlCheck>,
    private readonly audit: AuditService,
  ) {}

  async getOrCreateCustomer(externalUserId: string): Promise<KycCustomer> {
    let customer = await this.customerRepo.findOne({
      where: { externalUserId },
    });
    if (!customer) {
      customer = this.customerRepo.create({
        externalUserId,
        tier: KycTier.NONE,
        status: 'PENDING',
        amlRiskScore: '0',
        amlCleared: false,
      });
      await this.customerRepo.save(customer);
      await this.audit.log({
        entityType: 'KycCustomer',
        entityId: customer.id,
        action: 'CREATED',
        payload: { externalUserId },
      });
    }
    return customer;
  }

  async getCustomer(id: string): Promise<KycCustomer> {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('KYC customer not found');
    return customer;
  }

  async startVerification(
    input: StartVerificationInput,
  ): Promise<KycVerification> {
    const verification = this.verificationRepo.create({
      customerId: input.customerId,
      type: input.type,
      status: VerificationStatus.SUBMITTED,
      providerPayload: input.providerPayload ?? undefined,
    });
    await this.verificationRepo.save(verification);
    await this.audit.log({
      entityType: 'KycVerification',
      entityId: verification.id,
      action: 'STARTED',
      payload: { type: input.type },
    });
    return verification;
  }

  async completeVerification(
    verificationId: string,
    status: VerificationStatus.APPROVED | VerificationStatus.REJECTED,
    providerResponse?: Record<string, unknown>,
    providerReference?: string,
  ): Promise<KycVerification> {
    const verification = await this.verificationRepo.findOne({
      where: { id: verificationId },
    });
    if (!verification) throw new NotFoundException('Verification not found');
    verification.status = status;
    verification.providerResponse = providerResponse ?? verification.providerResponse;
    verification.providerReference = providerReference ?? verification.providerReference;
    verification.completedAt = new Date();
    await this.verificationRepo.save(verification);

    const approvedCount = await this.verificationRepo.count({
      where: { customerId: verification.customerId, status: VerificationStatus.APPROVED },
    });
    if (approvedCount >= 2) {
      await this.customerRepo.update(verification.customerId, {
        tier: KycTier.TIER_2,
        status: 'APPROVED',
        reviewedAt: new Date(),
      });
    } else if (approvedCount >= 1) {
      await this.customerRepo.update(verification.customerId, {
        tier: KycTier.TIER_1,
        status: 'APPROVED',
        reviewedAt: new Date(),
      });
    }

    await this.audit.log({
      entityType: 'KycVerification',
      entityId: verification.id,
      action: 'COMPLETED',
      payload: { status },
    });
    return verification;
  }

  async recordAmlCheck(input: AmlCheckInput): Promise<AmlCheck> {
    const check = this.amlCheckRepo.create({
      customerId: input.customerId,
      type: input.type,
      result: input.result,
      score: input.score?.toString(),
      details: input.details,
      providerReference: input.providerReference,
    });
    await this.amlCheckRepo.save(check);

    if (input.result === 'FAIL') {
      await this.customerRepo.update(input.customerId, {
        amlCleared: false,
        amlRiskScore: String(Math.min(1, (input.score ?? 1))),
      });
    } else if (input.result === 'PASS') {
      const customer = await this.customerRepo.findOne({
        where: { id: input.customerId },
      });
      if (customer) {
        const newScore = input.score ?? 0;
        await this.customerRepo.update(input.customerId, {
          amlRiskScore: String(newScore),
          amlCleared: newScore < 0.5,
        });
      }
    }

    await this.audit.log({
      entityType: 'AmlCheck',
      entityId: check.id,
      action: 'RECORDED',
      payload: { type: input.type, result: input.result },
    });
    return check;
  }

  async assertKycApproved(customerId: string, minTier: KycTier = KycTier.TIER_1): Promise<void> {
    const customer = await this.getCustomer(customerId);
    if (customer.status !== 'APPROVED')
      throw new KYCRequiredError('Customer KYC not approved');
    const tiers = [KycTier.NONE, KycTier.TIER_1, KycTier.TIER_2, KycTier.TIER_3];
    if (tiers.indexOf(customer.tier) < tiers.indexOf(minTier))
      throw new KYCRequiredError(`Required KYC tier: ${minTier}`);
  }

  async assertAmlCleared(customerId: string): Promise<void> {
    const customer = await this.getCustomer(customerId);
    if (!customer.amlCleared)
      throw new AMLBlockedError('Customer AML check not cleared');
  }

  async listVerifications(customerId: string): Promise<KycVerification[]> {
    return this.verificationRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async listAmlChecks(customerId: string): Promise<AmlCheck[]> {
    return this.amlCheckRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
