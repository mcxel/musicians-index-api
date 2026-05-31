import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ParticipationLedgerService } from './participation-ledger.service';

@Controller('participation')
export class ParticipationController {
  constructor(private readonly ledgerService: ParticipationLedgerService) {}

  /**
   * POST /api/participation/record
   * Records a new participation event from one of the Bot Teams or Client.
   */
  @Post('record')
  async recordParticipation(
    @Body() body: { userId: string; actionType: string; points: number; metadata?: any }
  ) {
    return this.ledgerService.recordParticipation(
      body.userId, 
      body.actionType, 
      body.points, 
      body.metadata
    );
  }

  /**
   * GET /api/participation/history/:userId
   * Maps to the requested /api/profile/:userId/participation-history
   */
  @Get('history/:userId')
  async getHistory(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.ledgerService.getHistory(userId, limit ? parseInt(limit, 10) : 50);
  }
}