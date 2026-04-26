import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getAttendanceReport(branchId?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (branchId) {
      where.student = { branchId };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      where.date = {
        gte: start,
        lte: end,
      };
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            class: true,
            branch: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const summary = {};
    attendances.forEach((att) => {
      const key = att.student.id;
      if (!summary[key]) {
        summary[key] = {
          student: att.student,
          present: 0,
          absent: 0,
        };
      }
      if (att.status === 'PRESENT') {
        summary[key].present++;
      } else {
        summary[key].absent++;
      }
    });

    return Object.values(summary);
  }

  async getFinancialReport(branchId?: string, month?: string, year?: string) {
    const where: any = {};

    if (branchId) {
      where.student = { branchId };
    }

    const fees = await this.prisma.fee.findMany({
      where,
      include: {
        student: {
          include: {
            class: true,
            branch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let expenses = [];

    const expenseWhere: any = {};
    if (branchId) expenseWhere.branchId = branchId;

    if (month && year) {
      const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      expenseWhere.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    expenses = await this.prisma.expense.findMany({
      where: expenseWhere,
      include: {
        branch: true,
      },
      orderBy: { date: 'desc' },
    });

    const totalRevenue = fees
      .filter((f) => f.paymentStatus === 'PAID')
      .reduce((sum, f) => sum + f.amount, 0);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return {
      fees,
      expenses,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    };
  }

  async getMaintenanceReport(branchId?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (branchId) where.branchId = branchId;

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: start,
        lte: end,
      };
    }

    const requests = await this.prisma.maintenanceRequest.findMany({
      where,
      include: {
        branch: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      total: requests.length,
      byStatus: {
        NEW: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
      },
      byPriority: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
      },
    };

    requests.forEach((req) => {
      summary.byStatus[req.status]++;
      summary.byPriority[req.priority]++;
    });

    return {
      requests,
      summary,
    };
  }

  async getBranchPerformanceReport(month?: string, year?: string) {
    const branches = await this.prisma.branch.findMany({
      where: { status: 'ACTIVE' },
    });

    const report = [];

    for (const branch of branches) {
      const students = await this.prisma.student.count({
        where: {
          branchId: branch.id,
          status: 'ACTIVE',
        },
      });

      const fees = await this.prisma.fee.findMany({
        where: {
          student: { branchId: branch.id },
          paymentStatus: 'PAID',
        },
      });

      const revenue = fees.reduce((sum, f) => sum + f.amount, 0);

      const expenses = await this.prisma.expense.findMany({
        where: { branchId: branch.id },
      });

      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      const occupancyRate = Math.round((students / branch.capacity) * 100);

      const classes = await this.prisma.class.count({
        where: { branchId: branch.id },
      });

      report.push({
        branch: branch.name,
        branchId: branch.id,
        students,
        classes,
        capacity: branch.capacity,
        occupancyRate,
        revenue,
        expenses: totalExpenses,
        profit: revenue - totalExpenses,
      });
    }

    return report;
  }
}
