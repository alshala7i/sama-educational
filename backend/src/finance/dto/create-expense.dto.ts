import { IsUUID, IsNumber, IsEnum, IsDateString, IsOptional, IsString, Min } from 'class-validator';
import { ExpenseCategory } from '../../common/enums';

export class CreateExpenseDto {
  @IsUUID()
  branchId: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  description?: string;
}
