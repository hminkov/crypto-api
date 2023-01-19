import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockTransaction } from './entities/blocktransaction.entity';
import { BlockTransactionRepository } from './repository/blocktransaction.repository';
import { LatestBlock } from './entities/latestblock.entity';
import { LatestBlockRepository } from './repository/latestblock.repository';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';

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

  async getBlockDataFromAPI() {
    //Make a request to the BTC Testnet API to get the latest block information
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

      //After storing the latest block, store it in the cache for 30 seconds
      await this.cacheManager.set('latest-block', latestBlock, 30000);
      const test = (await this.cacheManager.get('latest-block')) as LatestBlock;
      this.logger.log(`${fnName} cachedData: ${JSON.stringify(test)}`);
    } catch (error) {
      this.logger.log(`${fnName}: ${error}`);
    }
  }

  async storeBlockDataInDB(latestBlockCtx: any) {
    fnName = this.storeBlockDataInDB.name;
    //Check if the latest block has more than one transaction
    if (latestBlockCtx.nTx === '1') {
      throw new Error(
        `${fnName}: Block ${latestBlockCtx.height} has only one transaction`,
      );
    }

    let i = 0;
    try {
      latestBlockCtx['txs'].forEach((txs) => {
        this.logger.log(
          `${fnName} - Trying to save transaction ${i} to the DB)`,
        );
        let firstTransaction = txs[i];
        let latestBlockHeight = latestBlockCtx.height;
        let btcSent = firstTransaction.outputs[0].value;
        let transactionHash = firstTransaction.hash;
        let senderAddress = firstTransaction.inputs[0].coin.address;
        let receiverAddress = firstTransaction.outputs[0].address;

        if (!senderAddress) {
          senderAddress.senderAddress = 'Coinbase';
          btcSent = 0;
        }

        const blockTransaction = new BlockTransaction(
          latestBlockHeight,
          transactionHash,
          senderAddress,
          receiverAddress,
          btcSent,
        );

        if (blockTransaction.receiver) {
          this.blockTransactionRepository.save([blockTransaction]);
          this.logger.log(
            `${fnName} - Transaction ${i} saved to DB: ${JSON.stringify(
              blockTransaction,
            )}`,
          );
        } else {
          this.logger.error(
            `${fnName}: No receiver found for Transaction ${i}`,
          );
        }
        i++;
      });
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

  //Store the block information in the 'block_transactions' and 'latest_block' tables in every 2 minutes
  @Cron('*/2 * * * *')
  async handleCronJob() {
    try {
      //Retrieve the latest block data from TATUM API
      const latestBlockCtx = await this.getBlockDataFromAPI();
      //Check if the latest block is already stored in the database
      const existing = await this.checkIfBlockExists(latestBlockCtx);
      //If the latest block is not stored in the database, store it
      if (existing === false) {
        this.storeLatestBlockInDB(latestBlockCtx);
        this.storeBlockDataInDB(latestBlockCtx);
      } else {
        this.logger.log(`Block ${latestBlockCtx.height} already stored`);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
