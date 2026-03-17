// tmi-platform/apps/api/src/modules/presence/presence.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PresenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Records a user's activity by updating their `lastSeenAt` timestamp.
   * @param sessionToken - The user's session token from the cookie.
   */
  async recordHeartbeat(sessionToken: string | undefined): Promise<void> {
    // We leverage the UsersService to safely resolve the user.
    // This will throw an UnauthorizedException if the session is invalid,
    // which is the desired behavior.
    const user = await this.usersService.resolveUserBySessionToken(sessionToken);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastSeenAt: new Date(),
      },
    });
  }
}
