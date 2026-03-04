import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Partner } from '../entities/partner.entity';
import { PARTNER_REQUEST_KEY } from '../guards/partner-api-key.guard';

export const CurrentPartner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Partner => {
    const request = ctx.switchToHttp().getRequest();
    return request[PARTNER_REQUEST_KEY];
  },
);
