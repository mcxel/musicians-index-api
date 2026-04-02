import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    try {
      const [userCount, eventCount, reportCount] = await Promise.all([
        this.prisma.user.count().catch(() => 0),
        (this.prisma as any).event?.count().catch(() => 0) ?? 0,
        (this.prisma as any).report?.count().catch(() => 0) ?? 0,
      ]);
      return { userCount, eventCount, reportCount };
    } catch {
      return { userCount: 0, eventCount: 0, reportCount: 0 };
    }
  }

  async getUsers(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const prismaAny = this.prisma as any;
      const [users, total] = await Promise.all([
        prismaAny.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prismaAny.user.count(),
      ]);
      return { users, total, page, limit };
    } catch {
      return { users: [], total: 0, page, limit };
    }
  }

  async getReports(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const reports = await (this.prisma as any).report?.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }) ?? [];
      return { reports };
    } catch {
      return { reports: [] };
    }
  }

  async getAuditLog(page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      const logs = await (this.prisma as any).auditLog?.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }) ?? [];
      return { logs };
    } catch {
      return { logs: [] };
    }
  }

  async getFeatureFlags() {
    try {
      const flags = await (this.prisma as any).featureFlag?.findMany({
        orderBy: { name: 'asc' },
      }) ?? [];
      return { flags };
    } catch {
      return { flags: [] };
    }
  }
}
