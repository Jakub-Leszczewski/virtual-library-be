import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SendAdminTokenDto } from './dto/send-admin-token.dto';
import {
  CreateAdminResponse,
  CreateUserResponse,
  SendAdminTokenResponse,
  UserRole,
} from '../types';
import { RoleGuard } from '../common/guards/role.guard';
import { SetRole } from '../common/decorators/set-role.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ValidateAdminTokenGuard } from '../common/guards/validate-admin-token.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    return this.userService.createUser(createUserDto);
  }

  @Post('/admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @SetRole(UserRole.Admin)
  async sendAdminToken(
    @Body() sendAdminTokenDto: SendAdminTokenDto,
  ): Promise<SendAdminTokenResponse> {
    return this.userService.sendAdminToken(sendAdminTokenDto);
  }

  @Post('/admin/:token')
  @UseGuards(ValidateAdminTokenGuard)
  async createAdmin(
    @Param('token') token: string,
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateAdminResponse> {
    return this.userService.createAdmin(token, createUserDto);
  }
}
