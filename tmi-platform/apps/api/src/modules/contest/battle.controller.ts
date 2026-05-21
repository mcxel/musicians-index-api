import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BattleService } from './battle.service';

@Controller('contest/battles')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Get(':battleId')
  getBattle(@Param('battleId') battleId: string) {
    return this.battleService.getBattle(battleId);
  }

  @Post(':battleId/vote')
  @UseGuards(AuthGuard)
  castVote(
    @Param('battleId') battleId: string,
    @Request() req: any,
    @Body() body: { votedFor: number },
  ) {
    return this.battleService.castBattleVote(battleId, req.user.id, body.votedFor);
  }
}
