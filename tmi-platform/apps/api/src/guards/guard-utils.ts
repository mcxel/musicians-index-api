import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../modules/prisma/prisma.service';

export const SESSION_COOKIE = 'phase11_session';

type SessionUser = {
  id: string;
  role: string | null;
  stripeSubscriptionId: string | null;
};

export async function requireSessionUser(
  prisma: PrismaService,
  request: Request,
): Promise<SessionUser> {
  const sessionToken = request.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sessionToken) {
    throw new UnauthorizedException('Authentication required');
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      expires: true,
      user: {
        select: {
          id: true,
          role: true,
          stripeSubscriptionId: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date()) {
    throw new UnauthorizedException('Invalid session');
  }

  return {
    id: session.user.id,
    role: session.user.role,
    stripeSubscriptionId: session.user.stripeSubscriptionId,
  };
}
