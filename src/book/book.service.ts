import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import {
  BookStatus,
  CreateBookResponse,
  FindAllBookResponse,
  FindOneBookResponse,
  RemoveBookResponse,
  SecureBookData,
  UpdateBookResponse,
} from '../types';
import { DataSource, FindOperator, FindOptionsWhere, IsNull, Not } from 'typeorm';
import { FindOneQueryDto } from './dto/find-one-query.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { config } from '../config/config';
import { UserService } from '../user/user.service';

@Injectable()
export class BookService {
  constructor(
    @Inject(DataSource) private dataSource: DataSource,
    @Inject(UserService) private userService: UserService,
  ) {}

  async getBook(where: FindOptionsWhere<Book>) {
    return Book.findOne({
      where,
      relations: ['borrowedBy'],
    });
  }

  async findAll(query: FindAllQueryDto): Promise<FindAllBookResponse> {
    const { secure, page, status } = query;
    let borrowedBy: FindOperator<any> | undefined = undefined;

    if (status === BookStatus.Available) borrowedBy = IsNull();
    else if (status === BookStatus.Borrowed) borrowedBy = Not(IsNull());

    const [book, totalBooksCount] = await Book.findAndCount({
      where: { borrowedBy },
      relations: ['borrowedBy'],
      order: { title: 'asc' },
      skip: config.itemsCountPerPage * (page - 1),
      take: config.itemsCountPerPage,
    });

    return {
      books: secure ? book.map((e) => this.filterNotSecure(e)) : book.map((e) => this.filter(e)),
      totalPages: Math.ceil(totalBooksCount / config.itemsCountPerPage),
      totalBooksCount,
    };
  }

  async findOne(id: string, { secure }: FindOneQueryDto): Promise<FindOneBookResponse> {
    if (!id) throw new BadRequestException();

    const book = await this.getBook({ id });
    if (!book) throw new NotFoundException();

    if (!secure) return this.filter(book);

    return this.filterNotSecure(book);
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

  async update(id: string, updateBookDto: UpdateBookDto): Promise<UpdateBookResponse> {
    const { title, author, isbn } = updateBookDto;
    if (!id) throw new BadRequestException();

    const book = await this.getBook({ id });
    if (!book) throw new NotFoundException();

    book.title = title ?? book.title;
    book.author = author ?? book.author;
    book.isbn = isbn ?? book.isbn;
    await book.save();

    return this.filter(book);
  }

  async remove(id: string): Promise<RemoveBookResponse> {
    if (!id) throw new BadRequestException();

    const book = await this.getBook({ id });
    if (!book) throw new NotFoundException();

    await book.remove();
    return this.filter(book);
  }

  filter(book: Book): SecureBookData {
    const { borrowedBy, borrowedAt, ...bookResponse } = book;

    return {
      ...bookResponse,
      isBorrowed: !!borrowedBy,
    };
  }

  filterNotSecure(book: Book) {
    const { borrowedBy, ...bookResponse } = book;
    const filteredUser = borrowedBy && this.userService.filter(borrowedBy);

    return {
      ...bookResponse,
      borrowedBy: filteredUser,
    };
  }
}
