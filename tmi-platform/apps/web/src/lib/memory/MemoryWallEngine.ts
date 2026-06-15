import prisma from '@/lib/prisma';

export interface MemoryArtifact {
  id: string;
  userId: string;
  type: 'TICKET' | 'NFT' | 'PHOTO' | 'VIDEO' | 'LIVE_MOMENT';
  mediaUrl: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  isPublic: boolean;
  eventId?: string;
}

const FAR_FUTURE = new Date('2040-01-01T00:00:00Z');

export class MemoryWallEngine {
  static async captureLiveMoment(
    userId: string,
    eventId: string,
    mediaUrl: string,
    title: string
  ): Promise<MemoryArtifact> {
    const artifact: MemoryArtifact = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type: 'LIVE_MOMENT',
      mediaUrl,
      title,
      tags: ['live', 'capture', 'legendary'],
      createdAt: new Date().toISOString(),
      isPublic: true,
      eventId,
    };

    try {
      await prisma.feedItem.create({
        data: {
          userId,
          type: 'MEMORY_WALL_ITEM',
          entityId: userId,
          entityType: 'fan',
          data: artifact as object,
          expiresAt: FAR_FUTURE,
        },
      });
    } catch (err) {
      console.error('[MemoryWallEngine.captureLiveMoment]', err);
    }

    return artifact;
  }
}