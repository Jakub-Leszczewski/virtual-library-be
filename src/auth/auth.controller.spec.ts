import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { v4 as uuid } from 'uuid';
import { UserService } from '../user/user.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

const loginSpy = jest.fn();
const logoutSpy = jest.fn();
const userFilterSpy = jest.fn();

const userId = uuid();
const userMock: any = { id: userId };
const resMock: any = { res: true };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return {
            login: loginSpy,
            logout: logoutSpy,
          };
        }

        if (token === UserService) {
          return {
            filter: userFilterSpy,
          };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login should calls to authService.login', async () => {
    await controller.login(userMock, resMock);
    expect(loginSpy).toHaveBeenCalledWith(userMock, resMock);
  });

  it('logout should calls to authService.logout', async () => {
    await controller.logout(userMock, resMock);
    expect(logoutSpy).toHaveBeenCalledWith(userMock, resMock);
  });

  it('getAuthUser should calls to userService.findOne', async () => {
    await controller.getAuthUser(userMock);
    expect(userFilterSpy).toHaveBeenCalledWith(userMock);
  });
});
