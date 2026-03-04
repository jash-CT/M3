import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycCustomer } from './entities/kyc-customer.entity';
import { KycVerification } from './entities/kyc-verification.entity';
import { AmlCheck } from './entities/aml-check.entity';
import { KycAmlService } from './kyc-aml.service';
import { KycAmlController } from './kyc-aml.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([KycCustomer, KycVerification, AmlCheck]),
  ],
  controllers: [KycAmlController],
  providers: [KycAmlService],
  exports: [KycAmlService],
})
export class KycAmlModule {}
