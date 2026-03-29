import { Controller, Get, Param } from '@nestjs/common';
import { ArtistService } from './artist.service';

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get(':slug')
  async getArtistBySlug(@Param('slug') slug: string) {
    return this.artistService.getArtistBySlug(slug);
  }
}
