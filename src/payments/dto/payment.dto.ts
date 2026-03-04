import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({ example: '100.00' })
  @IsString()
  amount: string;

  @ApiProperty({ example: 'USD', minLength: 3, maxLength: 3 })
  @IsString()
  currency: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalReference?: string;
}
