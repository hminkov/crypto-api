import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { BlockTransaction } from './common/model/entities/BlockchainTransaction.entity';
import { RequestStat } from './common/model/entities/UserInfo.entity';
import { LatestBlock } from './common/model/entities/LatestBlock.entity';
import { UsersModule } from './services/users/users.module';
import { BlockchainModule } from './services/blockchain/blockchain.module';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';
import { SlackModule } from './services/slack/slack.module';

const { HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, REDIS_PORT } =
  process.env;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: HOST || 'localhost',
      port: REDIS_PORT,
    }),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: HOST || 'localhost',
      port: +DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      entities: [BlockTransaction, RequestStat, LatestBlock],
      synchronize: true,
    }),
    UsersModule,
    BlockchainModule,
    SlackModule,
  ],
})
export class AppModule {}
