import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LobbyTier, LobbyThemeEngine } from '@tmi/lobby-engine'; // Assuming package is linked

@Injectable()
export class LobbiesService {
  constructor(private prisma: PrismaService) {}

  async getLobbyByUser(userId: string) {
    const lobby = await this.prisma.lobby.findUnique({
      where: { userId },
      include: { displayItems: true },
    });
    
    if (!lobby) {
      // Auto-create a free-tier default theater lobby if it doesn't exist yet
      return this.prisma.lobby.create({
        data: {
          userId,
          tier: LobbyTier.FREE,
          theme: 'default_theater',
          level: 1,
        },
        include: { displayItems: true },
      });
    }
    
    // Attach the engine config so the frontend knows what features to render
    const config = LobbyThemeEngine.getLobbyConfigForTier(lobby.tier as LobbyTier);
    return { ...lobby, config };
  }

  async upgradeLobbyTier(userId: string, newTier: LobbyTier) {
    return this.prisma.lobby.update({
      where: { userId },
      data: { tier: newTier },
    });
  }
}