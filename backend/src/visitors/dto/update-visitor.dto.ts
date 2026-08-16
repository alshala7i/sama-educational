import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  FOLLOW_UP_STATUSES,
  PROGRAM_TYPES,
  REFERRAL_SOURCES,
  VISIT_TYPES,
} from './create-visitor.dto';

export class UpdateVisitorDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  visitDate?: string;

  @IsOptional()
  @IsIn(VISIT_TYPES as unknown as string[])
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
  @IsIn(['NURSERY', 'PRE_KG', 'KG1', 'KG2'])
  gradeLevel?: string;

  @IsOptional()
  @IsIn(REFERRAL_SOURCES as unknown as string[])
  heardAboutUs?: string;

  @IsOptional()
  @IsString()
  heardAboutUsDetail?: string;

  @IsOptional()
  @IsBoolean()
  tookTour?: boolean;

  @IsOptional()
  @IsString()
  tourAccompaniedBy?: string;

  @IsOptional()
  @IsString()
  handledBy?: string;

  @IsOptional()
  @IsString()
  guardianFeedback?: string;

  @IsOptional()
  @IsString()
  managementRemarks?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(FOLLOW_UP_STATUSES as unknown as string[])
  followUpStatus?: string;

  @IsOptional()
  @IsString()
  targetBranch?: string;

  @IsOptional()
  @IsBoolean()
  isTransfer?: boolean;

  @IsOptional()
  @IsString()
  transferFrom?: string;

  @IsOptional()
  @IsIn(PROGRAM_TYPES as unknown as string[])
  programType?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;
}
