import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { IssueCardDto, UpdateCardStatusDto } from './dto/card.dto';
import { CardStatus } from './entities/card.entity';

@ApiTags('Cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Post()
  async issue(@Body() dto: IssueCardDto) {
    return this.cards.issue({
      customerId: dto.customerId,
      programId: dto.programId,
      type: dto.type,
      metadata: dto.metadata,
    });
  }

  @Get('programs')
  async listPrograms() {
    return this.cards.listPrograms();
  }

  @Post('programs')
  async createProgram(
    @Body() body: { name: string; partnerProgramId?: string },
  ) {
    return this.cards.createProgram(body.name, body.partnerProgramId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.cards.getById(id);
  }

  @Get('customer/:customerId')
  async listByCustomer(@Param('customerId') customerId: string) {
    return this.cards.listByCustomer(customerId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCardStatusDto,
  ) {
    return this.cards.updateStatus(id, dto.status);
  }
}
