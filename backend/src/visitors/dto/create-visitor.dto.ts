import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const FOLLOW_UP_STATUSES = [
  'PENDING',
  'CONTACTED',
  'INTERESTED',
  'REGISTERED',
  'NOT_INTERESTED',
  'NO_RESPONSE',
] as const;

export class CreateVisitorDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  visitDate: string;

  @IsIn(['IN_PERSON', 'PHONE'])
  visitType: string;

  @IsString()
  @IsNotEmpty()
  childName: string;

  @IsString()
  @IsNotEmpty()
  guardianName: string;

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
