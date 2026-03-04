import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentType {
  TRANSFER = 'TRANSFER',
  CARD_PAYMENT = 'CARD_PAYMENT',
  PIX = 'PIX',
  SEPA = 'SEPA',
  ACH = 'ACH',
}

@Entity('payments')
@Index(['idempotencyKey'], { unique: true, where: 'idempotency_key IS NOT NULL' })
@Index(['status', 'createdAt'])
@Index(['externalReference'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  idempotencyKey: string;

  @Column()
  customerId: string;

  @Column({ type: 'varchar', length: 32 })
  type: PaymentType;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  amount: string;

  @Column({ nullable: true })
  processorId: string; // which partner/processor handled it

  @Column({ nullable: true })
  processorReference: string;

  @Column({ type: 'varchar', length: 32, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ nullable: true })
  externalReference: string;

  @Column({ type: 'jsonb', nullable: true })
  providerResponse: Record<string, unknown>;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
