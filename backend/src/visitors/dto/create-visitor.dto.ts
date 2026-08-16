import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const FOLLOW_UP_STATUSES = [
  'PENDING',
  'CONTACTED',
  'INTERESTED',
  'RESCHEDULED',
  'REGISTERED',
  'NOT_INTERESTED',
  'NO_RESPONSE',
] as const;

export const VISIT_TYPES = ['IN_PERSON', 'PHONE', 'WHATSAPP'] as const;

export const REFERRAL_SOURCES = [
  'SOCIAL_MEDIA',
  'BOOTH_CAMPAIGN',
  'FRIEND_WORD_OF_MOUTH',
  'PARENT_REFERRAL',
  'BANNER_OUTDOOR',
  'WALK_IN',
  'WHATSAPP',
  'GOOGLE_SEARCH',
  'OTHER',
] as const;

export const PROGRAM_TYPES = ['ACADEMIC_YEAR', 'SUMMER_CAMP'] as const;

export class CreateVisitorDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  visitDate: string;

  @IsIn(VISIT_TYPES as unknown as string[])
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

export class CreateFollowUpDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsIn(FOLLOW_UP_STATUSES as unknown as string[])
  result?: string;
}
