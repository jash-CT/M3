import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KycAmlService } from './kyc-aml.service';
import {
  GetOrCreateCustomerDto,
  StartVerificationDto,
  CompleteVerificationDto,
  RecordAmlCheckDto,
} from './dto/kyc.dto';

@ApiTags('KYC/AML')
@Controller('kyc-aml')
export class KycAmlController {
  constructor(private readonly kycAml: KycAmlService) {}

  @Post('customers')
  async getOrCreateCustomer(@Body() dto: GetOrCreateCustomerDto) {
    return this.kycAml.getOrCreateCustomer(dto.externalUserId);
  }

  @Get('customers/:id')
  async getCustomer(@Param('id') id: string) {
    return this.kycAml.getCustomer(id);
  }

  @Post('verifications')
  async startVerification(@Body() dto: StartVerificationDto) {
    return this.kycAml.startVerification({
      customerId: dto.customerId,
      type: dto.type,
      providerPayload: dto.providerPayload,
    });
  }

  @Patch('verifications/:id/complete')
  async completeVerification(
    @Param('id') id: string,
    @Body() dto: CompleteVerificationDto,
  ) {
    return this.kycAml.completeVerification(
      id,
      dto.status,
      dto.providerResponse,
      dto.providerReference,
    );
  }

  @Get('customers/:id/verifications')
  async listVerifications(@Param('id') id: string) {
    return this.kycAml.listVerifications(id);
  }

  @Post('aml/checks')
  async recordAmlCheck(@Body() dto: RecordAmlCheckDto) {
    return this.kycAml.recordAmlCheck({
      customerId: dto.customerId,
      type: dto.type,
      result: dto.result,
      score: dto.score,
      details: dto.details,
      providerReference: dto.providerReference,
    });
  }

  @Get('customers/:id/aml-checks')
  async listAmlChecks(@Param('id') id: string) {
    return this.kycAml.listAmlChecks(id);
  }
}
