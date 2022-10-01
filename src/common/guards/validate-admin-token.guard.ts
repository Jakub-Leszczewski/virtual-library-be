import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { AdminToken } from '../../user/entities/admin-token.entity';

@Injectable()
export class ValidateAdminTokenGuard implements CanActivate {
  constructor(@Inject(Reflector) private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.params?.token;
    const email = request.body?.email;

    const adminToken = await AdminToken.findOne({
      where: { email, token },
    });

    return !(!adminToken || adminToken.expiredAt.getTime() < new Date().getTime());
  }
}
