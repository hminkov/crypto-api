import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from './blockchain.service';
import { BlockTransaction } from '../../common/model/entities/BlockchainTransaction.entity';
import { LatestBlock } from '../../common/model/entities/LatestBlock.entity';
import { BlockTransactionRepository } from '../../common/repositories/BlockTransaction.repository';
import { LatestBlockRepository } from '../../common/repositories/LatestBlock.repository';
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
