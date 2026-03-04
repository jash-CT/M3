import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardStatus, CardType } from './entities/card.entity';
import { CardProgram } from './entities/card-program.entity';
import { AuditService } from '../common/audit/audit.service';
import { KycAmlService } from '../kyc-aml/kyc-aml.service';

export interface IssueCardInput {
  customerId: string;
  programId: string;
  type: CardType;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(CardProgram)
    private readonly programRepo: Repository<CardProgram>,
    private readonly audit: AuditService,
    private readonly kycAml: KycAmlService,
  ) {}

  async issue(input: IssueCardInput): Promise<Card> {
    await this.kycAml.assertKycApproved(input.customerId);
    await this.kycAml.assertAmlCleared(input.customerId);

    const program = await this.programRepo.findOne({
      where: { id: input.programId, active: true },
    });
    if (!program) throw new NotFoundException('Card program not found');

    const lastFour = this.generateLastFour();
    const card = this.cardRepo.create({
      customerId: input.customerId,
      programId: input.programId,
      type: input.type,
      status: CardStatus.PENDING,
      lastFour,
      partnerCardId: `CARD-${uuidv4().slice(0, 8)}-${Date.now()}`, // placeholder until partner issue
      expiryMonth: '12',
      expiryYear: String(new Date().getFullYear() + 3),
      metadata: input.metadata ?? undefined,
    });
    await this.cardRepo.save(card);

    await this.audit.log({
      entityType: 'Card',
      entityId: card.id,
      action: 'ISSUED',
      payload: { type: input.type, programId: input.programId },
    });

    return card;
  }

  private generateLastFour(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  async getById(id: string): Promise<Card> {
    const card = await this.cardRepo.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  async listByCustomer(customerId: string): Promise<Card[]> {
    return this.cardRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    status: CardStatus.ACTIVE | CardStatus.FROZEN | CardStatus.BLOCKED,
  ): Promise<Card> {
    const card = await this.getById(id);
    card.status = status;
    if (status === CardStatus.ACTIVE && !card.activatedAt)
      card.activatedAt = new Date();
    await this.cardRepo.save(card);
    await this.audit.log({
      entityType: 'Card',
      entityId: id,
      action: 'STATUS_CHANGED',
      payload: { status },
    });
    return card;
  }

  async createProgram(name: string, partnerProgramId?: string): Promise<CardProgram> {
    const program = this.programRepo.create({
      name,
      partnerProgramId: partnerProgramId ?? undefined,
      active: true,
    });
    await this.programRepo.save(program);
    return program;
  }

  async listPrograms(): Promise<CardProgram[]> {
    return this.programRepo.find({ where: { active: true } });
  }
}
