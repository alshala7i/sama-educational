import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSuperAdminDashboard() {
    const totalStudents = await this.prisma.student.count({
      where: { status: 'ACTIVE' },
    });

    const totalBranches = await this.prisma.branch.count({
      where: { status: 'ACTIVE' },
    });

    const allStudents = await this.prisma.student.count();
    const capacity = await this.prisma.branch.aggregate({
      _sum: {
        capacity: true,
      },
    });

    const occupancyRate = capacity._sum.capacity
      ? Math.round((allStudents / capacity._sum.capacity) * 100)
      : 0;

    const paidFees = await this.prisma.fee.findMany({
      where: { paymentStatus: 'PAID' },
    });

    const totalRevenue = paidFees.reduce((sum, fee) => sum + fee.amount, 0);

    const expenses = await this.prisma.expense.findMany();
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const openMaintenance = await this.prisma.maintenanceRequest.count({
      where: {
        status: {
          in: ['NEW', 'IN_PROGRESS'],
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const missingLogs = await this.prisma.dailyLog.count({
      where: {
        date: {
          lt: today,
        },
      },
    });

    const allClasses = await this.prisma.class.findMany({
      where: {
        branch: { status: 'ACTIVE' },
      },
    });

    const missingLogsCount = allClasses.length - missingLogs;

    return {
      totalStudents,
      totalBranches,
      occupancyRate,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      openMaintenance,
      missingLogs: Math.max(missingLogsCount, 0),
    };
  }

  async getBranchDashboard(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return null;
    }

    const students = await this.prisma.student.count({
      where: {
        branchId,
        status: 'ACTIVE',
      },
    });

    const occupancyRate = Math.round((students / branch.capacity) * 100);

    const paidFees = await this.prisma.fee.findMany({
      where: {
        student: { branchId },
        paymentStatus: 'PAID',
      },
    });

    const revenue = paidFees.reduce((sum, fee) => sum + fee.amount, 0);

    const expenses = await this.prisma.expense.findMany({
      where: { branchId },
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const classes = await this.prisma.class.count({
      where: { branchId },
    });

    return {
      branch,
      students,
      classes,
      occupancyRate,
      revenue,
      expenses: totalExpenses,
      profit: revenue - totalExpenses,
    };
  }

  async getBranchesAttendance() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const branches = await this.prisma.branch.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { students: { where: { status: 'ACTIVE' } } },
        },
      },
    });

    const result = await Promise.all(
      branches.map(async (branch) => {
        const presentCount = await this.prisma.attendance.count({
          where: {
            status: 'PRESENT',
            date: { gte: today, lt: tomorrow },
            student: { branchId: branch.id, status: 'ACTIVE' },
          },
        });

        const absentCount = await this.prisma.attendance.count({
          where: {
            status: 'ABSENT',
            date: { gte: today, lt: tomorrow },
            student: { branchId: branch.id, status: 'ACTIVE' },
          },
        });

        const totalStudents = branch._count.students;
        const attendanceRate = totalStudents > 0
          ? Math.round((presentCount / totalStudents) * 100)
          : 0;

        return {
          id: branch.id,
          name: branch.name,
          location: branch.location,
          capacity: branch.capacity,
          totalStudents,
          presentToday: presentCount,
          absentToday: absentCount,
          notRecorded: totalStudents - presentCount - absentCount,
          attendanceRate,
        };
      }),
    );

    return result;
  }

  async getRevenueVsExpensesTrend(month?: string, year?: string) {
    const months = [];
    const revenueData = [];
    const expenseData = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push(monthName);

      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      const monthFees = await this.prisma.fee.findMany({
        where: {
          paymentStatus: 'PAID',
          paymentDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const monthRevenue = monthFees.reduce((sum, fee) => sum + fee.amount, 0);
      revenueData.push(monthRevenue);

      const monthExpenses = await this.prisma.expense.findMany({
        where: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      expenseData.push(total);
    }

    return {
      months,
      revenue: revenueData,
      expenses: expenseData,
    };
  }
}
