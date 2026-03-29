import { Controller, Get } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';

/**
 * SponsorsController
 * SCAFFOLD: Manages sponsor campaigns and placements.
 */
@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'sponsors' };
  }
}
