import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { BlockTransaction } from './blockchain/entities/blocktransaction.entity';
import { RequestStat } from './users/entities/requeststat.entity';
import { LatestBlock } from './blockchain/entities/latestblock.entity';
import { UsersModule } from './users/users.module';
import { BlockchainModule } from './blockchain/blockchain.module';

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_HOST,
      port: +DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      entities: [BlockTransaction, RequestStat, LatestBlock],
      synchronize: true,
    }),
    UsersModule,
    BlockchainModule,
  ],
})
export class AppModule {}
