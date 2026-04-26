// Shared enum definitions (SQLite-compatible - stored as strings)

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  STAFF = 'STAFF',
  MAINTENANCE = 'MAINTENANCE',
}

export enum BranchStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ClassLevel {
  NURSERY = 'NURSERY',
  KG1 = 'KG1',
  KG2 = 'KG2',
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  WITHDRAWN = 'WITHDRAWN',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

export enum MaintenanceStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export enum ExpenseCategory {
  RENT = 'RENT',
  SALARIES = 'SALARIES',
  OPERATIONS = 'OPERATIONS',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}
