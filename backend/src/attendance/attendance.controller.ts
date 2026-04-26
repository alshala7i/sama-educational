import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, BulkAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Post('bulk')
  bulkCreate(@Body() bulkAttendanceDto: BulkAttendanceDto) {
    return this.attendanceService.bulkCreate(bulkAttendanceDto);
  }

  @Get()
  findByClassAndDate(@Query('classId') classId: string, @Query('date') date: string) {
    return this.attendanceService.findByClassAndDate(classId, date);
  }

  @Get('report')
  getReport(
    @Query('branchId') branchId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getReport(branchId, startDate, endDate);
  }
}
