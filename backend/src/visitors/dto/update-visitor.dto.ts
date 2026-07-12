import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FOLLOW_UP_STATUSES } from './create-visitor.dto';

export class UpdateVisitorDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  visitDate?: string;

  @IsOptional()
  @IsIn(['IN_PERSON', 'PHONE'])
  visitType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  childName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  guardianName?: string;

  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @IsOptional()
  @IsString()
  childDob?: string;

  @IsOptional()
  @IsIn(['NURSERY', 'KG1', 'KG2'])
  gradeLevel?: string;

  @IsOptional()
  @IsString()
  heardAboutUs?: string;

  @IsOptional()
  @IsBoolean()
  tookTour?: boolean;

  @IsOptional()
  @IsString()
  tourAccompaniedBy?: string;

  @IsOptional()
  @IsString()
  guardianFeedback?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(FOLLOW_UP_STATUSES as unknown as string[])
  followUpStatus?: string;
}
