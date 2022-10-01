import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserInterface, UserRole } from '../../types';
import { Book } from '../../book/entities/book.entity';

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

  @OneToMany((type) => Book, (book) => book.borrowedBy)
  borrowedBooks: Book[];
}
