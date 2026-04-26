import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(createMaintenanceDto: CreateMaintenanceDto, createdById: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: createMaintenanceDto.branchId },
    });

    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    const maintenance = await this.prisma.maintenanceRequest.create({
      data: {
        ...createMaintenanceDto,
        createdById,
      },
      include: {
        createdBy: true,
        branch: true,
      },
    });

    return maintenance;
  }

  async findAll(branchId?: string, status?: string, priority?: string) {
    const where: any = {};

    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const requests = await this.prisma.maintenanceRequest.findMany({
      where,
      include: {
        createdBy: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  async findOne(id: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        createdBy: true,
        branch: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    return request;
  }

  async updateStatus(id: string, updateMaintenanceDto: UpdateMaintenanceDto) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    const updated = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status: updateMaintenanceDto.status },
      include: {
        createdBy: true,
        branch: true,
      },
    });

    return updated;
  }

  async getOpenRequests() {
    return this.prisma.maintenanceRequest.findMany({
      where: {
        status: {
          in: ['NEW', 'IN_PROGRESS'],
        },
      },
      include: {
        branch: true,
        createdBy: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }
}
