import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { UserService } from './user.service';
import { v4 as uuid } from 'uuid';

const moduleMocker = new ModuleMocker(global);

const createUserSpy = jest.fn();
const sendAdminTokenSpy = jest.fn();
const createAdminSpy = jest.fn();

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
            createUser: createUserSpy,
            sendAdminToken: sendAdminTokenSpy,
            createAdmin: createAdminSpy,
          };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
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

  it('createUser should calls to userService.createUser', async () => {
    await controller.createUser(bodyMock);
    expect(createUserSpy).toHaveBeenCalledWith(bodyMock);
  });

  it('sendAdminToken - should calls to userService.sendAdminToken', async () => {
    await controller.sendAdminToken(bodyMock);
    expect(sendAdminTokenSpy).toHaveBeenCalledWith(bodyMock);
  });

  it('createAdmin - should calls to userService.createAdmin', async () => {
    await controller.createAdmin(tokenMock, bodyMock);
    expect(createAdminSpy).toHaveBeenCalledWith(tokenMock, bodyMock);
  });
});
