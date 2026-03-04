import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum VerificationType {
  IDENTITY = 'IDENTITY',
  ADDRESS = 'ADDRESS',
  SELFIE = 'SELFIE',
  DOCUMENT = 'DOCUMENT',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('kyc_verifications')
@Index(['customerId', 'type'])
export class KycVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column({ type: 'varchar', length: 32 })
  type: VerificationType;

  @Column({ type: 'varchar', length: 32 })
  status: VerificationStatus;

  @Column({ type: 'jsonb', nullable: true })
  providerPayload: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  providerResponse: Record<string, unknown>;

  @Column({ nullable: true })
  providerReference: string;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
