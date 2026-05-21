// tmi-platform/apps/api/src/modules/presence/presence.controller.ts
import { Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard'; // Assuming a general auth guard exists or will be created
import { UsersService } from '../users/users.service';
import { PresenceService } from './presence.service';

@Controller('presence')
@UseGuards(AuthGuard)
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Post('heartbeat')
  @HttpCode(204) // No Content response is appropriate for a successful heartbeat
  async heartbeat(@Req() req: Request) {
    // The session token is extracted from the cookie by the UsersService, following existing patterns.
    const sessionToken = req.cookies?.[UsersService.sessionCookieName()];
    await this.presenceService.recordHeartbeat(sessionToken);
  }
}
