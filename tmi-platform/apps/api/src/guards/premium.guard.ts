import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../modules/prisma/prisma.service';
import { requireSessionUser } from './guard-utils';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = await requireSessionUser(this.prisma, request);

    if (user.role === 'ADMIN') {
      return true;
    }

    const premiumSub = await this.prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['active', 'trialing'] },
        OR: [
          { price: { id: { contains: 'premium' } } },
          { price: { id: { contains: 'pro' } } },
          { price: { id: { contains: 'vip' } } },
        ],
      },
      select: { id: true },
    });

    if (!premiumSub) {
      throw new ForbiddenException('Premium access required');
    }

    return true;
  }
}
