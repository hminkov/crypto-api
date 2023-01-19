import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BlockTransaction } from 'src/blockchain/entities/blocktransaction.entity';
import { LatestBlock } from 'src/blockchain/entities/latestblock.entity';
import { LatestBlockRepository } from 'src/blockchain/repository/latestblock.repository';
import { RequestStat } from './entities/requeststat.entity';
import { RequestStatRepository } from './repository/requeststat.repository';
import { BlockTransactionRepository } from '../blockchain/repository/blocktransaction.repository';
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
    this.logger.log(JSON.stringify(requestStat));

    await this.requestStatRepository.save([requestStat]);
  }

  async getLatestBlockData(): Promise<LatestBlock> {
    this.logger.log('----GETTING LATEST BLOCK ----');
    const cachedData = (await this.cacheManager.get(
      'latest-block',
    )) as LatestBlock;
    if (cachedData) {
      this.logger.log('Returning latest block from cache:', cachedData);
      return cachedData;
    } else {
      const latestBlock = await this.latestBlockRepository.find({
        order: {
          blockHeight: 'DESC',
        },
      });
      // if we don't have the latest block in the cache, find it in the database and store it in the cache for 30 seconds
      await this.cacheManager.set('latest-block', latestBlock, 30000);

      // return the latest block from the database
      this.logger.log('Returning latest block from DB:', latestBlock[0]);
      return latestBlock[0];
    }
  }

  async getTransactionData(hash: string) {
    this.logger.log('---- GETTING TRANSACTION BY HASH ----');
    const cachedData = await this.cacheManager.get(hash);
    if (cachedData) {
      this.logger.log('Returning transaction from cache:', cachedData);
      return cachedData;
    } else {
      const transactionData = await this.blockTransactionRepository.findOne({
        where: {
          transactionHash: hash,
        },
      });
      if (!transactionData) {
        throw new NotFoundException(`Transaction with hash ${hash} not found`);
      }
      await this.cacheManager.set(hash, transactionData, 30000);
      this.logger.log('Returning transaction from DB::', transactionData);
      return transactionData;
    }
  }
}
