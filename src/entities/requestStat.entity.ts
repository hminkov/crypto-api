import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RequestStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ip: string;

  @Column()
  browser: string;

  @Column()
  timestamp: Date;
}
