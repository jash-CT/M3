import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CardType {
  VIRTUAL = 'VIRTUAL',
  PHYSICAL = 'PHYSICAL',
}

export enum CardStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED',
}

@Entity('cards')
@Index(['customerId'])
@Index(['lastFour', 'programId'])
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  programId: string;

  @Column({ type: 'varchar', length: 16 })
  type: CardType;

  @Column({ type: 'varchar', length: 32, default: CardStatus.PENDING })
  status: CardStatus;

  @Column({ length: 4 })
  lastFour: string;

  @Column({ nullable: true })
  partnerCardId: string;

  @Column({ nullable: true })
  expiryMonth: string;

  @Column({ nullable: true })
  expiryYear: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ nullable: true })
  activatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
