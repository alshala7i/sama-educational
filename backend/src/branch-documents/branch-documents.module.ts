import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BranchDocumentsController } from './branch-documents.controller';
import { BranchDocumentsService } from './branch-documents.service';

@Module({
  imports: [PrismaModule],
  controllers: [BranchDocumentsController],
  providers: [BranchDocumentsService],
  exports: [BranchDocumentsService],
})
export class BranchDocumentsModule {}
