import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlockTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  blockHeight: number;

  @Column()
  transactionHash: string;

  @Column()
  sender: string;

  @Column()
  receiver: string;

  // we need numeric here because the value is too large for integer
  @Column({ type: 'numeric' })
  amountSent: number;
}
