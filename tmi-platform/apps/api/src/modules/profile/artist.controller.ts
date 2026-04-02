import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArtistService } from './artist.service';

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get('trending')
  getTrending(@Query('limit') limit?: string) {
    return this.artistService.getTrending(limit ? parseInt(limit, 10) : 20);
  }

  @Get('top10')
  getTop10(@Query('limit') limit?: string) {
    return this.artistService.getTop10(limit ? parseInt(limit, 10) : 10);
  }

  @Get('featured')
  getFeatured() {
    return this.artistService.getFeatured();
  }

  @Get('releases/new')
  getNewReleases(@Query('limit') limit?: string) {
    return this.artistService.getNewReleases(limit ? parseInt(limit, 10) : 6);
  }

  @Get()
  getAll(@Query('limit') limit?: string) {
    return this.artistService.getAll(limit ? parseInt(limit, 10) : 50);
  }

  @Get(':slug')
  async getArtistBySlug(@Param('slug') slug: string) {
    return this.artistService.getArtistBySlug(slug);
  }
}
