import { Controller, Get } from '@nestjs/common';
import { MediaService } from './media.service';

/**
 * MediaController
 * SCAFFOLD: Manages media uploads and processing.
 */
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'media' };
  }
}
