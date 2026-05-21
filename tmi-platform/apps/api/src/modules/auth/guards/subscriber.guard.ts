import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';

const SESSION_COOKIE = 'phase11_session';

@Injectable()
export class SubscriberAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken = request.cookies?.[SESSION_COOKIE];

    if (!sessionToken) {
      throw new UnauthorizedException('Missing session');
    }

    const session = await this.authService.getSession(sessionToken);
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trialing'] },
      },
      select: { id: true },
    });

    if (!activeSubscription) {
      throw new ForbiddenException('Subscriber access required');
    }

    return true;
  }
}
