import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import { MatchStatus } from './entities/reconciliation-match.entity';

@ApiTags('Reconciliation')
@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliation: ReconciliationService) {}

  @Post('runs')
  async startRun(
    @Body() body: { type: string; partnerId?: string; runDate: string },
  ) {
    return this.reconciliation.startRun({
      type: body.type,
      partnerId: body.partnerId,
      runDate: new Date(body.runDate),
    });
  }

  @Get('runs')
  async listRuns(@Query('type') type?: string, @Query('limit') limit?: string) {
    return this.reconciliation.listRuns(type, limit ? parseInt(limit, 10) : 50);
  }

  @Get('runs/:id')
  async getRun(@Param('id') id: string) {
    return this.reconciliation.getRun(id);
  }

  @Get('runs/:id/matches')
  async listMatches(
    @Param('id') id: string,
    @Query('status') status?: MatchStatus,
  ) {
    return this.reconciliation.listMatches(id, status);
  }
}
