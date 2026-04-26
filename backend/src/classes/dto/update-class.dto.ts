import { IsOptional, IsString, IsInt, IsEnum, Min } from 'class-validator';
import { ClassLevel } from '../../common/enums';

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ClassLevel)
  level?: ClassLevel;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
