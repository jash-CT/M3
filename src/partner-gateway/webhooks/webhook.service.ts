import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Partner } from '../entities/partner.entity';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    private readonly config: ConfigService,
  ) {}

  async signPayload(partnerId: string, payload: string): Promise<string> {
    const partner = await this.partnerRepo.findOne({ where: { id: partnerId } });
    const secret = partner?.webhookSecret ?? this.config.get<string>('partnerGateway.webhookSecret', '');
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  }

  async getWebhookUrl(partnerId: string, event: string): Promise<string | null> {
    const partner = await this.partnerRepo.findOne({ where: { id: partnerId } });
    const urls = partner?.webhookUrls as Record<string, string> | null;
    return urls?.[event] ?? null;
  }
}
