import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { createHashPwd } from '../common/utils/create-hash-pwd';
import {
  CreateAdminResponse,
  CreateUserResponse,
  SecureUserData,
  UserRole,
} from '../types';

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
    createUserDto: CreateUserDto,
  ): Promise<CreateAdminResponse> {
    const user = await this.create(createUserDto, UserRole.Admin);
    //@TODO call a function to remove a token
    return this.filter(user);
  }

  async checkUserFieldUniquenessAndThrow(value: {
    [key: string]: any;
  }): Promise<void> {
    const isUniqueness = await this.checkUserFieldUniqueness(value);

    const [key] = Object.keys(value);
    if (!isUniqueness) throw new ConflictException(`${key} is not unique`);
  }

  async checkUserFieldUniqueness(value: {
    [key: string]: any;
  }): Promise<boolean> {
    const user = await User.findOne({
      where: value,
    });

    return !user;
  }

  filter(user: User): SecureUserData {
    const { hashPwd, jwtId, ...userSecureData } = user;

    return userSecureData;
  }
}
