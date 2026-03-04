import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';

export interface AuditContext {
  entityType: string;
  entityId: string;
  action: string;
  payload?: Record<string, unknown>;
  actorId?: string;
  actorType?: string;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(ctx: AuditContext): Promise<void> {
    await this.repo.insert({
      entityType: ctx.entityType,
      entityId: ctx.entityId,
      action: ctx.action,
      payload: ctx.payload as object,
      actorId: ctx.actorId,
      actorType: ctx.actorType,
      ipAddress: ctx.ipAddress,
    });
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.repo.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
