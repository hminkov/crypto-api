import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockTransaction } from './entities/blocktransaction.entity';
import { BlockTransactionRepository } from './repository/blocktransaction.repository';
import { LatestBlock } from './entities/latestblock.entity';
import { LatestBlockRepository } from './repository/latestblock.repository';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { retry } from 'rxjs';

const options = {
  headers: { 'x-api-key': process.env.DB_API_KEY },
};
let fnName;

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(BlockTransaction)
    private readonly blockTransactionRepository: BlockTransactionRepository,
    @InjectRepository(LatestBlock)
    private readonly latestBlockRepository: LatestBlockRepository,
  ) {}

  //TODO - add caching
  async getBlockDataFromAPI() {
    // Make a request to the BTC Testnet API to get the latest block information
    const bestBlockHash = await axios
      .get('https://api.tatum.io/v3/bitcoin/info?type=testnet', options)
      .then((response) => {
        return response.data.bestblockhash;
      });

    try {
      const latestBlockCtx = await axios
        .get(
          `https://api.tatum.io/v3/bitcoin/block/${bestBlockHash}?type=testnet`,
          options,
        )
        .then((response) => {
          return response.data;
        });
      return latestBlockCtx;
    } catch (error) {
      this.logger.warn('Error getting block data from API');
    }
  }

  async storeLatestBlockInDB(latestBlockCtx: any) {
    fnName = this.storeLatestBlockInDB.name;
    this.logger.log(`${fnName} ---- STORING LATEST BLOCK ----`);
    try {
      const latestBlock = new LatestBlock(
        latestBlockCtx.hash,
        latestBlockCtx.height,
      );

      //Store the latest block in the database
      await this.latestBlockRepository.save([latestBlock]);

      //After storing the latest block, store it in the cache
      await this.cacheManager.set('latest-block', latestBlock, 60);
      const test = (await this.cacheManager.get('latest-block')) as LatestBlock;
      this.logger.log(`${fnName} cachedData: ${JSON.stringify(test)}`);
    } catch (error) {
      this.logger.log(`${fnName}: ${error}`);
    }
  }

  async storeBlockDataInDB(latestBlockCtx: any) {
    fnName = this.storeBlockDataInDB.name;
    if (latestBlockCtx.nTx === '1') {
      throw new Error(`${fnName}: No transactions found`);
    }

    try {
      let firstTransaction;
      let amountSent;
      let latestBlockHeight;
      let transactionHash;
      let senderAddress;
      let receiverAddress;
      let i = 1;
      do {
        this.logger.log(`${fnName}: ---- STORING BLOCK DATA ----`);

        firstTransaction = latestBlockCtx.txs[i];
        amountSent = firstTransaction.outputs[0].value;
        latestBlockHeight = latestBlockCtx.height;
        transactionHash = firstTransaction.hash;
        senderAddress = firstTransaction.inputs[0].coin.address;
        receiverAddress = firstTransaction.outputs[0].address;

        const blockTransaction = new BlockTransaction(
          latestBlockHeight,
          transactionHash,
          senderAddress,
          receiverAddress,
          amountSent,
        );
        this.logger.log(`${fnName}: ${JSON.stringify(blockTransaction)}`);
        //Not every block has a receiver and the database cannot accept null values,
        //therefore check if there is a receiver
        if (blockTransaction.receiver) {
          await this.blockTransactionRepository.save([blockTransaction]);
        } else {
          this.logger.error(`${fnName}: No receiver found in iteration ${i}`);
        }
        i++;
      } while (senderAddress === null || receiverAddress === null);
    } catch (error) {
      return this.logger.error(`${fnName}: ${error}`);
    }
  }

  async checkIfBlockExists(latestBlockCtx: any): Promise<boolean> {
    try {
      const blockChecker = await this.latestBlockRepository.exist({
        where: {
          blockHeight: latestBlockCtx.height,
        },
      });
      return blockChecker;
    } catch (error) {
      this.logger.error(error);
    }
  }

  //Store the block information in the 'block_transactions' table in every 2 minutes
  @Cron('*/2 * * * *')
  async handleCronJob() {
    try {
      //Retrieve the latest block data from TATUM
      const latestBlockCtx = await this.getBlockDataFromAPI();
      //Check if the latest block is already stored in the database
      const existing = await this.checkIfBlockExists(latestBlockCtx);

      if (existing === false) {
        this.storeLatestBlockInDB(latestBlockCtx);
        this.storeBlockDataInDB(latestBlockCtx);
      } else {
        this.logger.warn(`Block ${latestBlockCtx.height} already stored`);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
