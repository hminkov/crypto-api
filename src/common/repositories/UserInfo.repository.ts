import { UserInfo } from '../model/entities/UserInfo.entity';
import { Repository } from 'typeorm';

export class UserInfoRepository extends Repository<UserInfo> {
  save(userInfo: UserInfo[]): Promise<UserInfo[]> {
    return this.save(userInfo);
  }
}
