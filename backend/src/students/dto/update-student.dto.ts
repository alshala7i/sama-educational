import { IsOptional, IsString, IsInt, IsEnum, Min, Max, IsUUID } from 'class-validator';
import { StudentStatus } from '../../common/enums';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(6)
  age?: number;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @IsOptional()
  @IsUUID()
  classId?: string;
}
