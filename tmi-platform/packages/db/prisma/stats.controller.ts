import { Controller, Get, Param, Query } from '@nestjs/common';
import { UniversalStatsEngine } from './universal-stats.engine';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsEngine: UniversalStatsEngine) {}

  @Get('profile/:userId')
  async getUserStats(@Param('userId') userId: string) {
    return this.statsEngine.calculateFanStats(userId);
  }

  @Get('leaderboards/:category')
  async getLeaderboards(@Param('category') category: string, @Query('limit') limit?: string) {
    return this.statsEngine.getLeaderboard(category, limit ? parseInt(limit, 10) : 100);
  }
}