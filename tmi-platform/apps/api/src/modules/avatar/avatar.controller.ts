import { Controller, Get } from '@nestjs/common';
import { AvatarService } from './avatar.service';

/**
 * AvatarController
 * SCAFFOLD: Manages avatar identity, presence, and evolution.
 */
@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'avatar' };
  }
}
