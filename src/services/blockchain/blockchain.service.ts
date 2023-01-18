import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockTransactionsInformation } from '../../common/model/entities/BlockTransactionsInformation.entity';
import { BlockTransactionInformationRepository } from '../../common/repositories/BlockTransactionsInformation.repository';
import { LatestBlockGeneralInformation } from '../../common/model/entities/LatestBlockGeneralInformation.entity';
import { LatestBlockGeneralInformationRepository } from '../../common/repositories/LatestBlockGeneralInformation.repository';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';

const options = {
  headers: { 'x-api-key': process.env.DB_API_KEY },
};

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(BlockTransactionInformationRepository)
    private readonly blockTransactionInformationRepository: BlockTransactionInformationRepository,
    @InjectRepository(LatestBlockGeneralInformationRepository)
    private readonly latestBlockGeneralInformationRepository: LatestBlockGeneralInformationRepository,
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
      this.logger.error(
        `${this.getBlockDataFromAPI.name}: Error getting block data from API: ${error}`,
      );
      //retrying the request
      this.getBlockDataFromAPI();
    }
  }

  async storeLatestBlockGeneralInformation(latestBlockCtx: any) {
    this.logger.log(
      `${this.storeLatestBlockGeneralInformation.name}: ---- STORING LATEST BLOCK ----`,
    );
    try {
      const latestBlockGeneralInformation = new LatestBlockGeneralInformation(
        latestBlockCtx.hash,
        latestBlockCtx.height,
      );

      // store the latest block in the database
      this.logger.log('STORING LATEST BLOCK IN DB');
      await this.latestBlockGeneralInformationRepository.save([
        latestBlockGeneralInformation,
      ]);

      // after storing the latest block, store it in the cache
      this.logger.log('STORING LATEST BLOCK IN CACHE');
      await this.cacheManager.set(
        'latest-block',
        latestBlockGeneralInformation,
        60,
      );
      const test = (await this.cacheManager.get(
        'latest-block',
      )) as LatestBlockGeneralInformation;
      this.logger.log(
        `${
          this.storeLatestBlockGeneralInformation.name
        }: cachedData LATEST BLOCK: ${JSON.stringify(test)}`,
      );
    } catch (error) {
      // if there is an error, return the error
      return new Error(error);
    }
  }

  async storeBlockData(latestBlockCtx: any) {
    let fnName = this.storeBlockData.name;
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

        // let amountSent = 0;
        // firstTransaction['outputs'].forEach(function (output) {
        //   amountSent += output['value'];
        // });

        firstTransaction = latestBlockCtx.txs[i];
        amountSent = firstTransaction.outputs[0].value;
        latestBlockHeight = latestBlockCtx.height;
        transactionHash = firstTransaction.hash;
        senderAddress = firstTransaction.inputs[0].coin.address;
        receiverAddress = firstTransaction.outputs[0].address;

        const blockTransactionInformation = new BlockTransactionsInformation(
          latestBlockHeight,
          transactionHash,
          senderAddress,
          receiverAddress,
          amountSent,
        );
        this.logger.log(
          `${fnName}: ${JSON.stringify(blockTransactionInformation)}`,
        );
        // Not every block has a receiver and the database cannot accept null values,
        // therefore check if there is a receiver
        if (blockTransactionInformation.receiver) {
          await this.blockTransactionInformationRepository.save([
            blockTransactionInformation,
          ]);
        } else {
          this.logger.error(`${fnName}: No receiver found in iteration ${i}`);
        }
        console.log(i);
        i++;
      } while (senderAddress === null || receiverAddress === null);
    } catch (error) {
      return this.logger.error(`${fnName}: ${error}`);
    }
  }

  async checkIfBlockExists(latestBlockCtx: any): Promise<boolean> {
    try {
      const blockChecker =
        await this.latestBlockGeneralInformationRepository.exist({
          where: {
            blockHeight: latestBlockCtx.height,
          },
        });
      return blockChecker;
    } catch (error) {
      throw new Error(`${this.checkIfBlockExists.name}: ${error}`);
    }
  }

  // Store the block information in the 'block_transactions' table in every 2 minutes
  @Cron('*/2 * * * *')
  async handleCronJob() {
    try {
      // Retrieve the latest block data
      const latestBlockCtx = await this.getBlockDataFromAPI();
      //Check if the latest block is already stored in the database
      const existing = false;

      if (existing === false) {
        //If the latest block is not stored in the database, store it in the 'latest_block' table
        this.storeLatestBlockGeneralInformation(latestBlockCtx);
        //If the block data is not stored in the database, store it in the 'block_transactions' table
        // this.storeBlockData(latestBlockCtx);
      } else {
        this.logger.warn(`Block ${latestBlockCtx.height} already stored`);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
