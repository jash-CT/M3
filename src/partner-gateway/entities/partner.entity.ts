import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('partners')
@Index(['apiKeyHash'], { unique: true })
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string; // unique identifier for routing

  @Column()
  apiKeyHash: string; // hashed API key for auth

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  allowedEndpoints: string[]; // e.g. ['payments', 'cards']

  @Column({ type: 'jsonb', nullable: true })
  webhookUrls: Record<string, string>; // event -> url

  @Column({ nullable: true })
  webhookSecret: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
