import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum KycTier {
  NONE = 'NONE',
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
}

@Entity('kyc_customers')
@Index(['externalUserId'])
export class KycCustomer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  externalUserId: string;

  @Column({ type: 'varchar', length: 64, default: KycTier.NONE })
  tier: KycTier;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, IN_REVIEW, APPROVED, REJECTED

  @Column({ type: 'jsonb', nullable: true })
  profile: Record<string, unknown>;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  amlRiskScore: string; // 0-1

  @Column({ default: false })
  amlCleared: boolean;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
