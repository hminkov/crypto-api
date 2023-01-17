import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LatestBlock {
  constructor(blockHash: string, blockHeight: number) {
    this.blockHash = blockHash;
    this.blockHeight = blockHeight;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  blockHash: string;

  @Column()
  blockHeight: number;
}
