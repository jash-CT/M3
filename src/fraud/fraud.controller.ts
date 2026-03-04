import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FraudService } from './fraud.service';

@ApiTags('Fraud')
@Controller('fraud')
export class FraudController {
  constructor(private readonly fraud: FraudService) {}

  @Get('events/customer/:customerId')
  async listEvents(@Param('customerId') customerId: string) {
    return this.fraud.listEvents(customerId);
  }
}
