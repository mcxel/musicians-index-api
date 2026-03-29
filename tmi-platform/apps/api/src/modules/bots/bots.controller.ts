import { Controller, Get } from '@nestjs/common';
import { BotsService } from './bots.service';

/**
 * BotsController
 * SCAFFOLD: Manages bot tasks and automation scheduling.
 */
@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'bots' };
  }
}
