import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('super-admin')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  getSuperAdminDashboard() {
    return this.dashboardService.getSuperAdminDashboard();
  }

  @Get('branch/:id')
  getBranchDashboard(@Param('id') branchId: string) {
    return this.dashboardService.getBranchDashboard(branchId);
  }

  @Get('branches-attendance')
  getBranchesAttendance() {
    return this.dashboardService.getBranchesAttendance();
  }

  @Get('trend')
  getTrend(@Query('month') month?: string, @Query('year') year?: string) {
    return this.dashboardService.getRevenueVsExpensesTrend(month, year);
  }
}
