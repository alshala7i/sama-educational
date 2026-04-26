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
}
