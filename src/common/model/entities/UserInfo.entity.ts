import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserInfo {
  constructor(clientIp: string, browser: string, timestamp: Date) {
    this.clientIp = clientIp;
    this.browser = browser;
    this.timestamp = timestamp;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientIp: string;

  @Column()
  browser: string;

  @Column()
  timestamp: Date;
}
