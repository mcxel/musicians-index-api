import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, type: string, page: number) {
    const q = (query ?? '').trim();
    const skip = (page - 1) * 20;
    const take = 20;
    const all = !type || type === 'all';

    // Each sub-query is wrapped defensively — if a model doesn't exist in the
    // current Prisma client (e.g. Article not yet migrated) it returns [] instead of 500.
    const safeQuery = async <T>(fn: () => Promise<T[]>): Promise<T[]> => {
      try { return await fn(); } catch { return []; }
    };

    const [liveRooms, artists, beats, events, articles] = await Promise.all([
      all || type === 'rooms'
        ? safeQuery(() => this.prisma.hub.findMany({
            where: { name: { contains: q, mode: 'insensitive' } },
            take, skip,
            select: { id: true, name: true, description: true },
          }))
        : [],
      all || type === 'artists'
        ? safeQuery(() => this.prisma.artist.findMany({
            where: { name: { contains: q, mode: 'insensitive' } },
            take, skip,
            select: { id: true, name: true, bio: true, userId: true },
          }))
        : [],
      all || type === 'beats'
        ? safeQuery(() => (this.prisma as any).beat?.findMany({
            where: {
              status: 'published',
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { genre: { contains: q, mode: 'insensitive' } },
              ],
            },
            take, skip,
            select: { id: true, slug: true, title: true, genre: true, bpm: true, basicPrice: true },
          }) ?? Promise.resolve([]))
        : [],
      all || type === 'events'
        ? safeQuery(() => this.prisma.event.findMany({
            where: { title: { contains: q, mode: 'insensitive' } },
            take, skip,
            select: { id: true, title: true, startsAt: true, venueName: true },
          }))
        : [],
      all || type === 'articles'
        ? safeQuery(() => (this.prisma as any).article?.findMany({
            where: {
              status: 'PUBLISHED',
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { subtitle: { contains: q, mode: 'insensitive' } },
              ],
            },
            take, skip,
            select: { id: true, slug: true, title: true, subtitle: true, publishedAt: true },
          }) ?? Promise.resolve([]))
        : [],
    ]);

    return {
      results: { liveRooms, artists, beats, events, articles },
      query: q,
      total: liveRooms.length + artists.length + beats.length + events.length + articles.length,
    };
  }
}
