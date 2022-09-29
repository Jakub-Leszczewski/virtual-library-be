import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AdminTokenInterface } from '../../types';

export class AdminToken extends BaseEntity implements AdminTokenInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  email: string;

  @Column({ length: 36 })
  token: string;
}
