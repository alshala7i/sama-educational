import { IsUUID, IsDateString, IsInt, IsBoolean, IsOptional, IsString, Min } from 'class-validator';

export class CreateDailyLogDto {
  @IsUUID()
  classId: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(0)
  studentsPresent: number;

  @IsBoolean()
  operationalStatus: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}
