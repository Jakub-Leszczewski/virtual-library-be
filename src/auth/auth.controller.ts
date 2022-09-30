import { Controller, Post, UseGuards, HttpCode, Res, Delete, Inject, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserObj } from '../common/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUserFromTokenResponse, LoginResponse, LogoutResponse } from '../types';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(UserService) private userService: UserService,
  ) {}

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  async login(
    @UserObj() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    return this.authService.login(user, res);
  }

  @Delete('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @UserObj() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponse> {
    return this.authService.logout(user, res);
  }

  @Get('/user')
  @UseGuards(JwtAuthGuard)
  async getAuthUser(@UserObj() user: User): Promise<GetUserFromTokenResponse> {
    return this.userService.filter(user);
  }
}
