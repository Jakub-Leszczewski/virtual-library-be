import { UserRole } from './user-role';
import { Book } from '../../book/entities/book.entity';

export interface UserInterface {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  hashPwd: string;
  jwtId: string;
  role: UserRole;
  borrowedBooks: Book[];
}

export type SecureUserData = Omit<UserInterface, 'hashPwd' | 'jwtId'>;
