import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { CardStatus, CardType } from '../entities/card.entity';

export class IssueCardDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty()
  @IsUUID()
  programId: string;

  @ApiProperty({ enum: CardType })
  @IsEnum(CardType)
  type: CardType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateCardStatusDto {
  @ApiProperty({ enum: [CardStatus.ACTIVE, CardStatus.FROZEN, CardStatus.BLOCKED] })
  @IsEnum(CardStatus)
  status: CardStatus.ACTIVE | CardStatus.FROZEN | CardStatus.BLOCKED;
}
