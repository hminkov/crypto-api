import { Controller, Get, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('blockchain')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get('latest')
  async getLatestBlockData(@Req() req) {
    this.usersService.recordRequest(
      req.ip,
      req.headers['user-agent'],
      new Date(),
    );
    console.log('Called the getLatestBlock method');
    return this.usersService.getLatestBlockData();
  }

  @Get('transaction/:hash')
  async getTransactionData(@Req() req, @Param('hash') hash: string) {
    this.usersService.recordRequest(
      req.ip,
      req.headers['user-agent'],
      new Date(),
    );
    console.log('Called the getTransaction method');
    return this.usersService.getTransactionData(hash);
  }
}
