import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { BlockTransaction } from './blockchain/entities/blocktransaction.entity';
import { RequestStat } from './users/entities/requeststat.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { LatestBlock } from './blockchain/entities/latestblock.entity';
import { UsersModule } from './users/users.module';
import { BlockchainModule } from './blockchain/blockchain.module';
@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'crypto_api',
      entities: [BlockTransaction, RequestStat, LatestBlock],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    BlockchainModule,
  ],
})
export class AppModule {}
