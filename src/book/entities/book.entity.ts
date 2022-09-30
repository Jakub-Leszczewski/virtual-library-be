import { BaseEntity, Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BookInterface } from '../../types';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Book extends BaseEntity implements BookInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 128 })
  title: string;

  @Column({ length: 128 })
  author: string;

  @Column({ length: 17 })
  isbn: string;

  @Column({
    type: 'datetime',
    nullable: true,
    default: null,
  })
  borrowedAt: Date | null;

  @ManyToOne((type) => User, (user) => user.borrowedBooks)
  @JoinColumn()
  borrowedBy: User | null;
}
