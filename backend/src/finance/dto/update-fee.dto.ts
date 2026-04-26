import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { PaymentStatus } from '../../common/enums';

export class UpdateFeeDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}
