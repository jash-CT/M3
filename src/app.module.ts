import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './common/config/configuration';
import { DatabaseModule } from './common/database/database.module';
import { RedisModule } from './common/redis/redis.module';
import { AuditService } from './common/audit/audit.service';
import { IdempotencyService } from './common/idempotency/idempotency.service';
import { KycAmlModule } from './kyc-aml/kyc-aml.module';
import { PaymentsModule } from './payments/payments.module';
import { CardsModule } from './cards/cards.module';
import { FraudModule } from './fraud/fraud.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { PartnerGatewayModule } from './partner-gateway/partner-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    KycAmlModule,
    PaymentsModule,
    CardsModule,
    FraudModule,
    ReconciliationModule,
    PartnerGatewayModule,
  ],
  providers: [AuditService, IdempotencyService],
})
export class AppModule {}
