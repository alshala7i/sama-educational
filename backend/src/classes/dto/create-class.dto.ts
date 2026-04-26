import { IsString, IsInt, IsEnum, IsUUID, Min } from 'class-validator';
import { ClassLevel } from '../../common/enums';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsEnum(ClassLevel)
  level: ClassLevel;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsUUID()
  branchId: string;
}
