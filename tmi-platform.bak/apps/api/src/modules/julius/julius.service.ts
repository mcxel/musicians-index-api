import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JuliusService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllVariants() {
    return this.prisma.juliusVariant.findMany({
      orderBy: { rarity: 'asc' },
    });
  }

  async getMyUnlocks(userId: string) {
    return this.prisma.juliusUserUnlock.findMany({
      where: { userId },
      include: { variant: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  async unlockVariant(userId: string, variantId: string, source: string = 'purchase') {
    const variant = await this.prisma.juliusVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Julius variant not found');

    const existing = await this.prisma.juliusUserUnlock.findFirst({
      where: { userId, variantId },
    });
    if (existing) return existing;

    return this.prisma.juliusUserUnlock.create({
      data: { userId, variantId, source },
      include: { variant: true },
    });
  }

  async getVariant(variantId: string) {
    const variant = await this.prisma.juliusVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Julius variant not found');
    return variant;
  }

  async getAllEffects() {
    return this.prisma.juliusEffect.findMany({ orderBy: { rarity: 'asc' } });
  }

  async hasUnlock(userId: string, variantId: string): Promise<boolean> {
    const unlock = await this.prisma.juliusUserUnlock.findFirst({
      where: { userId, variantId },
    });
    return !!unlock;
  }
}
