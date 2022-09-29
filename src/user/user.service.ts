import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { createHashPwd } from '../common/utils/create-hash-pwd';
import {
  CreateAdminResponse,
  CreateUserResponse,
  SecureUserData,
  UserRole,
} from '../types';
import { AdminToken } from './entities/admin-token.entity';
import { SendAdminTokenDto } from './dto/send-admin-token.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto, role: UserRole) {
    const { firstName, lastName, password, email, username } = createUserDto;

    await this.checkUserFieldUniquenessAndThrow({ email });
    await this.checkUserFieldUniquenessAndThrow({ username });

    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.email = email;
    user.hashPwd = await createHashPwd(password);
    user.role = role;
    await user.save();

    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    const user = await this.create(createUserDto, UserRole.User);

    return this.filter(user);
  }

  async createAdmin(
    token: string,
    createUserDto: CreateUserDto,
  ): Promise<CreateAdminResponse> {
    if (!token) throw new BadRequestException();

    const adminToken = await AdminToken.findOne({ where: { token } });
    if (adminToken) throw new NotFoundException();

    const user = await this.create(createUserDto, UserRole.Admin);
    await adminToken.remove();

    return this.filter(user);
  }

  async sendAdminToken({ email }: SendAdminTokenDto) {
    const adminToken = await AdminToken.findOne({ where: { email } });
    const newDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);

    if (adminToken) {
      adminToken.token = await this.newAdminToken();
      adminToken.expiredAt = newDate;
      await adminToken.save();

      return { ok: true };
    }

    const newAdminToken = new AdminToken();
    newAdminToken.email = email;
    newAdminToken.token = await this.newAdminToken();
    newAdminToken.expiredAt = newDate;

    //@TODO implement sendMail
    return { ok: false };
  }

  async newAdminToken(): Promise<string> {
    let token: string;
    let isUniqueness: boolean;

    do {
      token = uuid();
      isUniqueness = await this.checkAdminTokenFieldUniqueness({ token });
    } while (!isUniqueness);

    return token;
  }

  async checkUserFieldUniquenessAndThrow(value: {
    [key: string]: any;
  }): Promise<void> {
    const user = await User.count({
      where: value,
    });

    const [key] = Object.keys(value);
    if (user) throw new ConflictException(`${key} is not unique`);
  }

  async checkAdminTokenFieldUniqueness(value: {
    [key: string]: any;
  }): Promise<boolean> {
    const user = await User.count({
      where: value,
    });

    return !user;
  }

  filter(user: User): SecureUserData {
    const { hashPwd, jwtId, ...userSecureData } = user;

    return userSecureData;
  }
}
