import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('payment_routes')
@Index(['paymentType', 'currency', 'priority'])
export class PaymentRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  paymentType: string;

  @Column({ length: 3 })
  currency: string;

  @Column()
  processorId: string; // partner gateway identifier

  @Column({ type: 'int', default: 0 })
  priority: number; // lower = preferred first

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown>; // processor-specific config

  @CreateDateColumn()
  createdAt: Date;
}
