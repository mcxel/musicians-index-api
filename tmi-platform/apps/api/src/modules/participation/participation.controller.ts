import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ParticipationLedgerService } from './participation-ledger.service';

@Controller('participation')
export class ParticipationController {
  constructor(private readonly ledgerService: ParticipationLedgerService) {}

  @Post('record')
  async recordParticipation(
    @Body() body: { userId: string; actionType: string; points: number; metadata?: Record<string, unknown> }
  ) {
    return this.ledgerService.recordParticipation(body.userId, body.actionType, body.points, body.metadata);
  }

  @Get('history/:userId')
  async getHistory(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.ledgerService.getHistory(userId, limit ? parseInt(limit, 10) : 50);
  }
}
