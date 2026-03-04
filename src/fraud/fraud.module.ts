import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudRule } from './entities/fraud-rule.entity';
import { FraudEvent } from './entities/fraud-event.entity';
import { FraudService } from './fraud.service';
import { FraudController } from './fraud.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FraudRule, FraudEvent])],
  controllers: [FraudController],
  providers: [FraudService],
  exports: [FraudService],
})
export class FraudModule {}
