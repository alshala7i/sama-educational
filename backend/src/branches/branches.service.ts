import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    const existing = await this.prisma.branch.findUnique({
      where: { name: createBranchDto.name },
    });

    if (existing) {
      throw new BadRequestException('Branch with this name already exists');
    }

    const branch = await this.prisma.branch.create({
      data: createBranchDto,
    });

    return branch;
  }

  async findAll() {
    const branches = await this.prisma.branch.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { students: { where: { status: 'ACTIVE' } } },
        },
      },
    });

    return branches.map(b => ({
      ...b,
      studentCount: b._count.students,
    }));
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (updateBranchDto.name && updateBranchDto.name !== branch.name) {
      const existing = await this.prisma.branch.findUnique({
        where: { name: updateBranchDto.name },
      });

      if (existing) {
        throw new BadRequestException('Branch with this name already exists');
      }
    }

    const updatedBranch = await this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });

    return updatedBranch;
  }

  async getPerformance(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const studentCount = await this.prisma.student.count({
      where: { branchId },
    });

    const totalCapacity = branch.capacity;
    const occupancyRate = Math.round((studentCount / totalCapacity) * 100);

    const fees = await this.prisma.fee.findMany({
      where: {
        student: { branchId },
        paymentStatus: 'PAID',
      },
    });

    const revenue = fees.reduce((sum, fee) => sum + fee.amount, 0);

    const expenses = await this.prisma.expense.findMany({
      where: { branchId },
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return {
      branch,
      studentCount,
      occupancyRate,
      revenue,
      expenses: totalExpenses,
      profit: revenue - totalExpenses,
    };
  }
}
