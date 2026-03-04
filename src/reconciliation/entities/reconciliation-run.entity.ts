import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ReconciliationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('reconciliation_runs')
@Index(['status', 'createdAt'])
export class ReconciliationRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // PAYMENTS, SETTLEMENT, CARD

  @Column({ nullable: true })
  partnerId: string;

  @Column({ type: 'date' })
  runDate: Date;

  @Column({ type: 'varchar', length: 32, default: ReconciliationStatus.PENDING })
  status: ReconciliationStatus;

  @Column({ type: 'int', default: 0 })
  totalCount: number;

  @Column({ type: 'int', default: 0 })
  matchedCount: number;

  @Column({ type: 'int', default: 0 })
  mismatchCount: number;

  @Column({ type: 'jsonb', nullable: true })
  summary: Record<string, unknown>;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
