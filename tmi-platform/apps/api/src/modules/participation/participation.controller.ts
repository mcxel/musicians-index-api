import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ParticipationLedgerService } from './participation-ledger.service';

@Controller('participation')
export class ParticipationController {
  constructor(private readonly ledgerService: ParticipationLedgerService) {}

  @Post('record')
  // @UseGuards(InternalOrAdminGuard)
  async recordAction(@Body() payload: { userId: string; actionType: string; points: number; metadata?: Record<string, any> }) {
    // Internal endpoint used by room conductors & WebRTC listeners
    const record = await this.ledgerService.recordParticipation(payload.userId, payload.actionType, payload.points, payload.metadata);
    return { success: true, recordId: record.id };
  }

  @Get('history/:userId')
  async getHistory(
    @Param('userId') userId: string, 
    @Query('limit') limit?: string
  ) {
    // Public or self-only endpoint to view participation logs
    const history = await this.ledgerService.getHistory(userId, limit ? parseInt(limit, 10) : 50);
    return { success: true, history };
  }
}
