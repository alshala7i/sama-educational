import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CRITICAL_ISSUE_TYPES,
  CreateIssueDto,
  UpdateIssueDto,
  UpsertDailyReportDto,
} from './dto/daily-report.dto';

@Injectable()
export class DailyReportsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private assertBranchAccess(user: any, branchId: string) {
    if (user.role === 'SUPER_ADMIN') return;
    if (user.branchId !== branchId) {
      throw new ForbiddenException('You can only manage reports of your own branch');
    }
  }

  private dayRange(value: string) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  // ─── Daily summary report ─────────────────────────────────────────────────

  async upsertReport(user: any, dto: UpsertDailyReportDto) {
    this.assertBranchAccess(user, dto.branchId);

    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId } });
    if (!branch) throw new NotFoundException('Branch not found');

    const { start } = this.dayRange(dto.date);

    const data: any = {
      managerName: dto.managerName ?? user.name ?? null,
      childrenPresent: dto.childrenPresent ?? 0,
      studentAbsenceIssues: dto.studentAbsenceIssues ?? 0,
      parentComplaints: dto.parentComplaints ?? 0,
      newInquiries: dto.newInquiries ?? 0,
      staffAbsences: dto.staffAbsences ?? 0,
      staffConductIssues: dto.staffConductIssues ?? 0,
      maintenanceIssues: dto.maintenanceIssues ?? 0,
      newEnrollments: dto.newEnrollments ?? 0,
      withdrawals: dto.withdrawals ?? 0,
      overallStatus: dto.overallStatus || 'GOOD',
      highlights: dto.highlights || null,
    };

    const report = await this.prisma.dailyReport.upsert({
      where: { branchId_date: { branchId: dto.branchId, date: start } },
      update: data,
      create: {
        branchId: dto.branchId,
        date: start,
        createdById: user.id,
        ...data,
      },
    });

    // Alert senior management when a branch flags a critical day
    if (report.overallStatus === 'CRITICAL') {
      await this.notifySuperAdmins(
        'BRANCH_CRITICAL',
        `Branch "${branch.name}" reported a CRITICAL day on ${start.toISOString().slice(0, 10)}`,
      );
    }

    return report;
  }

  async getReports(user: any, branchId?: string, from?: string, to?: string) {
    const where: any = {};

    if (user.role === 'SUPER_ADMIN') {
      if (branchId) where.branchId = branchId;
    } else {
      where.branchId = user.branchId;
    }

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = this.dayRange(from).start;
      if (to) where.date.lt = this.dayRange(to).end;
    }

    return this.prisma.dailyReport.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { branch: { select: { id: true, name: true } } },
    });
  }

  /**
   * Pre-fill the daily summary with numbers the system already knows.
   */
  async autofill(user: any, branchId: string, date: string) {
    this.assertBranchAccess(user, branchId);
    const { start, end } = this.dayRange(date);

    const [childrenPresent, newInquiries, maintenanceIssues, newEnrollments, withdrawals, issues] =
      await Promise.all([
        this.prisma.attendance.count({
          where: {
            status: 'PRESENT',
            date: { gte: start, lt: end },
            student: { branchId },
          },
        }),
        this.prisma.visitor.count({
          where: { branchId, visitDate: { gte: start, lt: end } },
        }),
        this.prisma.maintenanceRequest.count({
          where: { branchId, createdAt: { gte: start, lt: end } },
        }),
        this.prisma.student.count({
          where: { branchId, registrationDate: { gte: start, lt: end } },
        }),
        this.prisma.student.count({
          where: { branchId, status: 'WITHDRAWN', updatedAt: { gte: start, lt: end } },
        }),
        this.prisma.branchIssue.findMany({
          where: { branchId, date: { gte: start, lt: end } },
          select: { issueType: true },
        }),
      ]);

    const countType = (types: string[]) =>
      issues.filter((i) => types.includes(i.issueType)).length;

    return {
      childrenPresent,
      newInquiries,
      maintenanceIssues,
      newEnrollments,
      withdrawals,
      studentAbsenceIssues: countType(['STUDENT_ABSENCE']),
      parentComplaints: countType(['PARENT_COMPLAINT']),
      staffAbsences: countType(['STAFF_ABSENCE']),
      staffConductIssues: countType(['STAFF_CONDUCT', 'RESIGNATION', 'TERMINATION']),
    };
  }

  /**
   * Senior-management overview: one row per active branch for a given day.
   */
  async overview(user: any, date: string) {
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only senior management can view the overview');
    }

    const { start, end } = this.dayRange(date);

    const branches = await this.prisma.branch.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    const reports = await this.prisma.dailyReport.findMany({
      where: { date: { gte: start, lt: end } },
    });

    const openIssues = await this.prisma.branchIssue.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      orderBy: [{ severity: 'desc' }, { date: 'desc' }],
      include: { branch: { select: { id: true, name: true } } },
    });

    const needsFollowUp = openIssues.filter((i) => i.needsFollowUp);

    return {
      date: start.toISOString().slice(0, 10),
      branches: branches.map((b) => ({
        ...b,
        report: reports.find((r) => r.branchId === b.id) || null,
      })),
      submittedCount: reports.length,
      totalBranches: branches.length,
      openIssuesCount: openIssues.length,
      needsFollowUpCount: needsFollowUp.length,
      openIssues: openIssues.slice(0, 50),
    };
  }

  // ─── Issues log ───────────────────────────────────────────────────────────

  async createIssue(user: any, dto: CreateIssueDto) {
    this.assertBranchAccess(user, dto.branchId);

    const branch = await this.prisma.branch.findUnique({ where: { id: dto.branchId } });
    if (!branch) throw new NotFoundException('Branch not found');

    const issue = await this.prisma.branchIssue.create({
      data: {
        branchId: dto.branchId,
        date: this.dayRange(dto.date).start,
        department: dto.department,
        issueType: dto.issueType,
        description: dto.description,
        personInvolved: dto.personInvolved || null,
        severity: dto.severity || 'MEDIUM',
        status: dto.status || 'OPEN',
        actionTaken: dto.actionTaken || null,
        needsFollowUp: dto.needsFollowUp ?? false,
        followUpDate: dto.followUpDate ? this.dayRange(dto.followUpDate).start : null,
        notes: dto.notes || null,
        createdById: user.id,
      },
    });

    // Immediate alert for resignations, terminations and student incidents
    if (CRITICAL_ISSUE_TYPES.includes(issue.issueType) || issue.severity === 'URGENT') {
      await this.notifySuperAdmins(
        'CRITICAL_BRANCH_ISSUE',
        `[${branch.name}] ${issue.issueType}: ${issue.description.slice(0, 120)}`,
      );
    }

    return issue;
  }

  async getIssues(
    user: any,
    branchId?: string,
    status?: string,
    department?: string,
    severity?: string,
    needsFollowUp?: string,
    from?: string,
    to?: string,
  ) {
    const where: any = {};

    if (user.role === 'SUPER_ADMIN') {
      if (branchId) where.branchId = branchId;
    } else {
      where.branchId = user.branchId;
    }

    if (status) where.status = status;
    if (department) where.department = department;
    if (severity) where.severity = severity;
    if (needsFollowUp === 'true') where.needsFollowUp = true;

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = this.dayRange(from).start;
      if (to) where.date.lt = this.dayRange(to).end;
    }

    return this.prisma.branchIssue.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: { branch: { select: { id: true, name: true } } },
    });
  }

  async updateIssue(user: any, id: string, dto: UpdateIssueDto) {
    const issue = await this.prisma.branchIssue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');
    this.assertBranchAccess(user, issue.branchId);

    const data: any = {};
    if (dto.date !== undefined) data.date = this.dayRange(dto.date).start;
    if (dto.department !== undefined) data.department = dto.department;
    if (dto.issueType !== undefined) data.issueType = dto.issueType;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.personInvolved !== undefined) data.personInvolved = dto.personInvolved || null;
    if (dto.severity !== undefined) data.severity = dto.severity;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.actionTaken !== undefined) data.actionTaken = dto.actionTaken || null;
    if (dto.needsFollowUp !== undefined) data.needsFollowUp = dto.needsFollowUp;
    if (dto.followUpDate !== undefined) {
      data.followUpDate = dto.followUpDate ? this.dayRange(dto.followUpDate).start : null;
    }
    if (dto.notes !== undefined) data.notes = dto.notes || null;

    return this.prisma.branchIssue.update({ where: { id }, data });
  }

  async removeIssue(user: any, id: string) {
    const issue = await this.prisma.branchIssue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException('Issue not found');
    this.assertBranchAccess(user, issue.branchId);

    await this.prisma.branchIssue.delete({ where: { id } });
    return { message: 'Issue deleted' };
  }

  // ─── Reminders ────────────────────────────────────────────────────────────

  /**
   * At 17:00 every day, remind branch managers who have not yet submitted
   * their daily report, and tell senior management which branches are missing.
   */
  @Cron('0 17 * * *')
  async remindMissingReports() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const branches = await this.prisma.branch.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
    });

    const reports = await this.prisma.dailyReport.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      select: { branchId: true },
    });
    const submitted = new Set(reports.map((r) => r.branchId));

    const missing = branches.filter((b) => !submitted.has(b.id));
    if (missing.length === 0) return;

    const users = await this.prisma.user.findMany({ where: { isActive: true } });

    for (const branch of missing) {
      const managers = users.filter(
        (u) => u.role === 'BRANCH_MANAGER' && u.branchId === branch.id,
      );
      for (const manager of managers) {
        await this.notifications.create(
          manager.id,
          'MISSING_DAILY_REPORT',
          `Daily branch report for "${branch.name}" has not been submitted yet today`,
        );
      }
    }

    const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN');
    const names = missing.map((b) => b.name).join(', ');
    for (const admin of superAdmins) {
      await this.notifications.create(
        admin.id,
        'MISSING_DAILY_REPORT',
        `${missing.length} branch daily report(s) missing today: ${names}`,
      );
    }
  }

  private async notifySuperAdmins(type: string, message: string) {
    const superAdmins = await this.prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', isActive: true },
    });
    for (const admin of superAdmins) {
      await this.notifications.create(admin.id, type, message);
    }
  }
}
