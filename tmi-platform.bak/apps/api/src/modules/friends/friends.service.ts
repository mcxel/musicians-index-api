import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FriendRequestStatus, FriendshipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  private canonicalizePair(a: string, b: string): { userAId: string; userBId: string } {
    return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
  }

  async getFriends(userId: string) {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACTIVE,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { select: { id: true, name: true, image: true } },
        userB: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => {
      const friend = row.userAId === userId ? row.userB : row.userA;
      return {
        friendshipId: row.id,
        friendId: friend.id,
        name: friend.name,
        image: friend.image,
        createdAt: row.createdAt,
      };
    });
  }

  async getFriendRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: { toUserId: userId, status: FriendRequestStatus.PENDING },
      include: {
        fromUser: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sendFriendRequest(fromUserId: string, toUserId: string) {
    if (!toUserId) throw new BadRequestException('toUserId is required');
    if (fromUserId === toUserId) throw new BadRequestException('Cannot send friend request to yourself');

    const pair = this.canonicalizePair(fromUserId, toUserId);

    const existingFriendship = await this.prisma.friendship.findUnique({
      where: { userAId_userBId: pair },
    });

    if (existingFriendship?.status === FriendshipStatus.ACTIVE) {
      return { success: true, message: 'Already friends' };
    }

    const existingPending = await this.prisma.friendRequest.findFirst({
      where: {
        status: FriendRequestStatus.PENDING,
        OR: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      },
    });

    if (existingPending) {
      return { success: false, message: 'A pending friend request already exists' };
    }

    await this.prisma.friendRequest.upsert({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
      create: {
        fromUserId,
        toUserId,
        status: FriendRequestStatus.PENDING,
      },
      update: {
        status: FriendRequestStatus.PENDING,
        respondedAt: null,
      },
    });

    return { success: true, message: 'Friend request sent' };
  }

  async acceptFriendRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findFirst({
      where: {
        id: requestId,
        toUserId: userId,
        status: FriendRequestStatus.PENDING,
      },
    });

    if (!request) {
      throw new NotFoundException('Pending friend request not found');
    }

    const pair = this.canonicalizePair(request.fromUserId, request.toUserId);

    await this.prisma.$transaction([
      this.prisma.friendRequest.update({
        where: { id: request.id },
        data: {
          status: FriendRequestStatus.ACCEPTED,
          respondedAt: new Date(),
        },
      }),
      this.prisma.friendship.upsert({
        where: { userAId_userBId: pair },
        create: {
          userAId: pair.userAId,
          userBId: pair.userBId,
          status: FriendshipStatus.ACTIVE,
        },
        update: {
          status: FriendshipStatus.ACTIVE,
          removedAt: null,
        },
      }),
    ]);

    return { success: true, message: 'Friend request accepted' };
  }

  async declineFriendRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findFirst({
      where: {
        id: requestId,
        toUserId: userId,
        status: FriendRequestStatus.PENDING,
      },
    });

    if (!request) {
      throw new NotFoundException('Pending friend request not found');
    }

    await this.prisma.friendRequest.update({
      where: { id: request.id },
      data: {
        status: FriendRequestStatus.DECLINED,
        respondedAt: new Date(),
      },
    });

    return { success: true, message: 'Friend request declined' };
  }

  async removeFriend(userId: string, friendId: string) {
    const pair = this.canonicalizePair(userId, friendId);
    const friendship = await this.prisma.friendship.findUnique({
      where: { userAId_userBId: pair },
    });

    if (!friendship || friendship.status !== FriendshipStatus.ACTIVE) {
      return { success: false, message: 'Friendship not found' };
    }

    await this.prisma.friendship.update({
      where: { id: friendship.id },
      data: {
        status: FriendshipStatus.REMOVED,
        removedAt: new Date(),
      },
    });

    return { success: true, message: 'Friend removed' };
  }

  async isFriend(userId: string, targetId: string): Promise<boolean> {
    const pair = this.canonicalizePair(userId, targetId);
    const friendship = await this.prisma.friendship.findUnique({
      where: { userAId_userBId: pair },
      select: { status: true },
    });
    return friendship?.status === FriendshipStatus.ACTIVE;
  }
}
