import { IsString, IsInt, IsUUID, Min, Max } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(2)
  @Max(6)
  age: number;

  @IsUUID()
  branchId: string;

  @IsUUID()
  classId: string;
}
