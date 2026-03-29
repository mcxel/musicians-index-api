import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
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

  async getFeed(token: string | undefined, limit: number, cursor?: string) {
    const userId = await this.resolveUserId(token);
    const now = new Date();
    const items = await this.prisma.feedItem.findMany({
      where: {
        userId,
        expiresAt: { gt: now },
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: [{ weight: 'desc' }, { createdAt: 'desc' }],
      take: limit + 1,
    });
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    return { items: data, nextCursor: hasMore ? data[data.length - 1].id : null };
  }
}
