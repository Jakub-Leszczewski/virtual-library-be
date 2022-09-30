import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';

export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(forwardRef(() => AuthService)) private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(username, password);

    if (!user) throw new UnauthorizedException();

    return user;
  }
}
