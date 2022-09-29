import { Controller, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SendAdminTokenDto } from './dto/send-admin-token.dto';
import {
  CreateAdminResponse,
  CreateUserResponse,
  SendAdminTokenResponse,
} from '../types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponse> {
    return this.userService.createUser(createUserDto);
  }

  @Post('/admin')
  async sendAdminToken(
    @Body() sendAdminTokenDto: SendAdminTokenDto,
  ): Promise<SendAdminTokenResponse> {
    return this.userService.sendAdminToken(sendAdminTokenDto);
  }

  //@TODO create guard that validates the token and email and expired time
  @Post('/admin/:token')
  async createAdmin(
    @Param('token') token: string,
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateAdminResponse> {
    return this.userService.createAdmin(token, createUserDto);
  }
}
