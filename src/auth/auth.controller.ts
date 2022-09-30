import { Controller, Post, UseGuards, HttpCode, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserObj } from '../common/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { LoginResponse } from '../types';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  async login(
    @UserObj() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    return this.authService.login(user, res);
  }
}
