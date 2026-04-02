import { Controller, Get } from '@nestjs/common';
import { MediaService } from './media.service';

/**
 * MediaController - Pack 45
 * Routes: GET /api/media (200), GET /api/media/health (200)
 * Auth is handled at the route level by the global auth guard where needed.
 */
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  getMedia() {
    return this.mediaService.getMediaStatus();
  }

  @Get('health')
  health() {
    return { status: 'ok', module: 'media' };
  }
}
