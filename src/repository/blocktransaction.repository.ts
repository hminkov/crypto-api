import { BlockTransaction } from 'src/entities/blocktransaction.entity';
import { Entity, Repository } from 'typeorm';

export class BlockTransactionRepository extends Repository<BlockTransaction> {
  find(): Promise<BlockTransaction[]> {
    return this.find();
  }

  save(blockTransaction: BlockTransaction[]): Promise<BlockTransaction[]> {
    return this.save(blockTransaction);
  }
}
