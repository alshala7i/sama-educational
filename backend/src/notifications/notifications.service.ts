import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        message,
        isRead: false,
      },
    });

    return notification;
  }

  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return notifications;
  }

  async markAsRead(notificationId: string) {
    const notification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { unreadCount: count };
  }

  @Cron('0 8 * * *')
  async createDailyNotifications() {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const missingLogs = await this.prisma.dailyLog.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const allClasses = await this.prisma.class.count({
      where: {
        branch: { status: 'ACTIVE' },
      },
    });

    if (missingLogs < allClasses) {
      const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN');
      for (const admin of superAdmins) {
        await this.create(
          admin.id,
          'MISSING_DAILY_LOGS',
          `${allClasses - missingLogs} daily logs are missing for today`,
        );
      }
    }

    const unpaidFees = await this.prisma.fee.count({
      where: { paymentStatus: 'UNPAID' },
    });

    if (unpaidFees > 0) {
      const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN');
      for (const admin of superAdmins) {
        await this.create(admin.id, 'UNPAID_FEES', `${unpaidFees} fees are still unpaid`);
      }
    }

    await this.notifyExpiringDocuments(users);

    const openMaintenance = await this.prisma.maintenanceRequest.count({
      where: {
        status: {
          in: ['NEW', 'IN_PROGRESS'],
        },
      },
    });

    if (openMaintenance > 0) {
      const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN');
      for (const admin of superAdmins) {
        await this.create(
          admin.id,
          'OPEN_MAINTENANCE',
          `${openMaintenance} maintenance requests are open`,
        );
      }
    }
  }

  /**
   * Notify SUPER_ADMINs and the relevant BRANCH_MANAGER about branch
   * licenses/contracts that are expired or expiring within 60 days.
   */
  private async notifyExpiringDocuments(users: any[]) {
    const WARNING_DAYS = 60;
    const now = new Date();
    const threshold = new Date(now.getTime() + WARNING_DAYS * 24 * 60 * 60 * 1000);

    const documents = await this.prisma.branchDocument.findMany({
      where: { expiryDate: { lte: threshold } },
      include: { branch: { select: { id: true, name: true } } },
    });

    if (documents.length === 0) return;

    const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN');

    for (const doc of documents) {
      const isExpired = new Date(doc.expiryDate) < now;
      const daysRemaining = Math.ceil(
        (new Date(doc.expiryDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
      );

      const type = isExpired ? 'DOCUMENT_EXPIRED' : 'DOCUMENT_EXPIRING';
      const message = isExpired
        ? `Document "${doc.name}" (${doc.branch.name}) expired on ${new Date(doc.expiryDate).toISOString().slice(0, 10)}`
        : `Document "${doc.name}" (${doc.branch.name}) expires in ${daysRemaining} days`;

      const recipients = [
        ...superAdmins,
        ...users.filter((u) => u.role === 'BRANCH_MANAGER' && u.branchId === doc.branchId),
      ];

      for (const recipient of recipients) {
        // Avoid duplicate unread notifications for the same document state
        const existing = await this.prisma.notification.findFirst({
          where: {
            userId: recipient.id,
            type,
            message,
            isRead: false,
          },
        });

        if (!existing) {
          await this.create(recipient.id, type, message);
        }
      }
    }
  }
}
