import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { TransferStudentDto } from './dto/transfer-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    const cls = await this.prisma.class.findUnique({
      where: { id: createStudentDto.classId },
    });

    if (!cls) {
      throw new BadRequestException('Class not found');
    }

    if (cls.branchId !== createStudentDto.branchId) {
      throw new BadRequestException('Class does not belong to the specified branch');
    }

    const student = await this.prisma.student.create({
      data: createStudentDto,
    });

    return student;
  }

  async findAll(
    branchId?: string,
    classId?: string,
    status?: string,
    search?: string,
    skip = 0,
    take = 10,
  ) {
    const where: any = {};

    if (branchId) where.branchId = branchId;
    if (classId) where.classId = classId;
    if (status) where.status = status;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          class: true,
          branch: true,
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        branch: true,
        fees: true,
        attendances: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { id } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (updateStudentDto.classId) {
      const cls = await this.prisma.class.findUnique({
        where: { id: updateStudentDto.classId },
      });

      if (!cls) {
        throw new BadRequestException('Class not found');
      }

      if (cls.branchId !== student.branchId) {
        throw new BadRequestException('Class does not belong to the student\'s branch');
      }
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });

    return updatedStudent;
  }

  async transfer(id: string, transferStudentDto: TransferStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { id } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const cls = await this.prisma.class.findUnique({
      where: { id: transferStudentDto.classId },
    });

    if (!cls) {
      throw new BadRequestException('Class not found');
    }

    if (cls.branchId !== student.branchId) {
      throw new BadRequestException('Cannot transfer student to class in different branch');
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: { classId: transferStudentDto.classId },
    });

    return updatedStudent;
  }
}
