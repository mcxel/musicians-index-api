import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../modules/prisma/prisma.service';
import { requireSessionUser } from './guard-utils';

@Injectable()
export class FriendRoomGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = await requireSessionUser(this.prisma, request);

    const roomId = (request.params?.roomId || request.body?.roomId || request.query?.roomId) as string | undefined;
    if (!roomId) {
      throw new ForbiddenException('roomId is required for friend-only room access');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!room) {
      throw new ForbiddenException('Room not found');
    }

    if (room.ownerId === user.id) {
      return true;
    }

    if (!room.ownerId) {
      throw new ForbiddenException('Friend-only room owner missing');
    }

    const isFriend = await this.prisma.friendship.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: user.id, addresseeId: room.ownerId },
          { requesterId: room.ownerId, addresseeId: user.id },
        ],
      },
      select: { id: true },
    });

    if (!isFriend) {
      throw new ForbiddenException('Friend-only room access denied');
    }

    return true;
  }
}
