import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('fraud_events')
@Index(['paymentId'])
@Index(['customerId', 'createdAt'])
export class FraudEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paymentId: string;

  @Column()
  customerId: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  amount: string;

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  riskScore: string;

  @Column({ default: false })
  blocked: boolean;

  @Column({ type: 'jsonb', nullable: true })
  rulesTriggered: string[] | null;

  @CreateDateColumn()
  createdAt: Date;
}
