import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BookStatus, FindAllQueryDtoInterface } from '../../types';

export class FindAllQueryDto implements FindAllQueryDtoInterface {
  @IsBoolean()
  @IsOptional()
  secure: boolean = false;

  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @IsOptional()
  @IsEnum(BookStatus)
  status: BookStatus = BookStatus.All;
}
