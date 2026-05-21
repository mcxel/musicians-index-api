import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('achievements')
@UseGuards(AuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  getAllAchievements() {
    return this.achievementsService.getAllAchievements();
  }

  @Get('me')
  getMyAchievements(@Request() req: any) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  @Get('me/:key/progress')
  getProgress(@Request() req: any, @Param('key') key: string) {
    return this.achievementsService.getProgress(req.user.id, key);
  }
}
