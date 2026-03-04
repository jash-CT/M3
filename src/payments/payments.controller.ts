import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { IdempotencyGuard } from '../common/guards/idempotency.guard';
import { IdempotencyService } from '../common/idempotency/idempotency.service';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(IdempotencyGuard)
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly idempotency: IdempotencyService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreatePaymentDto,
    @Req() req: Request & { idempotencyKey?: string },
  ) {
    const payment = await this.payments.create({
      customerId: dto.customerId,
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency,
      idempotencyKey: req.idempotencyKey,
      metadata: dto.metadata,
      externalReference: dto.externalReference,
    });
    if (req.idempotencyKey)
      await this.idempotency.set(
        req.idempotencyKey,
        201,
        payment as unknown as Record<string, unknown>,
      );
    return payment;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.payments.getById(id);
  }

  @Get('customer/:customerId')
  async listByCustomer(@Param('customerId') customerId: string) {
    return this.payments.listByCustomer(customerId);
  }
}
