import {
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { Cron } from '@nestjs/schedule';

@Controller('blockchain')
@UseInterceptors(CacheInterceptor)
@CacheTTL(60) // override the default ttl of 5 seconds to 60 seconds
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('latest')
  async getLatestBlock(
    @Query('clientIp') clientIp: string,
    @Query('userAgent') userAgent: string,
  ) {
    console.log(`clientIp: ${clientIp}`);

    return this.blockchainService.getLatestBlock();
  }

  @Cron('*/10 * * * *')
  handleCron() {
    console.log(
      'This CronJob is called every 10 minutes to store the latest block data',
    );
    try {
      this.blockchainService.storeBlockData();
    } catch (error) {
      console.error(error);
    }
  }
  // cron.schedule('*/2 * * * *', async () => {
  //   try {
  //     // Retrieve the latest block data
  //     const latestBlock = await blockchainService.getLatestBlock();
  //     // Store the data in the 'block_transactions' table
  //     await blockchainService.storeBlockData(latestBlock);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });
}
