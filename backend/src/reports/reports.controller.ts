import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('attendance')
  getAttendanceReport(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAttendanceReport(branchId, startDate, endDate);
  }

  @Get('financial')
  getFinancialReport(
    @Query('branchId') branchId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.reportsService.getFinancialReport(branchId, month, year);
  }

  @Get('maintenance')
  getMaintenanceReport(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getMaintenanceReport(branchId, startDate, endDate);
  }

  @Get('branch-performance')
  getBranchPerformanceReport(@Query('month') month?: string, @Query('year') year?: string) {
    return this.reportsService.getBranchPerformanceReport(month, year);
  }
}
