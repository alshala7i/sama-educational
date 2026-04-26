export type UserRole = 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'STAFF' | 'MAINTENANCE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  capacity: number;
  numClasses: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  level: 'NURSERY' | 'KG1' | 'KG2';
  capacity: number;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { students: number };
}

export interface Student {
  id: string;
  name: string;
  age: number;
  branchId: string;
  classId: string;
  status: 'ACTIVE' | 'WITHDRAWN';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  class?: Class;
  branch?: Branch;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT';
  createdAt: string;
}

export interface DailyLog {
  id: string;
  classId: string;
  date: string;
  studentsPresent: number;
  operationalStatus: boolean;
  note?: string;
  submittedById: string;
  createdAt: string;
  class?: Class;
  submittedBy?: User;
}

export interface MaintenanceRequest {
  id: string;
  branchId: string;
  type: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED';
  createdById: string;
  createdAt: string;
  updatedAt: string;
  branch?: Branch;
  createdBy?: User;
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  paymentStatus: 'PAID' | 'UNPAID';
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
}

export interface Expense {
  id: string;
  branchId: string;
  category: 'RENT' | 'SALARIES' | 'OPERATIONS' | 'MAINTENANCE' | 'OTHER';
  amount: number;
  date: string;
  description?: string;
  createdById: string;
  createdAt: string;
  branch?: Branch;
  createdBy?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalBranches: number;
  occupancyRate: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  openMaintenance: number;
  missingLogs: number;
}

export interface BranchDashboard {
  branch: Branch;
  students: number;
  classes: number;
  occupancyRate: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}
