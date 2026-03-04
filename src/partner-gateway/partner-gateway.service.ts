import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Partner } from './entities/partner.entity';

@Injectable()
export class PartnerGatewayService {
  private readonly apiKeyHeader: string;

  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    config: ConfigService,
  ) {
    this.apiKeyHeader = config.get<string>('partnerGateway.apiKeyHeader', 'X-API-Key');
  }

  async validateApiKey(apiKey: string): Promise<Partner> {
    if (!apiKey) throw new UnauthorizedException('Missing API key');
    const partners = await this.partnerRepo.find({ where: { active: true } });
    for (const partner of partners) {
      const match = await bcrypt.compare(apiKey, partner.apiKeyHash);
      if (match) return partner;
    }
    throw new UnauthorizedException('Invalid API key');
  }

  private async hashKey(key: string): Promise<string> {
    return bcrypt.hash(key, 10);
  }

  async createPartner(
    name: string,
    code: string,
    apiKey: string,
    allowedEndpoints?: string[],
  ): Promise<Partner> {
    const hash = await this.hashKey(apiKey);
    const partner = this.partnerRepo.create({
      name,
      code,
      apiKeyHash: hash,
      active: true,
      allowedEndpoints: allowedEndpoints ?? ['payments', 'cards', 'kyc-aml'],
    });
    await this.partnerRepo.save(partner);
    return partner;
  }

  async getPartnerById(id: string): Promise<Partner | null> {
    return this.partnerRepo.findOne({ where: { id } });
  }

  async getPartnerByCode(code: string): Promise<Partner | null> {
    return this.partnerRepo.findOne({ where: { code, active: true } });
  }

  canAccess(partner: Partner, endpoint: string): boolean {
    const allowed = partner.allowedEndpoints as string[] | null;
    if (!allowed || allowed.length === 0) return true;
    return allowed.some((e) => endpoint.startsWith(e) || endpoint === e);
  }
}
