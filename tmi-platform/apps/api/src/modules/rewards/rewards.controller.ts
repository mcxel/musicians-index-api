import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import { RewardsService } from './rewards.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  findAll(@Req() req: any) {
    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (!sessionId) throw new UnauthorizedException('Not authenticated');
    const userId = req.session?.userId;
    return this.rewardsService.findAll(userId);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.rewardsService.getLeaderboard();
  }

  @Get('drops')
  getDrops(@Req() req: any) {
    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (!sessionId) throw new UnauthorizedException('Not authenticated');
    return this.rewardsService.getDrops();
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (!sessionId) throw new UnauthorizedException('Not authenticated');
    return this.rewardsService.findOne(id);
  }
}
