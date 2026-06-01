import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CypherService {
  private readonly logger = new Logger(CypherService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getActiveCyphers() {
    return this.prisma.cypherSession.findMany({
      where: { status: 'ACTIVE' },
      include: { performers: true }
    });
  }

  async startCypher(data: { roomId: string; hostId: string; theme?: string }) {
    return this.prisma.cypherSession.create({
      data: {
        roomId: data.roomId,
        hostId: data.hostId,
        theme: data.theme,
        status: 'ACTIVE',
      }
    });
  }
}
