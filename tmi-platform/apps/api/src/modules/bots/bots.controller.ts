import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { BotManagerService } from './bot.manager.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/bots')
@UseGuards(AdminGuard) // Protect these endpoints
export class BotsController {
  constructor(private readonly botManager: BotManagerService) {}

  @Get('status')
  getBotsStatus() {
    return this.botManager.getSystemStatus();
  }

  @Post('scale/:queueName')
  scaleBotWorkers(
    @Param('queueName') queueName: string,
    @Body('concurrency') concurrency: number,
  ) {
    // This is a simplified "cloner" action to adjust worker concurrency
    // A more advanced version could trigger infrastructure changes (e.g., more containers)
    return this.botManager.scaleWorkers(queueName, concurrency);
  }
}
