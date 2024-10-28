import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('alerts')
export class AlertEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column('decimal')
  price: number;

  @Column()
  email: string;

  @CreateDateColumn()
  created_at: Date;
}
