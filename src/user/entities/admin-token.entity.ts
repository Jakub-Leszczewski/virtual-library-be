import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminTokenInterface } from '../../types';

@Entity()
export class AdminToken extends BaseEntity implements AdminTokenInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  @Index({ unique: true })
  email: string;

  @Column({ length: 36 })
  @Index({ unique: true })
  token: string;

  @Column({ type: 'datetime' })
  expiredAt: Date;
}
