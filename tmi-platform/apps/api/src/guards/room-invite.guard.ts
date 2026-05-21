import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../modules/prisma/prisma.service';
import { requireSessionUser } from './guard-utils';

@Injectable()
export class RoomInviteGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = await requireSessionUser(this.prisma, request);

    const inviteId = (request.params?.inviteId || request.params?.id || request.body?.inviteId) as string | undefined;
    if (!inviteId) {
      throw new ForbiddenException('inviteId is required');
    }

    const invite = await this.prisma.roomInvite.findUnique({
      where: { id: inviteId },
      select: { recipientId: true, senderId: true, status: true },
    });

    if (!invite) {
      throw new ForbiddenException('Invite not found');
    }

    if (invite.recipientId !== user.id && invite.senderId !== user.id) {
      throw new ForbiddenException('Not authorized for this invite');
    }

    if (invite.status !== 'pending') {
      throw new ForbiddenException('Invite is no longer pending');
    }

    return true;
  }
}
