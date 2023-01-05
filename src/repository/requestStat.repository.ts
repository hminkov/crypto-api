import { Entity, Repository } from 'typeorm';
import { RequestStat } from '../entities/requestStat.entity';

export class RequestStatRepository extends Repository<RequestStat> {
  find(): Promise<RequestStat[]> {
    return this.find();
  }

  save(requestStats: RequestStat[]): Promise<RequestStat[]> {
    return this.save(requestStats);
  }
}
