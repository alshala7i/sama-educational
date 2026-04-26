import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async createFee(createFeeDto: CreateFeeDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: createFeeDto.studentId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const fee = await this.prisma.fee.create({
      data: createFeeDto,
      include: {
        student: true,
      },
    });

    return fee;
  }

  async getFees(branchId?: string, paymentStatus?: string) {
    const where: any = {};

    if (branchId) where.student = { branchId };
    if (paymentStatus) where.paymentStatus = paymentStatus;

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

    return fees;
  }

  async updateFeeStatus(id: string, updateFeeDto: UpdateFeeDto) {
    const fee = await this.prisma.fee.findUnique({ where: { id } });

    if (!fee) {
      throw new NotFoundException('Fee not found');
    }

    const updatedFee = await this.prisma.fee.update({
      where: { id },
      data: {
        paymentStatus: updateFeeDto.paymentStatus,
        paymentDate: updateFeeDto.paymentDate ? new Date(updateFeeDto.paymentDate) : fee.paymentDate,
      },
      include: {
        student: true,
      },
    });

    return updatedFee;
  }

  async createExpense(createExpenseDto: CreateExpenseDto, createdById: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: createExpenseDto.branchId },
    });

    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    const expense = await this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        date: new Date(createExpenseDto.date),
        createdById,
      },
      include: {
        branch: true,
        createdBy: true,
      },
    });

    return expense;
  }

  async getExpenses(branchId?: string, month?: string, year?: string) {
    const where: any = {};

    if (branchId) where.branchId = branchId;

    if (month && year) {
      const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        branch: true,
        createdBy: true,
      },
      orderBy: { date: 'desc' },
    });

    return expenses;
  }

  async getFinancialSummary(branchId?: string) {
    const fees = await this.prisma.fee.findMany({
      where: branchId ? { student: { branchId }, paymentStatus: 'PAID' } : { paymentStatus: 'PAID' },
    });

    const revenue = fees.reduce((sum, fee) => sum + fee.amount, 0);

    const expenses = await this.prisma.expense.findMany({
      where: branchId ? { branchId } : {},
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const summary = {
      revenue,
      expenses: totalExpenses,
      profit: revenue - totalExpenses,
    };

    if (branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });
      return { ...summary, branch };
    }

    return summary;
  }

  async getExpenseSummaryByCategory(branchId?: string) {
    const expenses = await this.prisma.expense.findMany({
      where: branchId ? { branchId } : {},
    });

    const summary = {};
    expenses.forEach((exp) => {
      if (!summary[exp.category]) {
        summary[exp.category] = 0;
      }
      summary[exp.category] += exp.amount;
    });

    return summary;
  }

  async getBranchComparison() {
    const branches = await this.prisma.branch.findMany();
    const comparison = [];

    for (const branch of branches) {
      const fees = await this.prisma.fee.findMany({
        where: {
          student: { branchId: branch.id },
          paymentStatus: 'PAID',
        },
      });

      const revenue = fees.reduce((sum, fee) => sum + fee.amount, 0);

      const expenses = await this.prisma.expense.findMany({
        where: { branchId: branch.id },
      });

      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      comparison.push({
        branch: branch.name,
        branchId: branch.id,
        revenue,
        expenses: totalExpenses,
        profit: revenue - totalExpenses,
      });
    }

    return comparison;
  }
}
