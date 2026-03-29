import { Controller, Get } from '@nestjs/common';
import { ModerationService } from './moderation.service';

/**
 * ModerationController
 * SCAFFOLD: Manages content moderation and abuse reports.
 */
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'moderation' };
  }
}
