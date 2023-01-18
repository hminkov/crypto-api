import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from './blockchain.service';
import { LatestBlockGeneralInformation } from '../../common/model/entities/LatestBlockGeneralInformation.entity';
import { LatestBlockGeneralInformationRepository } from '../../common/repositories/LatestBlockGeneralInformation.repository';
import { BlockTransactionsInformation } from '../../common/model/entities/BlockTransactionsInformation.entity';
import { BlockTransactionInformationRepository } from '../../common/repositories/BlockTransactionsInformation.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      LatestBlockGeneralInformation,
      LatestBlockGeneralInformationRepository,
      BlockTransactionsInformation,
      BlockTransactionInformationRepository,
    ]),
  ],
  providers: [BlockchainService],
  exports: [BlockchainService, TypeOrmModule],
})
export class BlockchainModule {}
