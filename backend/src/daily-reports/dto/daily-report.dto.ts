import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const OVERALL_STATUSES = ['EXCELLENT', 'GOOD', 'NEEDS_ATTENTION', 'CRITICAL'] as const;

export const ISSUE_DEPARTMENTS = [
  'OPERATIONS',
  'STUDENTS',
  'PARENTS',
  'STAFF',
  'MAINTENANCE',
  'ENROLLMENT',
  'OTHER',
] as const;

export const ISSUE_TYPES = [
  'RESIGNATION',
  'TERMINATION',
  'STUDENT_INCIDENT',
  'STUDENT_ABSENCE',
  'PARENT_COMPLAINT',
  'PARENT_SUGGESTION',
  'STAFF_ABSENCE',
  'STAFF_CONDUCT',
  'MAINTENANCE_ISSUE',
  'REQUEST',
  'OTHER',
] as const;

export const ISSUE_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

// Issue types that trigger an immediate notification to senior management
export const CRITICAL_ISSUE_TYPES = ['RESIGNATION', 'TERMINATION', 'STUDENT_INCIDENT'];

export class UpsertDailyReportDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional() @IsInt() @Min(0) childrenPresent?: number;
  @IsOptional() @IsInt() @Min(0) studentAbsenceIssues?: number;
  @IsOptional() @IsInt() @Min(0) parentComplaints?: number;
  @IsOptional() @IsInt() @Min(0) newInquiries?: number;
  @IsOptional() @IsInt() @Min(0) staffAbsences?: number;
  @IsOptional() @IsInt() @Min(0) staffConductIssues?: number;
  @IsOptional() @IsInt() @Min(0) maintenanceIssues?: number;
  @IsOptional() @IsInt() @Min(0) newEnrollments?: number;
  @IsOptional() @IsInt() @Min(0) withdrawals?: number;

  @IsOptional()
  @IsIn(OVERALL_STATUSES as unknown as string[])
  overallStatus?: string;

  @IsOptional()
  @IsString()
  highlights?: string;
}

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsIn(ISSUE_DEPARTMENTS as unknown as string[])
  department: string;

  @IsIn(ISSUE_TYPES as unknown as string[])
  issueType: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  personInvolved?: string;

  @IsOptional()
  @IsIn(ISSUE_SEVERITIES as unknown as string[])
  severity?: string;

  @IsOptional()
  @IsIn(ISSUE_STATUSES as unknown as string[])
  status?: string;

  @IsOptional()
  @IsString()
  actionTaken?: string;

  @IsOptional()
  @IsBoolean()
  needsFollowUp?: boolean;

  @IsOptional()
  @IsString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateIssueDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  date?: string;

  @IsOptional()
  @IsIn(ISSUE_DEPARTMENTS as unknown as string[])
  department?: string;

  @IsOptional()
  @IsIn(ISSUE_TYPES as unknown as string[])
  issueType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  personInvolved?: string;

  @IsOptional()
  @IsIn(ISSUE_SEVERITIES as unknown as string[])
  severity?: string;

  @IsOptional()
  @IsIn(ISSUE_STATUSES as unknown as string[])
  status?: string;

  @IsOptional()
  @IsString()
  actionTaken?: string;

  @IsOptional()
  @IsBoolean()
  needsFollowUp?: boolean;

  @IsOptional()
  @IsString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
