import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AmlCheckType {
  SANCTIONS = 'SANCTIONS',
  PEP = 'PEP',
  ADVERSE_MEDIA = 'ADVERSE_MEDIA',
  TRANSACTION_MONITOR = 'TRANSACTION_MONITOR',
}

@Entity('aml_checks')
@Index(['customerId', 'type'])
@Index(['createdAt'])
export class AmlCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column({ type: 'varchar', length: 32 })
  type: AmlCheckType;

  @Column({ default: 'PASS' }) // PASS, FLAG, FAIL
  result: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  score: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown>;

  @Column({ nullable: true })
  providerReference: string;

  @CreateDateColumn()
  createdAt: Date;
}
