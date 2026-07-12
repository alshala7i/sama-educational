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
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('visitors')
@UseGuards(JwtAuthGuard)
export class VisitorsController {
  constructor(private visitorsService: VisitorsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF')
  create(@Req() req: any, @Body() dto: CreateVisitorDto) {
    return this.visitorsService.create(req.user, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF')
  findAll(
    @Req() req: any,
    @Query('branchId') branchId?: string,
    @Query('followUpStatus') followUpStatus?: string,
  ) {
    return this.visitorsService.findAll(req.user, branchId, followUpStatus);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER', 'STAFF')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.visitorsService.findOne(req.user, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateVisitorDto) {
    return this.visitorsService.update(req.user, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.visitorsService.remove(req.user, id);
  }
}
