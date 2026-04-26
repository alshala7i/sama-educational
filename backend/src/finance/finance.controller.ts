import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Post('fees')
  createFee(@Body() createFeeDto: CreateFeeDto) {
    return this.financeService.createFee(createFeeDto);
  }

  @Get('fees')
  getFees(@Query('branchId') branchId?: string, @Query('paymentStatus') paymentStatus?: string) {
    return this.financeService.getFees(branchId, paymentStatus);
  }

  @Patch('fees/:id')
  updateFeeStatus(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    return this.financeService.updateFeeStatus(id, updateFeeDto);
  }

  @Post('expenses')
  createExpense(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return this.financeService.createExpense(createExpenseDto, req.user.id);
  }

  @Get('expenses')
  getExpenses(
    @Query('branchId') branchId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.financeService.getExpenses(branchId, month, year);
  }

  @Get('summary')
  getFinancialSummary(@Query('branchId') branchId?: string) {
    return this.financeService.getFinancialSummary(branchId);
  }

  @Get('expense-summary')
  getExpenseSummaryByCategory(@Query('branchId') branchId?: string) {
    return this.financeService.getExpenseSummaryByCategory(branchId);
  }

  @Get('branches/comparison')
  getBranchComparison() {
    return this.financeService.getBranchComparison();
  }
}
