import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReconciliationRun, ReconciliationStatus } from './entities/reconciliation-run.entity';
import {
  ReconciliationMatch,
  MatchStatus,
} from './entities/reconciliation-match.entity';
import { Payment } from '../payments/entities/payment.entity';
import { AuditService } from '../common/audit/audit.service';

export interface StartReconciliationInput {
  type: string;
  partnerId?: string;
  runDate: Date;
}

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectRepository(ReconciliationRun)
    private readonly runRepo: Repository<ReconciliationRun>,
    @InjectRepository(ReconciliationMatch)
    private readonly matchRepo: Repository<ReconciliationMatch>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly audit: AuditService,
  ) {}

  async startRun(input: StartReconciliationInput): Promise<ReconciliationRun> {
    const run = this.runRepo.create({
      type: input.type,
      partnerId: input.partnerId ?? undefined,
      runDate: input.runDate,
      status: ReconciliationStatus.RUNNING,
    });
    await this.runRepo.save(run);

    try {
      if (input.type === 'PAYMENTS') {
        await this.reconcilePayments(run.id, input.runDate, input.partnerId);
      }
      const runEntity = await this.runRepo.findOne({ where: { id: run.id } });
      if (runEntity) {
        runEntity.status = ReconciliationStatus.COMPLETED;
        runEntity.completedAt = new Date();
        await this.runRepo.save(runEntity);
      }
    } catch (err) {
      const runEntity = await this.runRepo.findOne({ where: { id: run.id } });
      if (runEntity) {
        runEntity.status = ReconciliationStatus.FAILED;
        runEntity.errorMessage = err instanceof Error ? err.message : String(err);
        await this.runRepo.save(runEntity);
      }
      throw err;
    }

    await this.audit.log({
      entityType: 'ReconciliationRun',
      entityId: run.id,
      action: 'COMPLETED',
      payload: { type: input.type, runDate: input.runDate },
    });

    return this.getRun(run.id);
  }

  private async reconcilePayments(
    runId: string,
    runDate: Date,
    partnerId?: string,
  ): Promise<void> {
    const start = new Date(runDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .where('p.createdAt >= :start', { start })
      .andWhere('p.createdAt < :end', { end })
      .andWhere('p.status = :status', { status: 'COMPLETED' });
    if (partnerId) qb.andWhere('p.processorId = :partnerId', { partnerId });
    const payments = await qb.getMany();

    let matched = 0;
    let mismatch = 0;
    for (const p of payments) {
      const status = p.processorReference ? MatchStatus.MATCHED : MatchStatus.ONLY_INTERNAL;
      if (status === MatchStatus.MATCHED) matched++;
      else mismatch++;
      await this.matchRepo.insert({
        runId,
        internalId: p.id,
        externalId: p.processorReference ?? undefined,
        internalAmount: p.amount,
        externalAmount: p.amount,
        status,
        details: { paymentType: p.type, currency: p.currency },
      });
    }

    await this.runRepo.update(runId, {
      totalCount: payments.length,
      matchedCount: matched,
      mismatchCount: mismatch,
      summary: { payments: payments.length, matched, mismatch },
    });
  }

  async getRun(id: string): Promise<ReconciliationRun> {
    const run = await this.runRepo.findOne({ where: { id } });
    if (!run) throw new NotFoundException('Reconciliation run not found');
    return run;
  }

  async listRuns(
    type?: string,
    limit = 50,
  ): Promise<ReconciliationRun[]> {
    const qb = this.runRepo.createQueryBuilder('r').orderBy('r.createdAt', 'DESC').take(limit);
    if (type) qb.andWhere('r.type = :type', { type });
    return qb.getMany();
  }

  async listMatches(runId: string, status?: MatchStatus): Promise<ReconciliationMatch[]> {
    const qb = this.matchRepo
      .createQueryBuilder('m')
      .where('m.runId = :runId', { runId })
      .orderBy('m.createdAt', 'ASC');
    if (status) qb.andWhere('m.status = :status', { status });
    return qb.getMany();
  }
}
