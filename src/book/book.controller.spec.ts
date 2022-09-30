import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { v4 as uuid } from 'uuid';

const moduleMocker = new ModuleMocker(global);

const findAllResult = 'findAll';
const findOneResult = 'findOne';
const createResult = 'create';
const updateResult = 'update';
const removeResult = 'remove';

const bookId = uuid();
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
            findAll: jest.fn(async (query) => ({
              query,
              result: findAllResult,
            })),
            findOne: jest.fn(async (id, query) => ({
              id,
              query,
              result: findOneResult,
            })),
            create: jest.fn(async (body) => ({
              body,
              result: createResult,
            })),
            update: jest.fn(async (id, body) => ({
              id,
              body,
              result: updateResult,
            })),
            remove: jest.fn(async (id) => ({
              id,
              result: removeResult,
            })),
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
    const result: any = await controller.findOne(bookId, queryMock);

    expect(result.result).toBe(findOneResult);
    expect(result.id).toBe(bookId);
    expect(result.query).toEqual(queryMock);
  });

  it('findAll should calls to bookService.findAll', async () => {
    const result: any = await controller.findAll(queryMock);

    expect(result.result).toBe(findAllResult);
    expect(result.query).toEqual(queryMock);
  });

  it('create should calls to bookService.create', async () => {
    const result: any = await controller.create(bodyMock);

    expect(result.result).toBe(createResult);
    expect(result.body).toEqual(bodyMock);
  });

  it('update should calls to bookService.update', async () => {
    const result: any = await controller.update(bookId, bodyMock);

    expect(result.id).toBe(bookId);
    expect(result.result).toBe(updateResult);
    expect(result.body).toEqual(bodyMock);
  });

  it('remove should calls to bookService.remove', async () => {
    const result: any = await controller.remove(bookId);

    expect(result.id).toBe(bookId);
    expect(result.result).toBe(removeResult);
  });
});
