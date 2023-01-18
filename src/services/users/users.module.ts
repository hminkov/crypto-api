import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainModule } from 'src/services/blockchain/blockchain.module';
import { UserInfo } from '../../common/model/entities/UserInfo.entity';
import { UserInfoRepository } from '../../common/repositories/UserInfo.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserInfo, UserInfoRepository]),
    BlockchainModule,
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
