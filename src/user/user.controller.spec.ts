import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { UserService } from './user.service';
import { v4 as uuid } from 'uuid';

const moduleMocker = new ModuleMocker(global);

const createUserResult = 'createUser';
const sendAdminTokenResult = 'sendAdminToken';
const createAdminResult = 'createAdmin';

const bodyMock: any = { body: true };
const tokenMock = uuid();

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    })
      .useMocker((token) => {
        if (token === UserService) {
          return {
            createUser: jest.fn(async (body) => ({
              body,
              result: createUserResult,
            })),
            sendAdminToken: jest.fn(async (body) => ({
              body,
              result: sendAdminTokenResult,
            })),
            createAdmin: jest.fn(async (token, body) => ({
              token,
              body,
              result: createAdminResult,
            })),
          };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create - should calls to userService.create', async () => {
    const result: any = await controller.createUser(bodyMock);

    expect(result.result).toBe(createUserResult);
    expect(result.body).toEqual(bodyMock);
  });

  it('findOne - should calls to userService.findOne', async () => {
    const result: any = await controller.sendAdminToken(bodyMock);

    expect(result.result).toBe(sendAdminTokenResult);
    expect(result.body).toBe(bodyMock);
  });

  it('getUserIndex - should calls to userService.getUserIndex', async () => {
    const result: any = await controller.createAdmin(tokenMock, bodyMock);

    expect(result.result).toBe(createAdminResult);
    expect(result.token).toBe(tokenMock);
    expect(result.body).toEqual(bodyMock);
  });
});
