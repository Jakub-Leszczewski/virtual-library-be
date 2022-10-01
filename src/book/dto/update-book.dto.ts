import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { IsString, Length } from 'class-validator';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsString()
  @Length(1, 128)
  title: string;

  @IsString()
  @Length(1, 128)
  author: string;

  @IsString()
  @Length(17, 17)
  isbn: string;
}
