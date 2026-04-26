import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Post()
  create(@Body() createMaintenanceDto: CreateMaintenanceDto, @Request() req) {
    return this.maintenanceService.create(createMaintenanceDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.maintenanceService.findAll(branchId, status, priority);
  }

  @Get('open')
  getOpenRequests() {
    return this.maintenanceService.getOpenRequests();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateMaintenanceDto: UpdateMaintenanceDto) {
    return this.maintenanceService.updateStatus(id, updateMaintenanceDto);
  }
}
