import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestStat } from './entities/requestStat.entity';
import { RequestStatRepository } from './repository/requestStat.repository';
import { BlockTransaction } from './entities/blocktransaction.entity';
import { BlockTransactionRepository } from './repository/blocktransaction.repository';
import { Request } from 'express';
import { Block } from './interfaces/block';
import axios from 'axios';

const options = {
  headers: { 'x-api-key': 'bfa8fc24-6f16-40f0-9ef0-e290a60893b6' },
};

@Injectable()
export class BlockchainService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    @InjectRepository(BlockTransaction)
    private readonly blockTransactionRepository: BlockTransactionRepository,
    @InjectRepository(RequestStat)
    private readonly requestStatRepository: RequestStatRepository,
  ) {}

  //TODO - add caching
  async getLatestBlock(): Promise<Block> {
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
    const latestBlock = {
      height: latestBlockCtx.height,
      hash: latestBlockCtx.hash,
    } as Block;
    console.log(latestBlock);
    return latestBlockCtx;
  }

  async getBlockchainData(req: Request): Promise<BlockTransaction[]> {
    // Record the request in the 'request_stats' table
    const requestStat = new RequestStat();
    requestStat.ip = req.ip;
    requestStat.browser = req.headers['user-agent'];
    requestStat.timestamp = new Date();
    await this.requestStatRepository.save([requestStat]);

    // Retrieve the blockchain data from the 'block_transactions' table
    const blockchainData = await this.blockTransactionRepository.find();
    return blockchainData;
  }

  async recordRequest(requestStat: RequestStat): Promise<RequestStat> {
    // Save the request stat in the 'request_stats' table
    const savedRequestStat = await this.requestStatRepository.save([
      requestStat,
    ]);
    return savedRequestStat[0];
  }

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

  async storeBlockData() {
    // Retrieve the latest block data
    const latestBlockCtx = await this.getBlockDataFromAPI();

    // Store the block information in the 'block_transactions' table
    const blockTransaction = new BlockTransaction();

    blockTransaction.amountSent = 0;
    const firstTransaction = latestBlockCtx.txs[1];
    firstTransaction['outputs'].forEach(function (output) {
      blockTransaction.amountSent += output['value'];
    });

    blockTransaction.blockHeight = latestBlockCtx.height;
    blockTransaction.transactionHash = firstTransaction.hash;
    blockTransaction.sender = firstTransaction.inputs[0].coin.address;
    blockTransaction.receiver = firstTransaction.outputs[0].address;
    console.log(blockTransaction);

    // Since not every block has a receiver and the database cannot accept null values,
    // we need to check if there is a receiver
    if (blockTransaction.receiver) {
      await this.blockTransactionRepository.save([blockTransaction]);
    } else {
      throw new Error('No receiver found');
    }
  }
}
