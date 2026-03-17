// tmi-platform/apps/api/src/modules/auth/guards/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';

const SESSION_COOKIE = 'phase11_session';

/**
 * A simple guard that checks for a valid session cookie and resolves the user.
 * It leverages the UsersService which throws an UnauthorizedException if the session is invalid.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken = request.cookies?.[SESSION_COOKIE];

    // resolveUserBySessionToken will throw an exception if the token is invalid,
    // which will be handled by Nest's exception filter and result in a 401 response.
    // If it resolves, the user is authenticated.
    if (!sessionToken) {
      return false;
    }

    const session = await this.authService.getSession(sessionToken);
    return !!session;
  }
}
