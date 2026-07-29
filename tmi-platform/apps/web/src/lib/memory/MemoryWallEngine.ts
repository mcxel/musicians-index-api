import prisma from '@/lib/prisma';
import { createCollectible } from './collectiblesPersistence';

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
  /**
   * Capture a live moment into Memory & Collectibles (Prisma MemoryCollectible)
   * and dual-write legacy FeedItem for existing wall API consumers until 7.4 bind.
   */
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

    // Phase 7.3 canonical path — personal media library (not competition ledger)
    try {
      const collectible = await createCollectible({
        ownerId: userId,
        kind: 'PHOTO',
        title,
        mediaUrl,
        eventId: eventId || undefined,
        visibility: 'public',
        captureDestination: 'MEMORY_WALL',
        captureQuality: 'STANDARD',
      });
      if (collectible) {
        artifact.id = collectible.id;
      }
    } catch (err) {
      console.error('[MemoryWallEngine.captureLiveMoment collectible]', err);
    }

    // Legacy FeedItem path — keep current MemoryWall UI working until 7.4
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
