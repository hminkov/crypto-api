import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockTransaction } from './entities/blocktransaction.entity';
import { BlockTransactionRepository } from './repository/blocktransaction.repository';
import { LatestBlock } from './entities/latestblock.entity';
import { LatestBlockRepository } from './repository/latestblock.repository';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import logger from 'src/logger';

const options = {
  headers: { 'x-api-key': process.env.DB_API_KEY },
};

@Injectable()
export class BlockchainService {
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

    const latestBlockCtx = await axios
      .get(
        `https://api.tatum.io/v3/bitcoin/block/${bestBlockHash}?type=testnet`,
        options,
      )
      .then((response) => {
        return response.data;
      });

    return latestBlockCtx;
  }

  async storeLatestBlock(latestBlockCtx: any) {
    logger.info('---- STORING LATEST BLOCK ----');
    try {
      const latestBlock = new LatestBlock(
        latestBlockCtx.hash,
        latestBlockCtx.height,
      );

      // store the latest block in the database
      await this.latestBlockRepository.save([latestBlock]);

      // after storing the latest block, store it in the cache
      await this.cacheManager.set('latest-block', latestBlock, 60);
      const test = (await this.cacheManager.get('latest-block')) as LatestBlock;
      logger.info('cachedData LATEST BLOCK:', test);
    } catch (error) {
      // if there is an error, return the error
      return error;
    }
  }

  async storeBlockData(latestBlockCtx: any) {
    logger.info('---- STORING BLOCK DATA ----');
    let amountSent = 0;
    const firstTransaction = latestBlockCtx.txs[1];

    if ((latestBlockCtx.nTx = '1')) {
      return new Error('No transactions found');
    }

    firstTransaction['outputs'].forEach(function (output) {
      amountSent += output['value'];
    });

    const blockTransaction = new BlockTransaction(
      latestBlockCtx.height,
      firstTransaction.hash,
      firstTransaction.inputs[0].coin.address,
      firstTransaction.outputs[0].address,
      amountSent,
    );
    logger.info(blockTransaction);

    // Since not every block has a receiver and the database cannot accept null values,
    // we need to check if there is a receiver
    if (blockTransaction.receiver) {
      await this.blockTransactionRepository.save([blockTransaction]);
    } else {
      return new Error('No receiver found');
    }
  }

  async checkIfBlockExists(latestBlockCtx: any): Promise<boolean> {
    try {
      const blockChecker = await this.latestBlockRepository.findOne({
        where: {
          blockHeight: latestBlockCtx.height,
        },
      });
      if (blockChecker !== null) {
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  // Store the block information in the 'block_transactions' table in every 2 minutes
  @Cron('*/1 * * * *')
  async handleCronJob() {
    try {
      // Retrieve the latest block data
      const latestBlockCtx = await this.getBlockDataFromAPI();
      //Check if the latest block is already stored in the database
      const existing = await this.checkIfBlockExists(latestBlockCtx);

      if (existing === false) {
        //If the latest block is not stored in the database, store it in the 'latest_block' table
        this.storeLatestBlock(latestBlockCtx);
        //If the block data is not stored in the database, store it in the 'block_transactions' table
        this.storeBlockData(latestBlockCtx);
      } else {
        logger.info(`Block ${latestBlockCtx.height} already stored`);
      }
    } catch (error) {
      logger.error(error);
    }
  }
}
