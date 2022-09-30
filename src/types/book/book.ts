import { UserInterface } from '../user';

export interface BookInterface {
  id: string;
  title: string;
  isbn: string;
  author: string;
  borrowedAt: Date | null;
  borrowedBy: UserInterface | null;
}

export type SecureBookData = Omit<BookInterface, 'borrowedAt' | 'borrowedBy'> & {
  isBorrowed: boolean;
};
