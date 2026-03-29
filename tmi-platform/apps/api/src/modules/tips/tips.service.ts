import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TipsService {
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

  async createIntent(token: string | undefined, artistId: string, amount: number, roomId?: string) {
    const fromUserId = await this.resolveUserId(token);
    if (!artistId || !amount || amount < 100) throw new BadRequestException('amount must be at least 100 cents');

    const tip = await this.prisma.tip.create({
      data: {
        fromUserId,
        toArtistId: artistId,
        roomId: roomId ?? null,
        amount,
        artistShare: Math.floor(amount * 0.7),
        platformFee: Math.floor(amount * 0.3),
        status: 'pending',
        stripeId: `pi_placeholder_${Date.now()}`,
        heldUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // In production: create Stripe PaymentIntent and return clientSecret
    return { clientSecret: `placeholder_secret_${tip.id}`, intentId: tip.id };
  }

  async getHistory(token: string | undefined, limit: number) {
    const userId = await this.resolveUserId(token);
    const tips = await this.prisma.tip.findMany({
      where: { fromUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return { tips };
  }
}
