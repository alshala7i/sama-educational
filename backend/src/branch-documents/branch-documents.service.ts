import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDocumentDto } from './dto/create-branch-document.dto';
import { UpdateBranchDocumentDto } from './dto/update-branch-document.dto';
import * as fs from 'fs';

const EXPIRY_WARNING_DAYS = 60;

@Injectable()
export class BranchDocumentsService {
  constructor(private prisma: PrismaService) {}

  private assertBranchAccess(user: any, branchId: string) {
    if (user.role === 'SUPER_ADMIN') return;
    if (user.branchId !== branchId) {
      throw new ForbiddenException('You can only manage documents of your own branch');
    }
  }

  private withExpiryStatus(doc: any) {
    const now = new Date();
    const expiry = new Date(doc.expiryDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / msPerDay);

    let expiryStatus = 'VALID';
    if (daysRemaining < 0) expiryStatus = 'EXPIRED';
    else if (daysRemaining <= EXPIRY_WARNING_DAYS) expiryStatus = 'EXPIRING_SOON';

    return { ...doc, daysRemaining, expiryStatus };
  }

  async create(user: any, dto: CreateBranchDocumentDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('A document file (PDF or image) is required');
    }

    this.assertBranchAccess(user, dto.branchId);

    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const expiryDate = new Date(dto.expiryDate);
    if (isNaN(expiryDate.getTime())) {
      throw new BadRequestException('Invalid expiry date');
    }

    const document = await this.prisma.branchDocument.create({
      data: {
        branchId: dto.branchId,
        name: dto.name,
        type: dto.type,
        filePath: file.path,
        originalName: file.originalname,
        mimeType: file.mimetype,
        expiryDate,
        notes: dto.notes || null,
        uploadedById: user.id,
      },
    });

    return this.withExpiryStatus(document);
  }

  async findAll(user: any, branchId?: string) {
    const where: any = {};

    if (user.role === 'SUPER_ADMIN') {
      if (branchId) where.branchId = branchId;
    } else {
      where.branchId = user.branchId;
    }

    const documents = await this.prisma.branchDocument.findMany({
      where,
      orderBy: { expiryDate: 'asc' },
      include: { branch: { select: { id: true, name: true } } },
    });

    return documents.map((d: any) => this.withExpiryStatus(d));
  }

  async findExpiring(user: any) {
    const documents = await this.findAll(user);
    return documents.filter(
      (d: any) => d.expiryStatus === 'EXPIRED' || d.expiryStatus === 'EXPIRING_SOON',
    );
  }

  async findOne(user: any, id: string) {
    const document = await this.prisma.branchDocument.findUnique({
      where: { id },
      include: { branch: { select: { id: true, name: true } } },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    this.assertBranchAccess(user, document.branchId);

    return this.withExpiryStatus(document);
  }

  async update(user: any, id: string, dto: UpdateBranchDocumentDto) {
    const document = await this.findOne(user, id);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.expiryDate !== undefined) {
      const expiryDate = new Date(dto.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        throw new BadRequestException('Invalid expiry date');
      }
      data.expiryDate = expiryDate;
    }

    const updated = await this.prisma.branchDocument.update({
      where: { id: document.id },
      data,
    });

    return this.withExpiryStatus(updated);
  }

  async remove(user: any, id: string) {
    const document = await this.findOne(user, id);

    await this.prisma.branchDocument.delete({ where: { id: document.id } });

    // Best-effort removal of the physical file
    try {
      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch {
      // ignore file system errors on cleanup
    }

    return { message: 'Document deleted' };
  }
}
