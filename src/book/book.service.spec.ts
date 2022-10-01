import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { v4 as uuid } from 'uuid';
import { Book } from './entities/book.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { config } from '../config/config';
import { BookStatus } from '../types';

const moduleMocker = new ModuleMocker(global);

const userId = uuid();
const bookId = uuid();
const currentTime = new Date();

const bookMock = new Book();
const userMock = new User();
const newBookDto = {
  title: 'new',
  author: 'new',
  isbn: 'new',
};

let removeBookMock = jest.fn(() => undefined);
let saveBookMock = jest.fn(() => undefined);
const userFilterSpy = jest.fn(() => 'user');

describe('BookService', () => {
  let service: BookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookService],
    })
      .useMocker((token) => {
        if (token === UserService) {
          return {
            filter: userFilterSpy,
          };
        } else if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get<BookService>(BookService);

    userMock.id = userId;

    bookMock.id = bookId;
    bookMock.title = 'abc';
    bookMock.author = 'abc';
    bookMock.isbn = 'abc';
    bookMock.borrowedAt = currentTime;
    bookMock.borrowedBy = userMock;

    removeBookMock = jest.fn(() => undefined);
    saveBookMock = jest.fn(() => undefined);

    jest.spyOn(Book.prototype, 'remove').mockImplementation(removeBookMock);
    jest.spyOn(Book.prototype, 'save').mockImplementation(saveBookMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filter should return save data', () => {
    const { borrowedBy, borrowedAt, ...bookResponse } = bookMock;

    expect(service.filter(bookMock)).toEqual({
      ...bookResponse,
      isBorrowed: !!borrowedBy,
    });
  });

  it('filterNotSecure should return not secure book data, but with secure user data', () => {
    const { borrowedBy, ...bookResponse } = bookMock;

    service.filterNotSecure(bookMock);
    expect(userFilterSpy).toHaveBeenCalledWith(borrowedBy);
    expect(service.filterNotSecure(bookMock)).toEqual({ ...bookResponse, borrowedBy: 'user' });
  });

  it('filterNotSecure should return not secure book data, and null borrowedBy', () => {
    bookMock.borrowedBy = null;
    const { borrowedBy, ...bookResponse } = bookMock;

    expect(service.filterNotSecure(bookMock)).toEqual({
      ...bookResponse,
      borrowedBy: null,
    });
  });

  it('getBook - findOne should call with the appropriate options', async () => {
    const findOneSpy = jest.spyOn(Book, 'findOne').mockResolvedValue(bookMock);
    const where: any = { id: bookId };

    await service.getBook(where);

    expect(findOneSpy).toHaveBeenCalledWith({
      where,
      relations: ['borrowedBy'],
    });
  });

  it('findOne should throw BadRequestException if id is empty', async () => {
    await expect(async () => service.findOne('', {} as any)).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('findOne should throw not NotFoundException if travel is empty', async () => {
    jest.spyOn(BookService.prototype, 'getBook').mockResolvedValue(null);

    await expect(async () => service.findOne(bookId, {} as any)).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('findOne should return record with given id', async () => {
    const newId = uuid();
    jest.spyOn(BookService.prototype, 'getBook').mockImplementation(async (where: any) => {
      bookMock.id = where.id;
      return bookMock;
    });
    jest.spyOn(BookService.prototype, 'filter').mockImplementation((e: any) => e);

    const result = await service.findOne(newId, {} as any);

    expect(result.id).toBe(newId);
  });

  it('findOne should return secure data', async () => {
    jest.spyOn(BookService.prototype, 'filter').mockImplementation((e: any): any => ({
      id: e.id,
      secureData: true,
    }));
    jest.spyOn(BookService.prototype, 'filterNotSecure').mockImplementation((e: any): any => ({
      id: e.id,
      notSecureData: true,
    }));

    const resultOnlySecure = await service.findOne(bookId, { secure: false });
    const resultNotSecure = await service.findOne(bookId, { secure: true });

    expect(resultOnlySecure).toEqual({
      id: bookId,
      secureData: true,
    });
    expect(resultNotSecure).toEqual({
      id: bookId,
      notSecureData: true,
    });
  });

  it('findAll should call to Book.findAndCount with appropriate options', async () => {
    const findAllAndCountSpy = jest.spyOn(Book, 'findAndCount').mockResolvedValue([[], 0]);

    await service.findAll({
      page: 1,
      secure: false,
      status: BookStatus.All,
    });

    expect(findAllAndCountSpy).toHaveBeenCalledWith({
      where: {},
      relations: ['borrowedBy'],
      order: { title: 'asc' },
      skip: config.itemsCountPerPage * (1 - 1),
      take: config.itemsCountPerPage,
    });
  });

  it('findAll should return secure data', async () => {
    jest.spyOn(Book, 'findAndCount').mockResolvedValue([[{} as any], 1]);
    jest.spyOn(BookService.prototype, 'filter').mockReturnValue({ secure: true } as any);
    jest.spyOn(BookService.prototype, 'filterNotSecure').mockReturnValue({ secure: false } as any);

    const result = await service.findAll({
      page: 1,
      secure: false,
      status: BookStatus.All,
    });

    expect(result).toEqual({
      books: [{ secure: true }],
      totalPages: Math.ceil(1 / config.itemsCountPerPage),
      totalBooksCount: 1,
    });
  });

  it('findAll should return not secure data', async () => {
    jest.spyOn(Book, 'findAndCount').mockResolvedValue([[{} as any], 1]);
    jest.spyOn(BookService.prototype, 'filter').mockReturnValue({ secure: true } as any);
    jest.spyOn(BookService.prototype, 'filterNotSecure').mockReturnValue({ secure: false } as any);

    const result = await service.findAll({
      page: 1,
      secure: true,
      status: BookStatus.All,
    });

    expect(result).toEqual({
      books: [{ secure: false }],
      totalPages: Math.ceil(1 / config.itemsCountPerPage),
      totalBooksCount: 1,
    });
  });

  it('create should return secure data and save it in db', async () => {
    const filterSpy = jest.spyOn(BookService.prototype, 'filter').mockImplementation((e: any) => e);

    const result = await service.create(newBookDto);
    (result as any).borrowedAt = undefined;
    (result as any).borrowedBy = undefined;

    expect(saveBookMock.mock.calls.length).toBe(1);
    expect(filterSpy).toHaveBeenCalled();
    expect(result instanceof Book).toBe(true);
  });

  it('update should throw BadRequestException if id is empty', async () => {
    await expect(async () => service.update('', newBookDto)).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('update - should throw NotFoundException if not found book', async () => {
    jest.spyOn(BookService.prototype, 'getBook').mockResolvedValue(null);

    await expect(async () => service.update('abc', newBookDto)).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('update - should return record with new data and save it', async () => {
    const filterSpy = jest.spyOn(BookService.prototype, 'filter').mockImplementation((e: any) => e);
    jest.spyOn(BookService.prototype, 'getBook').mockResolvedValue(bookMock);

    const result = await service.update(bookId, newBookDto);

    expect(filterSpy).toHaveBeenCalled();
    expect(saveBookMock.mock.calls.length).toBe(1);
    expect(result).toEqual({
      ...bookMock,
      ...newBookDto,
    });
  });

  it('remove should throw BadRequestException if id is empty', async () => {
    await expect(async () => service.remove('')).rejects.toThrowError(BadRequestException);
  });

  it('remove should throw NotFoundException if Book is empty', async () => {
    jest.spyOn(BookService.prototype, 'getBook').mockResolvedValue(null);

    await expect(async () => service.remove(bookId)).rejects.toThrowError(NotFoundException);
  });

  it('remove should return data with given id', async () => {
    const filterSpy = jest.spyOn(BookService.prototype, 'filter').mockImplementation((e: any) => e);
    jest.spyOn(BookService.prototype, 'getBook').mockResolvedValue(bookMock);

    const result = await service.remove(bookId);

    expect(result).toBeDefined();
    expect(result.id).toBe(bookId);
    expect(filterSpy).toHaveBeenCalled();
    expect(removeBookMock.mock.calls.length).toBe(1);
  });

  it('bookBorrow should throw BadRequestException if id is empty', async () => {
    await expect(async () => service.bookBorrow('', userMock)).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('bookBorrow should throw NotFoundException if Book is empty', async () => {
    jest.spyOn(BookService.prototype, 'getBook').mockResolvedValue(null);

    await expect(async () => service.bookBorrow(bookId, userMock)).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('bookBorrow should return data with given id', async () => {
    const filterSpy = jest.spyOn(BookService.prototype, 'filter').mockImplementation((e: any) => e);
    jest.spyOn(BookService.prototype, 'getBook').mockResolvedValue(bookMock);

    const result = await service.bookBorrow(bookId, userMock);

    expect(result).toBeDefined();
    expect(result.id).toBe(bookId);
    expect(filterSpy).toHaveBeenCalled();
    expect(saveBookMock.mock.calls.length).toBe(1);
  });

  it('bookReturn should throw BadRequestException if id is empty', async () => {
    await expect(async () => service.bookReturn('')).rejects.toThrowError(BadRequestException);
  });

  it('bookReturn should throw NotFoundException if Book is empty', async () => {
    jest.spyOn(BookService.prototype, 'getBook').mockResolvedValue(null);

    await expect(async () => service.bookReturn(bookId)).rejects.toThrowError(NotFoundException);
  });

  it('bookReturn should return data with given id', async () => {
    const filterSpy = jest.spyOn(BookService.prototype, 'filter').mockImplementation((e: any) => e);
    jest.spyOn(BookService.prototype, 'getBook').mockResolvedValue(bookMock);

    const result = await service.bookReturn(bookId);

    expect(result).toBeDefined();
    expect(result.id).toBe(bookId);
    expect(filterSpy).toHaveBeenCalled();
    expect(saveBookMock.mock.calls.length).toBe(1);
  });
});
