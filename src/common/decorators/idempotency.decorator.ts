import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IdempotencyKeyHeader = 'Idempotency-Key';

export const IdempotencyKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers[IdempotencyKeyHeader.toLowerCase()] as
      | string
      | undefined;
  },
);
