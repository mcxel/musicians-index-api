import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FanService {
  constructor(private readonly prisma: PrismaService) {}

  async getFanByUsername(username: string) {
    // FanProfile has no username field — username lives on UserProfile.
    // Two-step lookup: UserProfile by username → FanProfile by userId.
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { username },
      select: { userId: true },
    });

    if (!userProfile) {
      throw new NotFoundException('Fan not found');
    }

    const fan = await this.prisma.fanProfile.findUnique({
      where: { userId: userProfile.userId },
    });

    if (!fan) {
      throw new NotFoundException('Fan not found');
    }

    return fan;
  }
}
