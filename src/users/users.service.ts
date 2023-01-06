import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockTransaction } from 'src/blockchain/entities/blocktransaction.entity';
import { LatestBlock } from 'src/blockchain/entities/latestblock.entity';
import { LatestBlockRepository } from 'src/blockchain/repository/latestblock.repository';
import { RequestStat } from './entities/requeststat.entity';
import { RequestStatRepository } from './repository/requeststat.repository';
import { BlockTransactionRepository } from '../blockchain/repository/blocktransaction.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(RequestStat) // this is used to inject the RequestStatRepository into the UsersService from the UsersModule
    private readonly requestStatRepository: RequestStatRepository, // private readonly blockTransactionRepository: BlockTransactionRepository,
    @InjectRepository(LatestBlock)
    private readonly latestBlockRepository: LatestBlockRepository,
    @InjectRepository(BlockTransaction)
    private readonly blockTransactionRepository: BlockTransactionRepository,
  ) {}

  async recordRequest(ip: string, browser: string, timestamp: Date) {
    // Record the request in the 'request_stats' table
    const requestStat = new RequestStat(ip, browser, timestamp);
    console.log(requestStat);

    await this.requestStatRepository.save([requestStat]);

    // Retrieve the blockchain data from the 'block_transactions' table
    // const blockchainData = await this.blockTransactionRepository.find();
  }

  async getLatestBlockData(): Promise<LatestBlock> {
    console.log('I AM GETTING THE LAST BLOCK');

    const latestBlock = await this.latestBlockRepository.find({
      order: {
        blockHeight: 'DESC',
      },
    });
    console.log('latestBlock:', latestBlock[1]);

    return latestBlock[0];
  }

  async getTransactionData(hash: string) {
    console.log('I AM GETTING THE TRANSACTION DATA');

    const transactionData = await this.blockTransactionRepository.findOne({
      where: {
        transactionHash: hash,
      },
    });

    if (!transactionData) {
      throw new NotFoundException(`Transaction with hash ${hash} not found`);
    }

    console.log('transactionData:', transactionData);
    return transactionData;
  }
}
