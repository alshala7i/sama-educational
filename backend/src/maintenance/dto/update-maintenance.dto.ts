import { IsEnum } from 'class-validator';
import { MaintenanceStatus } from '../../common/enums';

export class UpdateMaintenanceDto {
  @IsEnum(MaintenanceStatus)
  status: MaintenanceStatus;
}
