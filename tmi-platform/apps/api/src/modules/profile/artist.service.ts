import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  async getArtistBySlug(slug: string) {
    const artist = await this.prisma.artistProfile.findUnique({ where: { slug } });
    if (!artist) throw new NotFoundException('Artist not found');
    return artist;
  }
}
