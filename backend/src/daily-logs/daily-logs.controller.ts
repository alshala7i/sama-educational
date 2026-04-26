import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { DailyLogsService } from './daily-logs.service';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('daily-logs')
@UseGuards(JwtAuthGuard)
export class DailyLogsController {
  constructor(private dailyLogsService: DailyLogsService) {}

  @Post()
  create(@Body() createDailyLogDto: CreateDailyLogDto, @Request() req) {
    return this.dailyLogsService.create(createDailyLogDto, req.user.id);
  }

  @Get()
  findByBranchAndDate(@Query('branchId') branchId: string, @Query('date') date?: string) {
    return this.dailyLogsService.findByBranchAndDate(branchId, date);
  }

  @Get('missing')
  getMissingLogs(@Query('date') date: string) {
    return this.dailyLogsService.getMissingLogs(date);
  }
}
