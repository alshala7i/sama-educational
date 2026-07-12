import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
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
        tookTour: dto.tookTour ?? false,
        tourAccompaniedBy: dto.tourAccompaniedBy || null,
        guardianFeedback: dto.guardianFeedback || null,
        notes: dto.notes || null,
        followUpStatus: dto.followUpStatus || 'PENDING',
        createdById: user.id,
      },
    });
  }

  async findAll(user: any, branchId?: string, followUpStatus?: string) {
    const where: any = {};

    if (user.role === 'SUPER_ADMIN') {
      if (branchId) where.branchId = branchId;
    } else {
      where.branchId = user.branchId;
    }

    if (followUpStatus) {
      where.followUpStatus = followUpStatus;
    }

    return this.prisma.visitor.findMany({
      where,
      orderBy: { visitDate: 'desc' },
      include: { branch: { select: { id: true, name: true } } },
    });
  }

  async findOne(user: any, id: string) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      include: { branch: { select: { id: true, name: true } } },
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
    if (dto.tookTour !== undefined) data.tookTour = dto.tookTour;
    if (dto.tourAccompaniedBy !== undefined) data.tourAccompaniedBy = dto.tourAccompaniedBy || null;
    if (dto.guardianFeedback !== undefined) data.guardianFeedback = dto.guardianFeedback || null;
    if (dto.notes !== undefined) data.notes = dto.notes || null;
    if (dto.followUpStatus !== undefined) data.followUpStatus = dto.followUpStatus;

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
}
