import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { BlockTransaction } from 'src/blockchain/entities/blocktransaction.entity';
import { LatestBlock } from 'src/blockchain/entities/latestblock.entity';
import { BlockTransactionRepository } from 'src/blockchain/repository/blocktransaction.repository';
import { LatestBlockRepository } from 'src/blockchain/repository/latestblock.repository';
import { RequestStat } from './entities/requeststat.entity';
import { RequestStatRepository } from './repository/requeststat.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestStat, RequestStatRepository]),
    BlockchainModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
