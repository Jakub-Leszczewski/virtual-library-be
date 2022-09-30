import { BookInterface, SecureBookData } from './book';

export type CreateBookResponse = SecureBookData;
export type FindOneBookResponse = SecureBookData | BookInterface;
