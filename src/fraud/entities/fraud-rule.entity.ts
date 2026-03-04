import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('fraud_rules')
@Index(['active', 'priority'])
export class FraudRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  ruleType: string; // AMOUNT_ABOVE, CURRENCY, VELOCITY, etc.

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  riskScore: string; // 0-1

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
