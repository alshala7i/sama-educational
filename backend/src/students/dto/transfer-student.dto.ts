import { IsUUID } from 'class-validator';

export class TransferStudentDto {
  @IsUUID()
  classId: string;
}
