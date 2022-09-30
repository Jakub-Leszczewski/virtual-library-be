import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { config } from '../config/config';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { LogoutResponse } from '../types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserService) private userService: UserService,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    if (!username) throw new BadRequestException();

    const user = await User.findOne({
      where: { username },
    });

    if (user) {
      const hashCompareResult = await compare(password, user.hashPwd);

      if (hashCompareResult) {
        return user;
      }
    }

    return null;
  }

  async login(user: User, res: Response): Promise<any> {
    user.jwtId = await this.generateNewJwtId();
    await user.save();

    const payload = { jwtId: user.jwtId };
    res.cookie('access_token', this.jwtService.sign(payload), {
      secure: config.cookieSecure,
      httpOnly: true,
      maxAge: config.jwtCookieTimeToExpire,
      domain: config.jwtCookieDomain,
    });

    return this.userService.filter(user);
  }

  async logout(user: User, res: Response): Promise<LogoutResponse> {
    user.jwtId = null;
    await user.save();

    res.clearCookie('access_token', {
      secure: config.cookieSecure,
      httpOnly: true,
      maxAge: config.jwtCookieTimeToExpire,
      domain: config.jwtCookieDomain,
    });

    return { ok: true };
  }

  async generateNewJwtId(): Promise<string> {
    let isUniqueness: boolean;
    let newJwtId: string;

    do {
      newJwtId = uuid();
      isUniqueness = await this.userService.checkUserFieldUniqueness({
        jwtId: newJwtId,
      });
    } while (!isUniqueness);

    return newJwtId;
  }
}
