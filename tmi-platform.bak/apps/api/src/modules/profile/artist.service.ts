import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  async getArtistBySlug(slug: string) {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { slug },
      include: { user: { include: { artist: { include: { musicLinks: true } } } } },
    });
    if (!profile) throw new NotFoundException('Artist not found');
    return profile;
  }

  async getTrending(limit = 20) {
    const profiles = await this.prisma.artistProfile.findMany({
      where: { slug: { not: null } },
      orderBy: [{ followers: 'desc' }, { views: 'desc' }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            artist: { select: { id: true, name: true, bio: true } },
          },
        },
      },
    });
    return profiles.map((p) => ({
      id: p.id,
      slug: p.slug,
      stageName: p.stageName ?? p.user?.name ?? 'Unknown',
      genres: p.genres,
      followers: p.followers,
      views: p.views,
      verified: p.verified,
      image: p.user?.image ?? null,
    }));
  }

  async getAll(limit = 50) {
    return this.prisma.artistProfile.findMany({
      where: { slug: { not: null } },
      take: limit,
      include: { user: { select: { id: true, name: true, image: true } } },
    });
  }

  async getTop10(limit = 10) {
    const profiles = await this.prisma.artistProfile.findMany({
      where: { slug: { not: null } },
      orderBy: [{ followers: 'desc' }, { views: 'desc' }],
      take: limit,
      include: { user: { select: { id: true, name: true, image: true } } },
    });
    return profiles.map((p, i) => ({
      id: p.id,
      rank: i + 1,
      slug: p.slug,
      stageName: p.stageName ?? p.user?.name ?? 'Unknown',
      genres: p.genres,
      followers: p.followers,
      views: p.views,
      verified: p.verified,
      image: p.user?.image ?? null,
    }));
  }

  async getFeatured() {
    const profile = await this.prisma.artistProfile.findFirst({
      where: { slug: { not: null } },
      orderBy: [{ followers: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            artist: { include: { musicLinks: true } },
          },
        },
      },
    });
    return profile ?? null;
  }

  async getNewReleases(limit = 6) {
    return this.prisma.beat.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        genre: true,
        bpm: true,
        previewUrl: true,
        playCount: true,
        createdAt: true,
      },
    });
  }
}
