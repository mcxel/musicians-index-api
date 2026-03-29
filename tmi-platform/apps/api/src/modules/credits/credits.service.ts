import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveUserId(token: string | undefined): Promise<string> {
    if (!token) throw new UnauthorizedException();
    const session = await this.prisma.session.findUnique({
      where: { sessionToken: token },
      select: { userId: true, expires: true },
    });
    if (!session || session.expires < new Date()) throw new UnauthorizedException();
    return session.userId;
  }

  private async getOrCreateWallet(userId: string) {
    return this.prisma.wallet.upsert({ where: { userId }, update: {}, create: { userId } });
  }

  async balance(token: string | undefined) {
    const userId = await this.resolveUserId(token);
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: wallet.fanCredits };
  }

  async purchase(token: string | undefined, bundleId: '100' | '500' | '1500') {
    await this.resolveUserId(token);
    return { clientSecret: `credits_bundle_${bundleId}_${Date.now()}` };
  }

  async spend(token: string | undefined, amount: number, purpose: string) {
    const userId = await this.resolveUserId(token);
    if (amount <= 0) throw new BadRequestException('invalid_amount');

    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.fanCredits < amount) throw new BadRequestException('insufficient_credits');

    const updated = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { fanCredits: { decrement: amount } },
      select: { fanCredits: true },
    });

    await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'credit_spend',
        amount: -amount,
        fee: 0,
        netAmount: -amount,
        status: 'completed',
        note: `Fan credits spend: ${purpose}`,
      },
    });

    return { newBalance: updated.fanCredits };
  }
}
