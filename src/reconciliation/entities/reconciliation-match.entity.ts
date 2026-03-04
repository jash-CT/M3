import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum MatchStatus {
  MATCHED = 'MATCHED',
  MISMATCH = 'MISMATCH',
  ONLY_INTERNAL = 'ONLY_INTERNAL',
  ONLY_EXTERNAL = 'ONLY_EXTERNAL',
}

@Entity('reconciliation_matches')
@Index(['runId', 'status'])
export class ReconciliationMatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  runId: string;

  @Column({ nullable: true })
  internalId: string; // our payment/transaction id

  @Column({ nullable: true })
  externalId: string; // partner reference

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  internalAmount: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  externalAmount: string;

  @Column({ type: 'varchar', length: 32 })
  status: MatchStatus;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
