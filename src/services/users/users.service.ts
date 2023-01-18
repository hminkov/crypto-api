import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BlockTransactionsInformation } from 'src/common/model/entities/BlockTransactionsInformation.entity';
import { BlockTransactionInformationRepository } from '../../common/repositories/BlockTransactionsInformation.repository';
import { LatestBlockGeneralInformation } from 'src/common/model/entities/LatestBlockGeneralInformation.entity';
import { LatestBlockGeneralInformationRepository } from '../../common/repositories/LatestBlockGeneralInformation.repository';
import { UserInfo } from '../../common/model/entities/UserInfo.entity';
import { UserInfoRepository } from '../../common/repositories/UserInfo.repository';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserInfo) // this is used to inject the UserInfoRepository into the UsersService from the UsersModule
    private readonly userInfoRepository: UserInfoRepository, // private readonly userInfoRepository: UserInfoRepository,
    @InjectRepository(LatestBlockGeneralInformationRepository)
    private readonly latestBlockGeneralInformationRepository: LatestBlockGeneralInformationRepository,
    @InjectRepository(BlockTransactionInformationRepository)
    private readonly blockTransactionRepository: BlockTransactionInformationRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async recordRequest(ip: string, browser: string, timestamp: Date) {
    try {
      // Record the request in the 'request_stats' table
      const requestStat = new UserInfo(ip, browser, timestamp);
      this.logger.log(`${this.recordRequest.name}: ${requestStat}`);
      this.logger.log('TEST RECORD REQUEST');
      await this.userInfoRepository.save([requestStat]);
    } catch (error) {
      this.logger.error(
        `${this.recordRequest.name}: Error recording request: ${error}`,
      );
    }
  }

  async getLatestBlockData(): Promise<LatestBlockGeneralInformation> {
    this.logger.log('----GETTING LATEST BLOCK DATA----');
    const cachedData = (await this.cacheManager.get(
      'latest-block',
    )) as LatestBlockGeneralInformation;
    this.logger.log(
      'cachedData USER SERVICE LATEST BLOCK:',
      JSON.stringify(cachedData),
    );
    if (cachedData) {
      this.logger.log('Returning data from cache:', JSON.stringify(cachedData));
      return cachedData;
    } else {
      const latestBlock =
        await this.latestBlockGeneralInformationRepository.find({
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
    try {
      this.logger.log('---- GETTING TRANSACTION DATA ----');

      const transactionData = await this.blockTransactionRepository.findOne({
        where: {
          transactionHash: hash,
        },
      });

      if (!transactionData) {
        throw new NotFoundException(`Transaction with hash ${hash} not found`);
      }

      this.logger.log('transactionData:', JSON.stringify(transactionData));
      return transactionData;
    } catch (e) {
      this.logger.log('Error in getTransactionData:', e);
    }
  }
}
