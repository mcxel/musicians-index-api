import { Body, Controller, Get, HttpCode, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TipsService } from './tips.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('tips')
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Post('intent')
  @HttpCode(200)
  createIntent(
    @Req() req: Request,
    @Body() body: { artistId: string; amount: number; roomId?: string },
  ) {
    return this.tipsService.createIntent(req.cookies?.[SESSION_COOKIE], body.artistId, body.amount, body.roomId);
  }

  @Get('history')
  getHistory(@Req() req: Request, @Query('limit') limit = '20') {
    return this.tipsService.getHistory(req.cookies?.[SESSION_COOKIE], parseInt(limit, 10) || 20);
  }
}
