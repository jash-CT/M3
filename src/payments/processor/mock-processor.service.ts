import { Injectable } from '@nestjs/common';
import {
  IPaymentProcessor,
  ProcessPaymentRequest,
  ProcessPaymentResult,
} from './payment-processor.interface';
import { PaymentType } from '../entities/payment.entity';

@Injectable()
export class MockProcessorService implements IPaymentProcessor {
  readonly processorId = 'mock-processor';

  supports(type: PaymentType, _currency: string): boolean {
    return [PaymentType.TRANSFER, PaymentType.SEPA, PaymentType.ACH].includes(type);
  }

  async process(request: ProcessPaymentRequest): Promise<ProcessPaymentResult> {
    // Simulate async processing
    await new Promise((r) => setTimeout(r, 50));
    return {
      success: true,
      processorReference: `MOCK-${request.paymentId.slice(0, 8)}-${Date.now()}`,
      status: 'COMPLETED',
      providerResponse: { simulated: true, processorId: this.processorId },
    };
  }
}
