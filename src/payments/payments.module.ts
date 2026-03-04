import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentRoute } from './entities/payment-route.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { IPaymentProcessor } from './processor/payment-processor.interface';
import { MockProcessorService } from './processor/mock-processor.service';
import { IdempotencyGuard } from '../common/guards/idempotency.guard';
import { KycAmlModule } from '../kyc-aml/kyc-aml.module';
import { FraudModule } from '../fraud/fraud.module';

export const PAYMENT_PROCESSORS = 'PAYMENT_PROCESSORS';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentRoute]),
    KycAmlModule,
    FraudModule,
  ],
  controllers: [PaymentsController],
  providers: [
    MockProcessorService,
    IdempotencyGuard,
    {
      provide: PAYMENT_PROCESSORS,
      useFactory: (mock: MockProcessorService): IPaymentProcessor[] => [mock],
      inject: [MockProcessorService],
    },
    PaymentsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
