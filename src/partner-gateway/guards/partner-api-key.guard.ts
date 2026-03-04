import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PartnerGatewayService } from '../partner-gateway.service';
import { Partner } from '../entities/partner.entity';

export const PARTNER_REQUEST_KEY = 'partner';

@Injectable()
export class PartnerApiKeyGuard implements CanActivate {
  constructor(
    private readonly partnerGateway: PartnerGatewayService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headerName = this.config.get<string>('partnerGateway.apiKeyHeader', 'X-API-Key');
    const apiKey = request.headers[headerName?.toLowerCase()] as string | undefined;
    const partner = await this.partnerGateway.validateApiKey(apiKey ?? '');
    (request as { [PARTNER_REQUEST_KEY]: Partner })[PARTNER_REQUEST_KEY] = partner;
    return true;
  }
}
