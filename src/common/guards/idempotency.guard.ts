import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { IdempotencyService } from '../idempotency/idempotency.service';
import { IdempotencyConflictError } from '../errors/errors';
import { IdempotencyKeyHeader } from '../decorators/idempotency.decorator';

export const IDEMPOTENT_KEY = 'idempotent';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(
    private readonly idempotency: IdempotencyService,
    @Optional() private readonly reflector?: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    const key =
      request.headers[IdempotencyKeyHeader.toLowerCase()] as string | undefined;

    if (!key || key.length < 16) return true; // no key or too short: proceed

    const cached = await this.idempotency.get(key);
    if (cached) {
      response.status(cached.statusCode).json(cached.body);
      throw new IdempotencyConflictError(cached.statusCode, cached.body);
    }

    (request as { idempotencyKey?: string }).idempotencyKey = key;
    return true;
  }
}
