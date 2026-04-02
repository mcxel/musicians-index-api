import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LobbyService {
  private readonly logger = new Logger(LobbyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get or create a user's personal lobby */
  async getOrCreateLobby(userId: string) {
    const existing = await this.prisma.lobby.findUnique({
      where: { userId },
      include: { displayItems: true },
    });
    if (existing) return existing;

    return this.prisma.lobby.create({
      data: { userId },
      include: { displayItems: true },
    });
  }

  async getLobbyByUserId(userId: string) {
    const lobby = await this.prisma.lobby.findUnique({
      where: { userId },
      include: { displayItems: true },
    });
    if (!lobby) throw new NotFoundException(`Lobby for user ${userId} not found`);
    return lobby;
  }

  async updateLobby(userId: string, data: { tier?: string; theme?: string; level?: number }) {
    return this.prisma.lobby.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
      include: { displayItems: true },
    });
  }

  async addDisplayItem(userId: string, item: { type: string; assetId: string; position?: object }) {
    const lobby = await this.getOrCreateLobby(userId);
    return this.prisma.lobbyDisplayItem.create({
      data: {
        lobbyId: lobby.id,
        type: item.type,
        assetId: item.assetId,
        position: item.position ?? {},
      },
    });
  }

  async removeDisplayItem(userId: string, itemId: string) {
    const lobby = await this.getOrCreateLobby(userId);
    return this.prisma.lobbyDisplayItem.deleteMany({
      where: { id: itemId, lobbyId: lobby.id },
    });
  }

  async getThemes() {
    return this.prisma.lobbyTheme.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
