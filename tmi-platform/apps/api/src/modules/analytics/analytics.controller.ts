import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

/**
 * AnalyticsController
 * SCAFFOLD: Tracks platform events and metrics.
 */
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'analytics' };
  }
}
