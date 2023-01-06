import { LatestBlock } from '../entities/latestblock.entity';
import { Repository } from 'typeorm';

export class LatestBlockRepository extends Repository<LatestBlock> {
  findBy(): Promise<LatestBlock[]> {
    return this.find();
  }

  save(latestBlock: LatestBlock[]): Promise<LatestBlock[]> {
    return this.save(latestBlock);
  }
}
