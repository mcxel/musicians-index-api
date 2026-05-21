import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';

const SESSION_COOKIE = 'phase11_session';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

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

    if (session.user.role !== 'admin') {
      throw new ForbiddenException('Admin role required');
    }

    return true;
  }
}
