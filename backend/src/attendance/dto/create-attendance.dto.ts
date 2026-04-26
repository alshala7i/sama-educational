import { IsEnum, IsUUID, IsDateString } from 'class-validator';
import { AttendanceStatus } from '../../common/enums';

export class CreateAttendanceDto {
  @IsUUID()
  studentId: string;

  @IsDateString()
  date: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class BulkAttendanceDto {
  records: CreateAttendanceDto[];
}
