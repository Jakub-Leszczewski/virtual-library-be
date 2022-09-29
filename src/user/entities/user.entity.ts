import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserInterface, UserRole } from '../../types';

@Entity()
export class User extends BaseEntity implements UserInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  firstName: string;

  @Column({ length: 64 })
  lastName: string;

  @Column({ length: 64 })
  @Index({ unique: true })
  username: string;

  @Column({ length: 256 })
  @Index({ unique: true })
  email: string;

  @Column({ length: 64 })
  hashPwd: string;

  @Column({
    length: 36,
    nullable: true,
    default: null,
  })
  @Index({ unique: true })
  jwtId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;
}
