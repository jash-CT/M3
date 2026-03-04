import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { PartnerGatewayService } from './partner-gateway.service';
import { PartnerGatewayController } from './partner-gateway.controller';
import { PaymentsModule } from '../payments/payments.module';
import { KycAmlModule } from '../kyc-aml/kyc-aml.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner]),
    PaymentsModule,
    KycAmlModule,
  ],
  controllers: [PartnerGatewayController],
  providers: [PartnerGatewayService],
  exports: [PartnerGatewayService],
})
export class PartnerGatewayModule {}
