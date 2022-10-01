import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { v4 as uuid } from 'uuid';
import { FindOptionsWhere } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { config } from '../config/config';

const moduleMocker = new ModuleMocker(global);

const userId = uuid();
const jwtId = uuid();
const newJwtId = uuid();
const username = uuid();
const password = 'Password1234';

let userSaveMock = jest.fn(() => undefined);
const userMock = new User();
const resMock: any = {
  clearCookie(name: string, options: any) {
    this.cookieData = { name, options };
  },
  cookie(name: string, value: string, options: any) {
    this.cookieData = { name, value, options };
  },
  cookieData: {},
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === UserService) {
          return {
            async getUser(where: FindOptionsWhere<User>) {
              if (where.username !== username) return null;

              return userMock;
            },
            filter: (user: User) => user,
            checkUserFieldUniqueness: () => true,
          };
        } else if (token === JwtService) {
          return {
            sign: (data) => data,
          };
        } else if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get<AuthService>(AuthService);

    userSaveMock = jest.fn(() => undefined);
    resMock.cookieData = {};

    userMock.id = userId;
    userMock.username = username;
    userMock.email = 'abc';
    userMock.hashPwd = '$2a$13$Iwf5vi4HLT8GMHysIbbEH.DjVgeC/8O.VJj/o0gJtqB2S9tKhvnP6'; // Password1234
    userMock.jwtId = jwtId;

    jest.spyOn(User.prototype, 'save').mockImplementation(userSaveMock);
    jest.spyOn(User, 'findOne').mockImplementation(async (options: any) => {
      if (options.where.username === username) return userMock;
      return null;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validateUser should return null if user is empty', async () => {
    const result = await service.validateUser('test', password);

    expect(result).toBeNull();
  });

  it('validateUser should return null if password is incorrect', async () => {
    const result = await service.validateUser(username, 'bad-password');

    expect(result).toBeNull();
  });

  it('validateUser should return user if username and password is correct', async () => {
    const result = await service.validateUser(username, password);

    expect(result).toEqual(userMock);
  });

  it('login should set cookie with JWT who includes new jwt id and return correct data', async () => {
    jest.spyOn(AuthService.prototype, 'generateNewJwtId').mockResolvedValueOnce(newJwtId);

    const result = await service.login(userMock, resMock);

    expect(userSaveMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(resMock.cookieData.name).toBe('access_token');
    expect(resMock.cookieData.value).toEqual({ jwtId: newJwtId });
    expect(resMock.cookieData.options).toEqual({
      secure: config.cookieSecure,
      httpOnly: true,
      maxAge: config.jwtCookieTimeToExpire,
      domain: config.jwtCookieDomain,
    });
    expect(result).toEqual({
      ...userMock,
      jwtId: newJwtId,
    });
  });

  it('logout should clear cookie and return ok', async () => {
    const result = await service.logout(userMock, resMock);

    expect(result).toEqual({ ok: true });
    expect(userSaveMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(resMock.cookieData.name).toBe('access_token');
    expect(resMock.cookieData.options).toEqual({
      secure: false,
      httpOnly: true,
      maxAge: config.jwtCookieTimeToExpire,
      domain: config.jwtCookieDomain,
    });
  });

  it("generateNewJwtId should return new jwt id if field doesn't exist", async () => {
    const result = await service.generateNewJwtId();

    expect(result).toBeDefined();
    expect(result.length).toBe(36);
  });
});
