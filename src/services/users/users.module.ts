import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainModule } from 'src/services/blockchain/blockchain.module';
import { RequestStat } from '../../common/model/entities/UserInfo.entity';
import { RequestStatRepository } from '../../common/repositories/UserInfo.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestStat, RequestStatRepository]),
    BlockchainModule,
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
