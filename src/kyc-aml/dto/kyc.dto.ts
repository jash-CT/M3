import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { VerificationType, VerificationStatus } from '../entities/kyc-verification.entity';
import { AmlCheckType } from '../entities/aml-check.entity';

export class GetOrCreateCustomerDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  externalUserId: string;
}

export class StartVerificationDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ enum: VerificationType })
  @IsEnum(VerificationType)
  type: VerificationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  providerPayload?: Record<string, unknown>;
}

export class CompleteVerificationDto {
  @ApiProperty({ enum: [VerificationStatus.APPROVED, VerificationStatus.REJECTED] })
  @IsEnum(VerificationStatus)
  status: VerificationStatus.APPROVED | VerificationStatus.REJECTED;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  providerResponse?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerReference?: string;
}

export class RecordAmlCheckDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ enum: AmlCheckType })
  @IsEnum(AmlCheckType)
  type: AmlCheckType;

  @ApiProperty({ enum: ['PASS', 'FLAG', 'FAIL'] })
  @IsEnum(['PASS', 'FLAG', 'FAIL'])
  result: 'PASS' | 'FLAG' | 'FAIL';

  @ApiPropertyOptional()
  @IsOptional()
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerReference?: string;
}
