import { Module } from '@nestjs/common';
import { DailyLogsService } from './daily-logs.service';
import { DailyLogsController } from './daily-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DailyLogsService],
  controllers: [DailyLogsController],
  exports: [DailyLogsService],
})
export class DailyLogsModule {}
