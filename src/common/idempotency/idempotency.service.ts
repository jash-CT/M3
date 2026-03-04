import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyKey } from '../database/entities/idempotency-key.entity';

@Injectable()
export class IdempotencyService {
  private readonly ttlSeconds: number;

  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly repo: Repository<IdempotencyKey>,
    config: ConfigService,
  ) {
    this.ttlSeconds = config.get<number>('idempotency.ttlSeconds', 86400);
  }

  async get(key: string): Promise<{ statusCode: number; body: unknown } | null> {
    const row = await this.repo.findOne({ where: { key } });
    if (!row || new Date() > row.expiresAt) return null;
    return { statusCode: row.responseStatusCode, body: row.responseBody };
  }

  async set(
    key: string,
    statusCode: number,
    body: Record<string, unknown>,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);
    await this.repo.upsert(
      { key, responseStatusCode: statusCode, responseBody: body as object, expiresAt },
      { conflictPaths: ['key'] },
    );
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
    return result.affected ?? 0;
  }
}
