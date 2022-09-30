import { IsBoolean, IsOptional } from 'class-validator';
import { FindOneQueryDtoInterface } from '../../types';

export class FindOneQueryDto implements FindOneQueryDtoInterface {
  @IsBoolean()
  @IsOptional()
  secure: boolean = false;
}
