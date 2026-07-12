import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import { BranchDocumentsService } from './branch-documents.service';
import { CreateBranchDocumentDto } from './dto/create-branch-document.dto';
import { UpdateBranchDocumentDto } from './dto/update-branch-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const UPLOAD_DIR = './uploads/documents';
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const fileUploadOptions = {
  storage: diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    },
    filename: (_req: any, file: any, cb: any) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  fileFilter: (_req: any, file: any, cb: any) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only PDF, JPG and PNG files are allowed'), false);
    }
  },
  limits: { fileSize: MAX_FILE_SIZE },
};

@Controller('branch-documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
export class BranchDocumentsController {
  constructor(private branchDocumentsService: BranchDocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', fileUploadOptions))
  create(
    @Req() req: any,
    @Body() dto: CreateBranchDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.branchDocumentsService.create(req.user, dto, file);
  }

  @Get()
  findAll(@Req() req: any, @Query('branchId') branchId?: string) {
    return this.branchDocumentsService.findAll(req.user, branchId);
  }

  @Get('expiring')
  findExpiring(@Req() req: any) {
    return this.branchDocumentsService.findExpiring(req.user);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.branchDocumentsService.findOne(req.user, id);
  }

  @Get(':id/file')
  async downloadFile(@Req() req: any, @Param('id') id: string, @Res() res: Response) {
    const document = await this.branchDocumentsService.findOne(req.user, id);

    if (!document.filePath || !fs.existsSync(document.filePath)) {
      throw new NotFoundException('File not found on server');
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(document.originalName)}"`,
    );
    fs.createReadStream(document.filePath).pipe(res);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateBranchDocumentDto) {
    return this.branchDocumentsService.update(req.user, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.branchDocumentsService.remove(req.user, id);
  }
}
