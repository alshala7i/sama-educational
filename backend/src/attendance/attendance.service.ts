import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto, BulkAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: createAttendanceDto.studentId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const date = new Date(createAttendanceDto.date);
    date.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: createAttendanceDto.studentId,
          date,
        },
      },
      update: {
        status: createAttendanceDto.status,
      },
      create: {
        studentId: createAttendanceDto.studentId,
        date,
        status: createAttendanceDto.status,
      },
    });

    return attendance;
  }

  async bulkCreate(bulkAttendanceDto: BulkAttendanceDto) {
    const results = [];
    for (const record of bulkAttendanceDto.records) {
      const result = await this.create(record);
      results.push(result);
    }
    return results;
  }

  async findByClassAndDate(classId: string, date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const students = await this.prisma.student.findMany({
      where: {
        classId,
        status: 'ACTIVE',
      },
      include: {
        attendances: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    return students;
  }

  async getReport(branchId: string, startDate?: string, endDate?: string) {
    const where: any = {
      student: { branchId },
    };

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
        student: true,
      },
      orderBy: { date: 'desc' },
    });

    const studentAttendance = {};
    attendances.forEach((att) => {
      if (!studentAttendance[att.studentId]) {
        studentAttendance[att.studentId] = {
          student: att.student,
          present: 0,
          absent: 0,
          total: 0,
        };
      }

      studentAttendance[att.studentId].total += 1;
      if (att.status === 'PRESENT') {
        studentAttendance[att.studentId].present += 1;
      } else {
        studentAttendance[att.studentId].absent += 1;
      }
    });

    return Object.values(studentAttendance);
  }
}
