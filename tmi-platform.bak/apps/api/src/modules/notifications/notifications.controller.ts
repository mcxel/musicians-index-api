import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Req, ValidationPipe } from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

const SESSION_COOKIE = 'phase11_session';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @Req() req: Request,
    @Query(new ValidationPipe({ transform: true })) query: GetNotificationsDto,
  ) {
    return this.notificationsService.getNotifications(req.cookies?.[SESSION_COOKIE], query.limit, query.cursor);
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
    @Body(new ValidationPipe()) body: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(req.cookies?.[SESSION_COOKIE], body.preferences);
  }
}
