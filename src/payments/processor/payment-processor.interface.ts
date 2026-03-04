import { PaymentType } from '../entities/payment.entity';

export interface ProcessPaymentRequest {
  paymentId: string;
  amount: string;
  currency: string;
  type: PaymentType;
  customerId: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface ProcessPaymentResult {
  success: boolean;
  processorReference?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  providerResponse?: Record<string, unknown>;
  failureReason?: string;
}

export interface IPaymentProcessor {
  readonly processorId: string;
  process(request: ProcessPaymentRequest): Promise<ProcessPaymentResult>;
  supports(type: PaymentType, currency: string): boolean;
}
