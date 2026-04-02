import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string) {
    try {
      const rewards = await (this.prisma as any).reward?.findMany({
        where: userId ? { userId } : undefined,
        take: 50,
        orderBy: { createdAt: 'desc' },
      }) ?? [];
      return { rewards, total: rewards.length };
    } catch {
      return { rewards: [], total: 0 };
    }
  }

  async findOne(id: string) {
    try {
      return await (this.prisma as any).reward?.findUnique({ where: { id } }) ?? null;
    } catch {
      return null;
    }
  }

  async getLeaderboard() {
    try {
      const entries = await (this.prisma as any).rankEntry?.findMany({
        take: 100,
        orderBy: { score: 'desc' },
        select: { id: true, userId: true, score: true, rank: true },
      }) ?? [];
      return { entries, total: entries.length };
    } catch {
      return { entries: [], total: 0 };
    }
  }

  async getDrops() {
    try {
      const drops = await (this.prisma as any).rewardDrop?.findMany({
        where: { active: true },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }) ?? [];
      return { drops, total: drops.length };
    } catch {
      return { drops: [], total: 0 };
    }
  }
}
