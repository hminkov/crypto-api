import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { BlockTransaction } from './entities/blocktransaction.entity';
import { RequestStat } from './entities/requestStat.entity';
import { ScheduleModule } from '@nestjs/schedule';

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
      entities: [BlockTransaction, RequestStat],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([BlockTransaction, RequestStat]),
    ScheduleModule.forRoot(),
  ],
  controllers: [BlockchainController],
  providers: [BlockchainService],
})
export class AppModule {}
