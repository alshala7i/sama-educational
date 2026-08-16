import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowUpDto, CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';

@Injectable()
export class VisitorsService {
  constructor(private prisma: PrismaService) {}

  private assertBranchAccess(user: any, branchId: string) {
    if (user.role === 'SUPER_ADMIN') return;
    if (user.branchId !== branchId) {
      throw new ForbiddenException('You can only manage visitors of your own branch');
    }
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${field}`);
    }
    return date;
  }

  async create(user: any, dto: CreateVisitorDto) {
    this.assertBranchAccess(user, dto.branchId);

    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.visitor.create({
      data: {
        branchId: dto.branchId,
        visitDate: this.parseDate(dto.visitDate, 'visit date'),
        visitType: dto.visitType,
        childName: dto.childName,
        guardianName: dto.guardianName,
        guardianPhone: dto.guardianPhone || null,
        childDob: dto.childDob ? this.parseDate(dto.childDob, 'child date of birth') : null,
        gradeLevel: dto.gradeLevel || null,
        heardAboutUs: dto.heardAboutUs || null,
        heardAboutUsDetail: dto.heardAboutUsDetail || null,
        tookTour: dto.tookTour ?? false,
        tourAccompaniedBy: dto.tourAccompaniedBy || null,
        handledBy: dto.handledBy || null,
        guardianFeedback: dto.guardianFeedback || null,
        managementRemarks: dto.managementRemarks || null,
        notes: dto.notes || null,
        followUpStatus: dto.followUpStatus || 'PENDING',
        targetBranch: dto.targetBranch || null,
        isTransfer: dto.isTransfer ?? false,
        transferFrom: dto.transferFrom || null,
        programType: dto.programType || null,
        academicYear: dto.academicYear || null,
        createdById: user.id,
      },
    });
  }

  async findAll(
    user: any,
    branchId?: string,
    followUpStatus?: string,
    visitType?: string,
    heardAboutUs?: string,
    programType?: string,
  ) {
    const where: any = {};

    if (user.role === 'SUPER_ADMIN') {
      if (branchId) where.branchId = branchId;
    } else {
      where.branchId = user.branchId;
    }

    if (followUpStatus) where.followUpStatus = followUpStatus;
    if (visitType) where.visitType = visitType;
    if (heardAboutUs) where.heardAboutUs = heardAboutUs;
    if (programType) where.programType = programType;

    return this.prisma.visitor.findMany({
      where,
      orderBy: { visitDate: 'desc' },
      include: {
        branch: { select: { id: true, name: true } },
        followUps: { orderBy: { date: 'asc' } },
      },
    });
  }

  async findOne(user: any, id: string) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true } },
        followUps: { orderBy: { date: 'asc' } },
      },
    });

    if (!visitor) {
      throw new NotFoundException('Visitor record not found');
    }

    this.assertBranchAccess(user, visitor.branchId);

    return visitor;
  }

  async update(user: any, id: string, dto: UpdateVisitorDto) {
    const visitor = await this.findOne(user, id);

    const data: any = {};
    if (dto.visitDate !== undefined) data.visitDate = this.parseDate(dto.visitDate, 'visit date');
    if (dto.visitType !== undefined) data.visitType = dto.visitType;
    if (dto.childName !== undefined) data.childName = dto.childName;
    if (dto.guardianName !== undefined) data.guardianName = dto.guardianName;
    if (dto.guardianPhone !== undefined) data.guardianPhone = dto.guardianPhone || null;
    if (dto.childDob !== undefined) {
      data.childDob = dto.childDob ? this.parseDate(dto.childDob, 'child date of birth') : null;
    }
    if (dto.gradeLevel !== undefined) data.gradeLevel = dto.gradeLevel || null;
    if (dto.heardAboutUs !== undefined) data.heardAboutUs = dto.heardAboutUs || null;
    if (dto.heardAboutUsDetail !== undefined)
      data.heardAboutUsDetail = dto.heardAboutUsDetail || null;
    if (dto.tookTour !== undefined) data.tookTour = dto.tookTour;
    if (dto.tourAccompaniedBy !== undefined) data.tourAccompaniedBy = dto.tourAccompaniedBy || null;
    if (dto.handledBy !== undefined) data.handledBy = dto.handledBy || null;
    if (dto.guardianFeedback !== undefined) data.guardianFeedback = dto.guardianFeedback || null;
    if (dto.managementRemarks !== undefined)
      data.managementRemarks = dto.managementRemarks || null;
    if (dto.notes !== undefined) data.notes = dto.notes || null;
    if (dto.followUpStatus !== undefined) data.followUpStatus = dto.followUpStatus;
    if (dto.targetBranch !== undefined) data.targetBranch = dto.targetBranch || null;
    if (dto.isTransfer !== undefined) data.isTransfer = dto.isTransfer;
    if (dto.transferFrom !== undefined) data.transferFrom = dto.transferFrom || null;
    if (dto.programType !== undefined) data.programType = dto.programType || null;
    if (dto.academicYear !== undefined) data.academicYear = dto.academicYear || null;

    return this.prisma.visitor.update({
      where: { id: visitor.id },
      data,
    });
  }

  async remove(user: any, id: string) {
    const visitor = await this.findOne(user, id);
    await this.prisma.visitor.delete({ where: { id: visitor.id } });
    return { message: 'Visitor record deleted' };
  }

  // ─── Follow-ups ────────────────────────────────────────────────────────────

  async addFollowUp(user: any, visitorId: string, dto: CreateFollowUpDto) {
    const visitor = await this.findOne(user, visitorId);

    const followUp = await this.prisma.visitorFollowUp.create({
      data: {
        visitorId: visitor.id,
        date: this.parseDate(dto.date, 'follow-up date'),
        note: dto.note || null,
        result: dto.result || null,
        createdById: user.id,
      },
    });

    // Reflect the latest follow-up result on the visitor record itself
    if (dto.result) {
      await this.prisma.visitor.update({
        where: { id: visitor.id },
        data: { followUpStatus: dto.result },
      });
    }

    return followUp;
  }

  async removeFollowUp(user: any, visitorId: string, followUpId: string) {
    const visitor = await this.findOne(user, visitorId);

    const followUp = await this.prisma.visitorFollowUp.findUnique({
      where: { id: followUpId },
    });
    if (!followUp || followUp.visitorId !== visitor.id) {
      throw new NotFoundException('Follow-up record not found');
    }

    await this.prisma.visitorFollowUp.delete({ where: { id: followUpId } });
    return { message: 'Follow-up deleted' };
  }

  // ─── Conversion statistics ────────────────────────────────────────────────

  async conversionStats(user: any, branchId?: string) {
    const where: any = {};
    if (user.role === 'SUPER_ADMIN') {
      if (branchId) where.branchId = branchId;
    } else {
      where.branchId = user.branchId;
    }

    const visitors = await this.prisma.visitor.findMany({
      where,
      select: {
        heardAboutUs: true,
        followUpStatus: true,
        visitType: true,
        programType: true,
        branch: { select: { id: true, name: true } },
      },
    });

    const total = visitors.length;
    const registered = visitors.filter((v) => v.followUpStatus === 'REGISTERED').length;

    const groupBy = (key: (v: any) => string) => {
      const map: Record<string, { total: number; registered: number }> = {};
      for (const v of visitors) {
        const k = key(v) || 'UNKNOWN';
        if (!map[k]) map[k] = { total: 0, registered: 0 };
        map[k].total += 1;
        if (v.followUpStatus === 'REGISTERED') map[k].registered += 1;
      }
      return map;
    };

    return {
      total,
      registered,
      conversionRate: total > 0 ? Math.round((registered / total) * 100) : 0,
      bySource: groupBy((v) => v.heardAboutUs),
      byType: groupBy((v) => v.visitType),
      byBranch: groupBy((v) => v.branch?.name),
      byProgram: groupBy((v) => v.programType),
      byStatus: groupBy((v) => v.followUpStatus),
    };
  }
}
