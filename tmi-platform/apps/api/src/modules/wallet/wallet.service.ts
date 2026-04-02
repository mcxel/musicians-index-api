import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveUserId(token: string | undefined): Promise<string> {
    if (!token) throw new UnauthorizedException();
    let session: { userId: string; expires: Date } | null = null;
    try {
      session = await this.prisma.session.findUnique({
        where: { sessionToken: token },
        select: { userId: true, expires: true },
      });
    } catch {
      // Prisma error (e.g. schema mismatch, DB unavailable) → treat as invalid session
      throw new UnauthorizedException();
    }
    if (!session || session.expires < new Date()) throw new UnauthorizedException();
    return session.userId;
  }

  private async getOrCreateWallet(userId: string) {
    return this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async getWallet(token: string | undefined) {
    const userId = await this.resolveUserId(token);
    const wallet = await this.getOrCreateWallet(userId);
    return {
      available: wallet.availableBalance,
      pending: wallet.pendingBalance,
      lifetime: wallet.lifetimeEarnings,
      currency: 'usd',
    };
  }

  async getTransactions(token: string | undefined, limit: number, cursor?: string) {
    const userId = await this.resolveUserId(token);
    const wallet = await this.getOrCreateWallet(userId);
    const transactions = await this.prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });
    const hasMore = transactions.length > limit;
    const data = hasMore ? transactions.slice(0, limit) : transactions;
    return { transactions: data, nextCursor: hasMore ? data[data.length - 1].id : null };
  }

  async payoutStatus(token: string | undefined) {
    const userId = await this.resolveUserId(token);
    const wallet = await this.getOrCreateWallet(userId);
    if (!wallet.stripeAccountId) return { status: 'not_connected' as const };
    if (!wallet.stripeOnboarded) return { status: 'pending' as const, stripeAccountId: wallet.stripeAccountId };
    return { status: 'active' as const, stripeAccountId: wallet.stripeAccountId };
  }

  async payoutOnboard(token: string | undefined) {
    const userId = await this.resolveUserId(token);
    const wallet = await this.getOrCreateWallet(userId);
    if (!wallet.stripeAccountId) {
      const updated = await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { stripeAccountId: `acct_placeholder_${Date.now()}` },
      });
      return { onboardingUrl: `https://connect.stripe.com/setup/s/${updated.stripeAccountId}` };
    }
    return { onboardingUrl: `https://connect.stripe.com/setup/s/${wallet.stripeAccountId}` };
  }

  async payoutRequest(token: string | undefined, amount: number) {
    const userId = await this.resolveUserId(token);
    if (amount < 500) throw new BadRequestException('below_minimum');
    const wallet = await this.getOrCreateWallet(userId);
    if (!wallet.stripeAccountId || !wallet.stripeOnboarded) throw new BadRequestException('no_payout_account');
    if (wallet.availableBalance < amount) throw new BadRequestException('insufficient_balance');

    await this.prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { availableBalance: { decrement: amount }, pendingBalance: { increment: amount } },
      });
      await tx.payout.create({
        data: { walletId: wallet.id, amount, status: 'queued' },
      });
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'payout',
          amount: -amount,
          fee: 0,
          netAmount: -amount,
          status: 'pending',
          note: 'Payout requested',
        },
      });
    });

    const estimated = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    return { status: 'queued', estimatedDate: estimated };
  }
}
