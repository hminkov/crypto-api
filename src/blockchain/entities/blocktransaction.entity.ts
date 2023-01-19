import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlockTransaction {
  constructor(
    blockHeight: number,
    transactionHash: string,
    sender: string,
    receiver: string,
    amountSent: number,
  ) {
    this.blockHeight = blockHeight;
    this.transactionHash = transactionHash;
    this.sender = sender;
    this.receiver = receiver;
    this.amountSent = amountSent;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  blockHeight: number;

  @Column()
  transactionHash: string;

  @Column({ nullable: true })
  sender: string;

  @Column({ nullable: true })
  receiver: string;

  // we need numeric here because the value is too large for integer
  @Column({ type: 'numeric', nullable: true })
  amountSent: number;
}
