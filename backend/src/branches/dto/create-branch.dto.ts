import { IsString, IsInt, IsEnum, Min } from 'class-validator';
import { BranchStatus } from '../../common/enums';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsInt()
  @Min(1)
  numClasses: number;

  @IsEnum(BranchStatus)
  status: BranchStatus;
}
