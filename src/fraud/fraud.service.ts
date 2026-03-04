import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REDIS_CLIENT } from '../common/redis/redis.module';
import Redis from 'ioredis';
import { FraudRule } from './entities/fraud-rule.entity';
import { FraudEvent } from './entities/fraud-event.entity';
import { FraudBlockedError } from '../common/errors/errors';
import { PaymentType } from '../payments/entities/payment.entity';

export interface EvaluatePaymentInput {
  paymentId: string;
  customerId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  metadata?: Record<string, unknown>;
}

export interface FraudResult {
  score: number;
  blocked: boolean;
  reason?: string;
  rulesTriggered?: string[];
}

@Injectable()
export class FraudService {
  private readonly defaultThreshold: number;

  constructor(
    @InjectRepository(FraudRule)
    private readonly ruleRepo: Repository<FraudRule>,
    @InjectRepository(FraudEvent)
    private readonly eventRepo: Repository<FraudEvent>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    config: ConfigService,
  ) {
    this.defaultThreshold = config.get<number>('fraud.defaultThreshold', 0.7);
  }

  async evaluatePayment(input: EvaluatePaymentInput): Promise<FraudResult> {
    const rules = await this.getActiveRules();
    const rulesTriggered: string[] = [];
    let score = 0;

    for (const rule of rules) {
      const match = this.evaluateRule(rule, input);
      if (match) {
        rulesTriggered.push(rule.name);
        score = Math.max(score, Number(rule.riskScore));
      }
    }

    const volumeKey = `fraud:volume:${input.customerId}:${new Date().toISOString().slice(0, 13)}`;
    const count = await this.redis.incr(volumeKey);
    if (count === 1) await this.redis.expire(volumeKey, 86400);
    if (count > 10) {
      score = Math.max(score, 0.8);
      rulesTriggered.push('HIGH_VOLUME');
    }

    const blocked = score >= this.defaultThreshold;
    await this.eventRepo.insert({
      paymentId: input.paymentId,
      customerId: input.customerId,
      amount: String(input.amount),
      currency: input.currency,
      riskScore: String(score),
      blocked,
      rulesTriggered: rulesTriggered.length ? rulesTriggered : null,
    });

    return {
      score,
      blocked,
      reason: blocked ? (rulesTriggered[0] ?? 'THRESHOLD') : undefined,
      rulesTriggered: rulesTriggered.length ? rulesTriggered : undefined,
    };
  }

  private evaluateRule(rule: FraudRule, input: EvaluatePaymentInput): boolean {
    const config = (rule.config ?? {}) as Record<string, unknown>;
    if (rule.ruleType === 'AMOUNT_ABOVE' && input.amount >= Number(config?.maxAmount ?? 0))
      return true;
    if (rule.ruleType === 'CURRENCY' && (config.currencies as string[])?.includes(input.currency))
      return true;
    return false;
  }

  private async getActiveRules(): Promise<FraudRule[]> {
    return this.ruleRepo.find({ where: { active: true }, order: { priority: 'ASC' } });
  }

  fraudError(reason?: string): FraudBlockedError {
    return new FraudBlockedError(reason ? `Blocked: ${reason}` : undefined);
  }

  async listEvents(customerId: string, limit = 50): Promise<FraudEvent[]> {
    return this.eventRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
