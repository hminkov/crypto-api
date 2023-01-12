import {
  CacheInterceptor,
  Controller,
  Get,
  Param,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('blockchain')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
