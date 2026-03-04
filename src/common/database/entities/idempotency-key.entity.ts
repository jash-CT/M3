import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('idempotency_keys')
@Index(['expiresAt'])
export class IdempotencyKey {
  @PrimaryColumn()
  key: string;

  @Column()
  responseStatusCode: number;

  @Column({ type: 'jsonb' })
  responseBody: Record<string, unknown>;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
