import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @Req() req: Request,
    @Query('limit') limit = '20',
    @Query('cursor') cursor?: string,
  ) {
    return this.notificationsService.getNotifications(req.cookies?.[SESSION_COOKIE], parseInt(limit, 10) || 20, cursor);
  }

  @Post('read-all')
  @HttpCode(200)
  markAllRead(@Req() req: Request) {
    return this.notificationsService.markAllRead(req.cookies?.[SESSION_COOKIE]);
  }

  @Post(':id/read')
  @HttpCode(200)
  markRead(@Req() req: Request, @Param('id') id: string) {
    return this.notificationsService.markRead(req.cookies?.[SESSION_COOKIE], id);
  }

  @Get('preferences')
  getPreferences(@Req() req: Request) {
    return this.notificationsService.getPreferences(req.cookies?.[SESSION_COOKIE]);
  }

  @Put('preferences')
  @HttpCode(200)
  updatePreferences(
    @Req() req: Request,
    @Body() body: Array<{ type: string; channel: string; enabled: boolean }>,
  ) {
    return this.notificationsService.updatePreferences(req.cookies?.[SESSION_COOKIE], body);
  }
}
