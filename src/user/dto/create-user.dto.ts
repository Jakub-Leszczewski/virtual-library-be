import { CreateUserDtoInterface } from '../../types';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { password } from '../../common/constant/regEx';

export class CreateUserDto implements CreateUserDtoInterface {
  @IsString()
  @Length(1, 64)
  firstName: string;

  @IsString()
  @Length(1, 64)
  lastName: string;

  @IsString()
  @Length(1, 64)
  username: string;

  @IsEmail()
  @Length(1, 256)
  email: string;

  @IsString()
  @Length(8, 36)
  @Matches(password)
  password: string;
}
