import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { CardProgram } from './entities/card-program.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { KycAmlModule } from '../kyc-aml/kyc-aml.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, CardProgram]),
    KycAmlModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
