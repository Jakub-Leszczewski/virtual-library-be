import { CreateBookDtoInterface } from '../../types';
import { IsString, Length } from 'class-validator';

export class CreateBookDto implements CreateBookDtoInterface {
  @IsString()
  @Length(1, 128)
  title: string;

  @IsString()
  @Length(1, 128)
  author: string;

  @IsString()
  @Length(1, 17)
  isbn: string;
}
