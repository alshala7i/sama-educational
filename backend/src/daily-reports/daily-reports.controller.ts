import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DailyReportsService } from './daily-reports.service';
import {
  CreateIssueDto,
  UpdateIssueDto,
  UpsertDailyReportDto,
} from './dto/daily-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('daily-reports')
@UseGuards(JwtAuthGuard)
export class DailyReportsController {
  constructor(private dailyReportsService: DailyReportsService) {}

  // ─── Daily summary ────────────────────────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
  upsert(@Req() req: any, @Body() dto: UpsertDailyReportDto) {
    return this.dailyReportsService.upsertReport(req.user, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF')
  findAll(
    @Req() req: any,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dailyReportsService.getReports(req.user, branchId, from, to);
  }

  @Get('autofill')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
  autofill(
    @Req() req: any,
    @Query('branchId') branchId: string,
    @Query('date') date: string,
  ) {
    return this.dailyReportsService.autofill(req.user, branchId, date);
  }

  @Get('overview')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  overview(@Req() req: any, @Query('date') date: string) {
    return this.dailyReportsService.overview(req.user, date || new Date().toISOString());
  }

  // ─── Issues log ───────────────────────────────────────────────────────────

  @Post('issues')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF')
  createIssue(@Req() req: any, @Body() dto: CreateIssueDto) {
    return this.dailyReportsService.createIssue(req.user, dto);
  }

  @Get('issues')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF')
  getIssues(
    @Req() req: any,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('severity') severity?: string,
    @Query('needsFollowUp') needsFollowUp?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dailyReportsService.getIssues(
      req.user,
      branchId,
      status,
      department,
      severity,
      needsFollowUp,
      from,
      to,
    );
  }

  @Patch('issues/:id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
  updateIssue(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateIssueDto) {
    return this.dailyReportsService.updateIssue(req.user, id, dto);
  }

  @Delete('issues/:id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  removeIssue(@Req() req: any, @Param('id') id: string) {
    return this.dailyReportsService.removeIssue(req.user, id);
  }
}
