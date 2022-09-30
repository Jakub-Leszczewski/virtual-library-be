import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailModule } from '../common/providers/mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
