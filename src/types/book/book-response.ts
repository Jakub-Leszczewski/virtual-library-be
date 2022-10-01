import { NotSecureBookData, SecureBookData } from './book';

export type CreateBookResponse = SecureBookData;
export type RemoveBookResponse = SecureBookData;
export type UpdateBookResponse = SecureBookData;
export type FindOneBookResponse = SecureBookData | NotSecureBookData;
export type FindAllBookResponse = {
  books: (SecureBookData | NotSecureBookData)[];
  totalPages: number;
  totalBooksCount: number;
};
