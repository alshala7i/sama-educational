import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';

@Injectable()
export class DailyLogsService {
  constructor(private prisma: PrismaService) {}

  async create(createDailyLogDto: CreateDailyLogDto, submittedById: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id: createDailyLogDto.classId },
    });

    if (!cls) {
      throw new BadRequestException('Class not found');
    }

    const date = new Date(createDailyLogDto.date);
    date.setHours(0, 0, 0, 0);

    const dailyLog = await this.prisma.dailyLog.upsert({
      where: {
        classId_date: {
          classId: createDailyLogDto.classId,
          date,
        },
      },
      update: {
        studentsPresent: createDailyLogDto.studentsPresent,
        operationalStatus: createDailyLogDto.operationalStatus,
        note: createDailyLogDto.note,
        submittedById,
      },
      create: {
        classId: createDailyLogDto.classId,
        date,
        studentsPresent: createDailyLogDto.studentsPresent,
        operationalStatus: createDailyLogDto.operationalStatus,
        note: createDailyLogDto.note,
        submittedById,
      },
    });

    return dailyLog;
  }

  async findByBranchAndDate(branchId: string, date?: string) {
    const where: any = {
      class: { branchId },
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const logs = await this.prisma.dailyLog.findMany({
      where,
      include: {
        class: true,
        submittedBy: true,
      },
      orderBy: { date: 'desc' },
    });

    return logs;
  }

  async getMissingLogs(date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const allClasses = await this.prisma.class.findMany({
      include: {
        branch: true,
      },
    });

    const existingLogs = await this.prisma.dailyLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { classId: true },
    });

    const existingClassIds = new Set(existingLogs.map((log) => log.classId));

    const missingLogs = allClasses.filter(
      (cls) => !existingClassIds.has(cls.id) && cls.branch.status === 'ACTIVE',
    );

    return missingLogs;
  }
}
