import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    const existing = await this.prisma.class.findUnique({
      where: {
        name_branchId: {
          name: createClassDto.name,
          branchId: createClassDto.branchId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Class with this name already exists in this branch');
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: createClassDto.branchId },
    });

    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    const cls = await this.prisma.class.create({
      data: createClassDto,
    });

    return cls;
  }

  async findAll(branchId?: string) {
    const classes = await this.prisma.class.findMany({
      where: branchId ? { branchId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    return classes;
  }

  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!cls) {
      throw new NotFoundException('Class not found');
    }

    return cls;
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    const cls = await this.prisma.class.findUnique({ where: { id } });

    if (!cls) {
      throw new NotFoundException('Class not found');
    }

    if (updateClassDto.name && updateClassDto.name !== cls.name) {
      const existing = await this.prisma.class.findUnique({
        where: {
          name_branchId: {
            name: updateClassDto.name,
            branchId: cls.branchId,
          },
        },
      });

      if (existing) {
        throw new BadRequestException('Class with this name already exists in this branch');
      }
    }

    const updatedClass = await this.prisma.class.update({
      where: { id },
      data: updateClassDto,
    });

    return updatedClass;
  }
}
