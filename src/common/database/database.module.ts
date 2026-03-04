import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuditLog } from './entities/audit-log.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        ssl: config.get('database.ssl'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'development', // use migrations in prod
        logging: config.get('nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([AuditLog, IdempotencyKey]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
