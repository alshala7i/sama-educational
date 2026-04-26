import { IsUUID, IsString, IsEnum, MinLength } from 'class-validator';
import { Priority } from '../../common/enums';

export class CreateMaintenanceDto {
  @IsUUID()
  branchId: string;

  @IsString()
  @MinLength(3)
  type: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsEnum(Priority)
  priority: Priority;
}
