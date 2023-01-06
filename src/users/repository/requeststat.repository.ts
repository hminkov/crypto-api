import { RequestStat } from '../entities/requeststat.entity';
import { Repository } from 'typeorm';

export class RequestStatRepository extends Repository<RequestStat> {
  find(): Promise<RequestStat[]> {
    return this.find();
  }

  save(requestStats: RequestStat[]): Promise<RequestStat[]> {
    return this.save(requestStats);
  }
}
