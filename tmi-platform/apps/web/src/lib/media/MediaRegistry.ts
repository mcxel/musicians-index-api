/**
 * TMI Platform — Media Registry
 *
 * Single source of truth for all media items.
 * Every piece of media (song, video, interview, article, etc.) is registered here once.
 * All systems (Memory Wall, Playlist, Live Queue, Radio, Events) reference media by ID.
 *
 * Rule: One upload = one MediaItem = infinite references
 *
 * @see CLAUDE.md Rule 8 (Registry First), Rule 14 (No Empty Surface), Rule 20 (Reality Rule)
 */

import prisma from '@/lib/prisma';

export type MediaType =
  | 'song'
  | 'video'
  | 'interview'
  | 'podcast'
  | 'article'
  | 'image'
  | 'audio_clip'
  | 'performance'
  | 'battle_replay'
  | 'cypher_replay'
  | 'challenge_replay'
  | 'concert_recording'
  | 'broadcast_archive';

export interface MediaItem {
  id: string;
  ownerId: string;
  creatorId?: string;
  type: MediaType;
  title: string;
  description?: string;
  sourceUrl: string;
  thumbnailUrl?: string;
  durationMs?: number;
  fileSize?: number;
  mimeType?: string;
  isLive: boolean;
  visibility: 'private' | 'friends' | 'public';
  approvedForRadio: boolean;
  approvedForLiveBroadcast: boolean;
  approvedForPlaylist: boolean;
  approvedForMemoryWall: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

function mapSongToMedia(song: {
  id: string;
  uploaderId: string;
  title: string;
  audioUrl: string;
  coverUrl: string | null;
  duration: number | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}): MediaItem {
  return {
    id: song.id,
    ownerId: song.uploaderId,
    creatorId: song.uploaderId,
    type: 'song',
    title: song.title,
    sourceUrl: song.audioUrl,
    thumbnailUrl: song.coverUrl ?? undefined,
    durationMs: song.duration ?? undefined,
    isLive: false,
    visibility: song.isPublic ? 'public' : 'private',
    approvedForRadio: song.isPublic,
    approvedForLiveBroadcast: song.isPublic,
    approvedForPlaylist: song.isPublic,
    approvedForMemoryWall: song.isPublic,
    createdAt: song.createdAt,
    updatedAt: song.updatedAt,
  };
}

function mapVideoToMedia(video: {
  id: string;
  uploaderId: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}): MediaItem {
  return {
    id: video.id,
    ownerId: video.uploaderId,
    creatorId: video.uploaderId,
    type: 'video',
    title: video.title,
    description: video.description ?? undefined,
    sourceUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl ?? undefined,
    durationMs: video.duration ?? undefined,
    isLive: false,
    visibility: video.isPublic ? 'public' : 'private',
    approvedForRadio: false,
    approvedForLiveBroadcast: video.isPublic,
    approvedForPlaylist: video.isPublic,
    approvedForMemoryWall: true,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };
}

export class MediaRegistry {
  static async register(data: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaItem> {
    if (data.type === 'song') {
      const created = await prisma.song.create({
        data: {
          uploaderId: data.ownerId,
          title: data.title,
          audioUrl: data.sourceUrl,
          coverUrl: data.thumbnailUrl,
          duration: data.durationMs,
          isPublic: data.visibility === 'public',
        },
      });

      return mapSongToMedia(created);
    }

    const created = await prisma.video.create({
      data: {
        uploaderId: data.ownerId,
        title: data.title,
        description: data.description,
        videoUrl: data.sourceUrl,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.durationMs,
        isPublic: data.visibility === 'public',
      },
    });

    return mapVideoToMedia(created);
  }

  static async getById(mediaId: string): Promise<MediaItem | null> {
    const song = await prisma.song.findUnique({ where: { id: mediaId } });
    if (song) return mapSongToMedia(song);

    const video = await prisma.video.findUnique({ where: { id: mediaId } });
    if (video) return mapVideoToMedia(video);

    return null;
  }

  static async getByOwner(ownerId: string): Promise<MediaItem[]> {
    const [songs, videos] = await Promise.all([
      prisma.song.findMany({ where: { uploaderId: ownerId }, orderBy: { createdAt: 'desc' } }),
      prisma.video.findMany({ where: { uploaderId: ownerId }, orderBy: { createdAt: 'desc' } }),
    ]);

    return [...songs.map(mapSongToMedia), ...videos.map(mapVideoToMedia)].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  static async getByCreator(creatorId: string): Promise<MediaItem[]> {
    return this.getByOwner(creatorId);
  }

  static async getByType(
    type: MediaType,
    visibility: 'private' | 'friends' | 'public' = 'public',
  ): Promise<MediaItem[]> {
    if (type === 'song') {
      const songs = await prisma.song.findMany({
        where: { isPublic: visibility === 'public' },
        orderBy: { createdAt: 'desc' },
      });
      return songs.map(mapSongToMedia);
    }

    if (type === 'video') {
      const videos = await prisma.video.findMany({
        where: { isPublic: visibility === 'public' },
        orderBy: { createdAt: 'desc' },
      });
      return videos.map(mapVideoToMedia);
    }

    return [];
  }

  static async getApprovedForRadio(): Promise<MediaItem[]> {
    const songs = await prisma.song.findMany({
      where: { isPublic: true, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    return songs.map(mapSongToMedia);
  }

  static async getApprovedForLiveBroadcast(): Promise<MediaItem[]> {
    const videos = await prisma.video.findMany({
      where: { isPublic: true, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    return videos.map(mapVideoToMedia);
  }

  static async getApprovedForPlaylist(): Promise<MediaItem[]> {
    const [songs, videos] = await Promise.all([
      prisma.song.findMany({ where: { isPublic: true, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
      prisma.video.findMany({ where: { isPublic: true, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
    ]);
    return [...songs.map(mapSongToMedia), ...videos.map(mapVideoToMedia)];
  }

  static async getApprovedForMemoryWall(): Promise<MediaItem[]> {
    const [songs, videos] = await Promise.all([
      prisma.song.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
      prisma.video.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
    ]);
    return [...songs.map(mapSongToMedia), ...videos.map(mapVideoToMedia)];
  }

  static async update(mediaId: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    const existingSong = await prisma.song.findUnique({ where: { id: mediaId } });
    if (existingSong) {
      const updated = await prisma.song.update({
        where: { id: mediaId },
        data: {
          title: updates.title ?? undefined,
          audioUrl: updates.sourceUrl ?? undefined,
          coverUrl: updates.thumbnailUrl ?? undefined,
          duration: updates.durationMs ?? undefined,
          isPublic: updates.visibility ? updates.visibility === 'public' : undefined,
        },
      });
      return mapSongToMedia(updated);
    }

    const updated = await prisma.video.update({
      where: { id: mediaId },
      data: {
        title: updates.title ?? undefined,
        description: updates.description ?? undefined,
        videoUrl: updates.sourceUrl ?? undefined,
        thumbnailUrl: updates.thumbnailUrl ?? undefined,
        duration: updates.durationMs ?? undefined,
        isPublic: updates.visibility ? updates.visibility === 'public' : undefined,
      },
    });

    return mapVideoToMedia(updated);
  }

  static async delete(mediaId: string): Promise<void> {
    await prisma.playlistItem.deleteMany({ where: { songId: mediaId } });
    await prisma.fanMemory.deleteMany({ where: { OR: [{ videoUrl: mediaId }, { id: mediaId }] } });

    const song = await prisma.song.findUnique({ where: { id: mediaId } });
    if (song) {
      await prisma.song.delete({ where: { id: mediaId } });
      return;
    }

    const video = await prisma.video.findUnique({ where: { id: mediaId } });
    if (video) {
      await prisma.video.delete({ where: { id: mediaId } });
    }
  }

  static async getReferenceCount(mediaId: string): Promise<number> {
    const [playlistRefs, memoryRefs] = await Promise.all([
      prisma.playlistItem.count({ where: { songId: mediaId } }),
      prisma.fanMemory.count({ where: { OR: [{ videoUrl: mediaId }, { id: mediaId }] } }),
    ]);

    const counts: number[] = [playlistRefs, memoryRefs];
    return counts.reduce((a: number, b: number) => a + b, 0);
  }
}
