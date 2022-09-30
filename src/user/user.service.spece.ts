import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { User } from './entities/user.entity';
import { v4 as uuid } from 'uuid';
import { UserRole } from '../types';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AdminToken } from './entities/admin-token.entity';
import { MailService } from '../common/providers/mail/mail.service';

const moduleMocker = new ModuleMocker(global);

const userId = uuid();
const adminTokenId = uuid();
const adminToken = uuid();
const currentTime = new Date();

const userMock = new User();
const adminTokenMock = new AdminToken();

const createUserDtoMock: any = {
  firstName: 'abc',
  lastName: 'abc',
  username: 'abc',
  email: 'abc',
  password: 'password',
};

let sendEmailArgs: any = {};
let userSaveMock = jest.fn(async () => undefined);
let adminTokenSaveMock = jest.fn(async () => undefined);
let adminTokenRemoveMock = jest.fn(async () => undefined);
let sendEmailMock = jest.fn(async (email, context) => {
  sendEmailArgs = { email, context };
});

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    })
      .useMocker((token) => {
        if (token === MailService) {
          return {
            sendAdminToken: sendEmailMock,
          };
        } else if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get<UserService>(UserService);

    userMock.id = userId;
    userMock.firstName = 'abc';
    userMock.lastName = 'abc';
    userMock.username = 'abc';
    userMock.email = 'abc';
    userMock.jwtId = 'abc';
    userMock.role = UserRole.User;
    userMock.hashPwd = '$2a$13$Iwf5vi4HLT8GMHysIbbEH.DjVgeC/8O.VJj/o0gJtqB2S9tKhvnP6'; // Password1234

    adminTokenMock.id = adminTokenId;
    adminTokenMock.token = adminToken;
    adminTokenMock.email = 'abc';
    adminTokenMock.expiredAt = currentTime;

    sendEmailArgs = {};
    userSaveMock = jest.fn(async () => undefined);
    adminTokenSaveMock = jest.fn(async () => undefined);
    adminTokenRemoveMock = jest.fn(async () => undefined);
    sendEmailMock = jest.fn(async (email, context) => {
      sendEmailArgs = { email, context };
    });

    jest.spyOn(User.prototype, 'save').mockImplementation(userSaveMock);
    jest.spyOn(AdminToken.prototype, 'save').mockImplementation(adminTokenSaveMock);
    jest.spyOn(AdminToken.prototype, 'remove').mockImplementation(adminTokenRemoveMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filter should return save data', () => {
    const { jwtId, hashPwd, ...userResponse } = userMock;

    expect(service.filter(userMock)).toEqual(userResponse);
  });

  it('checkUserFieldUniqueness should return false', async () => {
    jest.spyOn(User, 'count').mockResolvedValue(1);

    const result = await service.checkUserFieldUniqueness({ email: 'abc@xyz.pl' });
    expect(result).toBe(false);
  });

  it('checkUserFieldUniqueness should return true', async () => {
    jest.spyOn(User, 'count').mockResolvedValue(0);

    const result = await service.checkUserFieldUniqueness({ email: 'abc@xyz.pl' });
    expect(result).toBe(true);
  });

  it('checkUserFieldUniquenessAndThrow should throw error', () => {
    jest.spyOn(UserService.prototype, 'checkUserFieldUniqueness').mockResolvedValue(false);

    expect(
      async () => await service.checkUserFieldUniquenessAndThrow({ email: 'abc@xyz.pl' }),
    ).rejects.toThrowError(ConflictException);
  });

  it("checkUserFieldUniquenessAndThrow shouldn't throw error", async () => {
    jest.spyOn(UserService.prototype, 'checkUserFieldUniqueness').mockResolvedValue(true);

    await expect(
      service.checkUserFieldUniquenessAndThrow({ email: 'abc@xyz.pl' }),
    ).resolves.toBeUndefined();
  });

  it('checkAdminTokenFieldUniqueness should return false', async () => {
    jest.spyOn(AdminToken, 'count').mockResolvedValue(1);

    const result = await service.checkAdminTokenFieldUniqueness({
      email: 'abc@xyz.pl',
    });

    expect(result).toBe(false);
  });

  it('checkAdminTokenFieldUniqueness should return true', async () => {
    jest.spyOn(AdminToken, 'count').mockResolvedValue(0);

    const result = await service.checkAdminTokenFieldUniqueness({
      email: 'abc@xyz.pl',
    });

    expect(result).toBe(true);
  });

  it('newAdminToken should return new token', async () => {
    jest.spyOn(AdminToken, 'count').mockResolvedValue(0);

    const result = await service.newAdminToken();

    expect(result).toBeDefined();
    expect(result.length).toBe(36);
  });

  it("create should throw conflict ConflictException if email or username isn't unique", async () => {
    const existEmail = 'exist@example.com';
    const existUsername = 'existUsername';
    jest
      .spyOn(UserService.prototype, 'checkUserFieldUniquenessAndThrow')
      .mockImplementation((value: any): any => {
        if (value.email === existEmail) throw new ConflictException();
        if (value.username === existUsername) throw new ConflictException();
      });

    const result = await service.create(createUserDtoMock, UserRole.User);

    expect(result).toBeDefined();
    await expect(async () =>
      service.create({ ...createUserDtoMock, email: existEmail }, UserRole.User),
    ).rejects.toThrowError(ConflictException);

    await expect(async () =>
      service.create({ ...createUserDtoMock, username: existUsername }, UserRole.User),
    ).rejects.toThrowError(ConflictException);
  });

  it('create should save record in database', async () => {
    jest
      .spyOn(UserService.prototype, 'checkUserFieldUniquenessAndThrow')
      .mockResolvedValue(undefined);

    await service.create(createUserDtoMock, UserRole.User);

    expect(userSaveMock.mock.calls.length).toBe(1);
  });

  it('create should return correctData', async () => {
    jest
      .spyOn(UserService.prototype, 'checkUserFieldUniquenessAndThrow')
      .mockResolvedValue(undefined);

    const result = await service.create(createUserDtoMock, UserRole.User);
    result.jwtId = 'abc';
    result.id = userId;
    result.hashPwd = '$2a$13$Iwf5vi4HLT8GMHysIbbEH.DjVgeC/8O.VJj/o0gJtqB2S9tKhvnP6';

    expect(result).toEqual(userMock);
  });

  it('create should return data with correct role', async () => {
    jest
      .spyOn(UserService.prototype, 'checkUserFieldUniquenessAndThrow')
      .mockResolvedValue(undefined);

    const resultUser = await service.create(createUserDtoMock, UserRole.User);
    const resultAdmin = await service.create(createUserDtoMock, UserRole.Admin);

    expect(resultUser.role).toBe(UserRole.User);
    expect(resultAdmin.role).toBe(UserRole.Admin);
  });

  it('createUser should return correct data', async () => {
    let createArgs: any = {};
    jest
      .spyOn(UserService.prototype, 'create')
      .mockImplementation(async (createUserDto: any, role: UserRole) => {
        createArgs = {
          body: createUserDto,
          role,
        };
        return userMock;
      });

    const result = await service.create(createUserDtoMock, UserRole.User);

    expect(result).toBeDefined();
    expect(createArgs.role).toBe(UserRole.User);
    expect(createArgs.body).toEqual(createUserDtoMock);
  });

  it('createAdmin should throw BadRequestException if token is empty', async () => {
    await expect(async () => service.createAdmin('', createUserDtoMock)).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('createAdmin should throw NotFoundException if admin token not found', async () => {
    jest.spyOn(AdminToken, 'findOne').mockResolvedValue(null);

    await expect(async () =>
      service.createAdmin(adminToken, createUserDtoMock),
    ).rejects.toThrowError(NotFoundException);
  });

  it('createAdmin should return correct data', async () => {
    const createArgs: any = {};
    jest
      .spyOn(UserService.prototype, 'create')
      .mockImplementation(async (createUserDto: any, role: UserRole) => {
        createArgs.body = createUserDto;
        createArgs.role = role;
        return userMock;
      });
    jest.spyOn(AdminToken, 'findOne').mockResolvedValue(adminTokenMock);

    const result = await service.createAdmin(adminToken, createUserDtoMock);

    expect(result).toBeDefined();
    expect(createArgs.role).toBe(UserRole.Admin);
    expect(createArgs.body).toEqual(createUserDtoMock);
  });

  it('createAdmin should remove AdminToken', async () => {
    await service.createAdmin(adminToken, createUserDtoMock);

    expect(adminTokenRemoveMock.mock.calls.length).toBe(1);
  });

  it('sendAdminToken should throw ConflictException', async () => {
    const existEmail = 'exist@example.com';
    jest.spyOn(UserService.prototype, 'newAdminToken').mockResolvedValue(adminToken);
    jest
      .spyOn(UserService.prototype, 'checkUserFieldUniquenessAndThrow')
      .mockImplementation((value: any): any => {
        if (value.email === existEmail) throw new ConflictException();
      });

    const result = await service.sendAdminToken({ email: 'abc' });

    expect(result).toBeDefined();
    await expect(async () => service.sendAdminToken({ email: existEmail })).rejects.toThrowError(
      ConflictException,
    );
  });

  it('sendAdminToken should update admin token if token exist', async () => {
    jest.spyOn(UserService.prototype, 'newAdminToken').mockResolvedValue(adminToken);
    jest.spyOn(AdminToken, 'findOne').mockResolvedValue(adminTokenMock);

    const result = await service.sendAdminToken({ email: 'abc' });

    expect(result).toEqual({ ok: true });
    expect(adminTokenSaveMock.mock.calls.length).toBe(1);
    expect(sendEmailArgs.email).toBe('abc');
    expect(sendEmailArgs.context?.token).toBe(adminToken);
  });

  it("sendAdminToken should create admin token if token don't exist", async () => {
    jest.spyOn(UserService.prototype, 'newAdminToken').mockResolvedValue(adminToken);
    jest.spyOn(AdminToken, 'findOne').mockResolvedValue(null);

    const result = await service.sendAdminToken({ email: 'abc' });

    expect(result).toEqual({ ok: true });
    expect(adminTokenSaveMock.mock.calls.length).toBe(1);
    expect(sendEmailArgs.email).toBe('abc');
    expect(sendEmailArgs.context?.token).toBeDefined();
  });
});
