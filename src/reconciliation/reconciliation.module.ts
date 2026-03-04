import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReconciliationRun } from './entities/reconciliation-run.entity';
import { ReconciliationMatch } from './entities/reconciliation-match.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ReconciliationService } from './reconciliation.service';
import { ReconciliationController } from './reconciliation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReconciliationRun,
      ReconciliationMatch,
      Payment,
    ]),
  ],
  controllers: [ReconciliationController],
  providers: [ReconciliationService],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
