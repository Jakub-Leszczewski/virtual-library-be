import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { v4 as uuid } from 'uuid';

const moduleMocker = new ModuleMocker(global);

const findAllSpy = jest.fn();
const findOneSpy = jest.fn();
const createSpy = jest.fn();
const updateSpy = jest.fn();
const removeSpy = jest.fn();
const bookBorrowSpy = jest.fn();
const bookReturnSpy = jest.fn();

const bookId = uuid();
const userId = uuid();
const userMock: any = { id: userId };
const bodyMock: any = { body: true };
const queryMock: any = { body: true };

describe('BookController', () => {
  let controller: BookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
    })
      .useMocker((token) => {
        if (token === BookService) {
          return {
            findAll: findAllSpy,
            findOne: findOneSpy,
            create: createSpy,
            update: updateSpy,
            remove: removeSpy,
            bookBorrow: bookBorrowSpy,
            bookReturn: bookReturnSpy,
          };
        } else if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get<BookController>(BookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findOne should calls to bookService.findOne', async () => {
    await controller.findOne(bookId, queryMock);
    expect(findOneSpy).toHaveBeenCalledWith(bookId, queryMock);
  });

  it('findAll should calls to bookService.findAll', async () => {
    await controller.findAll(queryMock);
    expect(findAllSpy).toHaveBeenCalledWith(queryMock);
  });

  it('create should calls to bookService.create', async () => {
    await controller.create(bodyMock);
    expect(createSpy).toHaveBeenCalledWith(bodyMock);
  });

  it('update should calls to bookService.update', async () => {
    await controller.update(bookId, bodyMock);
    expect(updateSpy).toHaveBeenCalledWith(bookId, bodyMock);
  });

  it('remove should calls to bookService.remove', async () => {
    await controller.remove(bookId);
    expect(removeSpy).toHaveBeenCalledWith(bookId);
  });

  it('bookBorrow should calls to bookService.bookBorrow', async () => {
    await controller.bookBorrow(bookId, userMock);
    expect(bookBorrowSpy).toHaveBeenCalledWith(bookId, userMock);
  });

  it('bookReturn should calls to bookService.bookReturn', async () => {
    await controller.bookReturn(bookId);
    expect(bookReturnSpy).toHaveBeenCalledWith(bookId);
  });
});
