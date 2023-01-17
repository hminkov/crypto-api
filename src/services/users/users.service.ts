import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BlockTransaction } from 'src/common/model/entities/BlockchainTransaction.entity';
import { LatestBlock } from 'src/common/model/entities/LatestBlock.entity';
import { LatestBlockRepository } from '../../common/repositories/LatestBlock.repository';
import { RequestStat } from '../../common/model/entities/UserInfo.entity';
import { RequestStatRepository } from '../../common/repositories/UserInfo.repository';
import { BlockTransactionRepository } from '../../common/repositories/BlockTransaction.repository';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(RequestStat) // this is used to inject the RequestStatRepository into the UsersService from the UsersModule
    private readonly requestStatRepository: RequestStatRepository, // private readonly blockTransactionRepository: BlockTransactionRepository,
    @InjectRepository(LatestBlock)
    private readonly latestBlockRepository: LatestBlockRepository,
    @InjectRepository(BlockTransaction)
    private readonly blockTransactionRepository: BlockTransactionRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async recordRequest(ip: string, browser: string, timestamp: Date) {
    // Record the request in the 'request_stats' table
    const requestStat = new RequestStat(ip, browser, timestamp);
    console.log(requestStat);

    await this.requestStatRepository.save([requestStat]);
  }

  async getLatestBlockData(): Promise<LatestBlock> {
    this.logger.log('----GETTING LATEST BLOCK DATA----');
    const cachedData = (await this.cacheManager.get(
      'latest-block',
    )) as LatestBlock;
    this.logger.log('cachedData USER SERVICE LATEST BLOCK:', cachedData);
    if (cachedData) {
      this.logger.log('Returning data from cache:', cachedData);
      return cachedData;
    } else {
      const latestBlock = await this.latestBlockRepository.find({
        order: {
          blockHeight: 'DESC',
        },
      });
      // if we don't have the latest block in the cache, find it in the database and store it in the cache
      await this.cacheManager.set('latest-block', latestBlock, 60);

      // return the latest block from the database
      this.logger.log(
        'Returning data from database LatestBlock:',
        latestBlock[0],
      );
      return latestBlock[0];
    }
  }

  async getTransactionData(hash: string) {
    this.logger.log('---- GETTING TRANSACTION DATA ----');

    const transactionData = await this.blockTransactionRepository.findOne({
      where: {
        transactionHash: hash,
      },
    });

    if (!transactionData) {
      throw new NotFoundException(`Transaction with hash ${hash} not found`);
    }

    this.logger.log('transactionData:', transactionData);
    return transactionData;
  }
}
