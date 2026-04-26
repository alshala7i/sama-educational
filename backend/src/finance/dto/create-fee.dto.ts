import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateFeeDto {
  @IsUUID()
  studentId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
