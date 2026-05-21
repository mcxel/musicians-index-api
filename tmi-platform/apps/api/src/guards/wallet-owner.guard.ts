import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../modules/prisma/prisma.service';
import { requireSessionUser } from './guard-utils';

@Injectable()
export class WalletOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = await requireSessionUser(this.prisma, request);

    const walletId = (request.params?.walletId || request.params?.id || request.body?.walletId) as string | undefined;
    if (!walletId) {
      // If no walletId is explicitly targeted, allow access for self-owned wallet endpoints.
      return true;
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { userId: true },
    });

    if (!wallet) {
      throw new ForbiddenException('Wallet not found');
    }

    if (wallet.userId !== user.id) {
      throw new ForbiddenException('Wallet owner required');
    }

    return true;
  }
}
