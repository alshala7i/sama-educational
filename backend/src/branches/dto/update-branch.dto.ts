import { IsOptional, IsString, IsInt, IsEnum, Min } from 'class-validator';
import { BranchStatus } from '../../common/enums';

export class UpdateBranchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  numClasses?: number;

  @IsOptional()
  @IsEnum(BranchStatus)
  status?: BranchStatus;
}
