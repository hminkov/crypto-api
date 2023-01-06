import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestStat } from '../users/entities/requeststat.entity';
import { RequestStatRepository } from '../users/repository/requeststat.repository';
import { BlockTransaction } from './entities/blocktransaction.entity';
import { BlockTransactionRepository } from './repository/blocktransaction.repository';
import { Block } from './interfaces/block';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import { LatestBlock } from './entities/latestblock.entity';
import { LatestBlockRepository } from './repository/latestblock.repository';

const options = {
  headers: { 'x-api-key': 'bfa8fc24-6f16-40f0-9ef0-e290a60893b6' },
};

@Injectable()
export class BlockchainService {
  constructor(
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
    try {
      const latestBlock = new LatestBlock(
        latestBlockCtx.hash,
        latestBlockCtx.height,
      );
      console.log(latestBlock);
      await this.latestBlockRepository.save([latestBlock]);
    } catch (error) {
      return error;
    }
  }
  async storeBlockData(latestBlockCtx: any) {
    let amountSent = 0;
    const firstTransaction = latestBlockCtx.txs[1];
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
    console.log(blockTransaction);

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
      const blockChecker = await this.blockTransactionRepository.findOne({
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
        throw new Error(`Block ${latestBlockCtx.height} already stored`);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
