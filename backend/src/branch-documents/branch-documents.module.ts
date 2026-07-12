import { Module } from '@nestjs/common';
import { BranchDocumentsController } from './branch-documents.controller';
import { BranchDocumentsService } from './branch-documents.service';

@Module({
  controllers: [BranchDocumentsController],
  providers: [BranchDocumentsService],
  exports: [BranchDocumentsService],
})
export class BranchDocumentsModule {}
