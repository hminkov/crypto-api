import { BlockTransactionsInformation } from '../model/entities/BlockTransactionsInformation.entity';
import { Repository } from 'typeorm';

export class BlockTransactionInformationRepository extends Repository<BlockTransactionsInformation> {
  find(): Promise<BlockTransactionsInformation[]> {
    return this.find();
  }

  save(
    blockTransactionsInformation: BlockTransactionsInformation[],
  ): Promise<BlockTransactionsInformation[]> {
    return this.save(blockTransactionsInformation);
  }
}
