import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from './blockchain.service';
import { BlockTransaction } from './entities/blocktransaction.entity';
import { LatestBlock } from './entities/latestblock.entity';
import { BlockTransactionRepository } from './repository/blocktransaction.repository';
import { LatestBlockRepository } from './repository/latestblock.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlockTransaction,
      LatestBlock,
      BlockTransactionRepository,
      LatestBlockRepository,
    ]),
  ],
  providers: [BlockchainService],
  exports: [BlockchainService, TypeOrmModule],
})
export class BlockchainModule {}
