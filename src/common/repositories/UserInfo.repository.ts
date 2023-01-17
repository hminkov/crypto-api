import { RequestStat } from '../model/entities/UserInfo.entity';
import { Repository } from 'typeorm';

export class RequestStatRepository extends Repository<RequestStat> {
  save(requestStats: RequestStat[]): Promise<RequestStat[]> {
    return this.save(requestStats);
  }
}
