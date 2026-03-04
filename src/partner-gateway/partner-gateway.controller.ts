import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PartnerGatewayService } from './partner-gateway.service';
import { PartnerApiKeyGuard } from './guards/partner-api-key.guard';
import { CurrentPartner } from './decorators/partner.decorator';
import { Partner } from './entities/partner.entity';
import { PaymentsService } from '../payments/payments.service';
import { KycAmlService } from '../kyc-aml/kyc-aml.service';
import { PaymentType } from '../payments/entities/payment.entity';

@ApiTags('Partner Gateway')
@ApiSecurity('PartnerApiKey')
@Controller('partner')
@UseGuards(PartnerApiKeyGuard)
export class PartnerGatewayController {
  constructor(
    private readonly partnerGateway: PartnerGatewayService,
    private readonly payments: PaymentsService,
    private readonly kycAml: KycAmlService,
  ) {}

  @Get('me')
  async me(@CurrentPartner() partner: Partner) {
    return {
      id: partner.id,
      name: partner.name,
      code: partner.code,
      allowedEndpoints: partner.allowedEndpoints,
    };
  }

  @Post('payments')
  async createPayment(
    @CurrentPartner() partner: Partner,
    @Body()
    body: {
      customerId: string;
      type: PaymentType;
      amount: string;
      currency: string;
      idempotencyKey?: string;
      externalReference?: string;
    },
  ) {
    if (!this.partnerGateway.canAccess(partner, 'payments'))
      throw new Error('Partner not allowed to create payments');
    return this.payments.create({
      customerId: body.customerId,
      type: body.type,
      amount: body.amount,
      currency: body.currency,
      idempotencyKey: body.idempotencyKey,
      externalReference: body.externalReference ?? undefined,
    });
  }

  @Get('payments/:id')
  async getPayment(
    @CurrentPartner() partner: Partner,
    @Param('id') id: string,
  ) {
    if (!this.partnerGateway.canAccess(partner, 'payments'))
      throw new Error('Partner not allowed');
    return this.payments.getById(id);
  }

  @Get('kyc/customers/:externalUserId')
  async getKycCustomer(
    @CurrentPartner() partner: Partner,
    @Param('externalUserId') externalUserId: string,
  ) {
    if (!this.partnerGateway.canAccess(partner, 'kyc-aml'))
      throw new Error('Partner not allowed');
    return this.kycAml.getOrCreateCustomer(externalUserId);
  }
}
