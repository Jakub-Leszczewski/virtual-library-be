import { BookStatus } from './book-status';

export interface CreateBookDtoInterface {
  title: string;
  isbn: string;
  author: string;
}

export interface FindOneQueryDtoInterface {
  secure: boolean;
}

export interface FindAllQueryDtoInterface {
  secure: boolean;
  page: number;
  status: BookStatus;
}
