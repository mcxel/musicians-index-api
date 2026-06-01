import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getActiveGames() {
    return this.prisma.gameSession.findMany({
      where: { status: 'ACTIVE' },
      include: { players: true }
    });
  }

  async startGame(roomId: string, gameType: string) {
    return this.prisma.gameSession.create({
      data: {
        roomId,
        gameType,
        status: 'ACTIVE',
      }
    });
  }
}
