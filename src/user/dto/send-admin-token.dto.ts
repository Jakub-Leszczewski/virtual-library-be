import { SendAdminTokenDtoInterface } from '../../types';
import { IsEmail, Length } from 'class-validator';

export class SendAdminTokenDto implements SendAdminTokenDtoInterface {
  @IsEmail()
  @Length(1, 256)
  email: string;
}
