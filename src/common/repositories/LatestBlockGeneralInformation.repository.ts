import { LatestBlockGeneralInformation } from '../model/entities/LatestBlockGeneralInformation.entity';
import { Repository } from 'typeorm';
export class LatestBlockGeneralInformationRepository extends Repository<LatestBlockGeneralInformation> {
  findBy(): Promise<LatestBlockGeneralInformation[]> {
    return this.find();
  }

  save(
    latestBlockGeneralInformation: LatestBlockGeneralInformation[],
  ): Promise<LatestBlockGeneralInformation[]> {
    return this.save(latestBlockGeneralInformation);
  }
}
