import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { CreateBookResponse, SecureBookData } from '../types';

@Injectable()
export class BookService {
  findAll() {
    return `This action returns all book`;
  }

  findOne(id: string) {
    return `This action returns a #${id} book`;
  }

  async create(createBookDto: CreateBookDto): Promise<CreateBookResponse> {
    const { title, author, isbn } = createBookDto;

    const book = new Book();
    book.title = title;
    book.author = author;
    book.isbn = isbn;
    book.borrowedBy = null;
    book.borrowedAt = null;
    await book.save();

    return this.filter(book);
  }

  update(id: string, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: string) {
    return `This action removes a #${id} book`;
  }

  filter(book: Book): SecureBookData {
    const { borrowedBy, borrowedAt, ...bookResponse } = book;

    return {
      ...bookResponse,
      isBorrowed: !!borrowedBy,
    };
  }
}
