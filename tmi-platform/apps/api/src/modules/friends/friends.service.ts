import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFriends(userId: string) {
    if (!userId) return { friends: [] };
    try {
      const rows = await this.prisma.friendship.findMany({
        where: {
          status: 'accepted',
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        include: {
          requester: { select: { id: true, displayName: true, name: true, role: true, accountStatus: true } },
          addressee: { select: { id: true, displayName: true, name: true, role: true, accountStatus: true } },
        },
      });
      const friends = rows.flatMap((row) => {
        const other = row.requesterId === userId ? row.addressee : row.requester;
        if (!other?.id || other.id === userId) return [];
        if (other.accountStatus === 'banned') return [];
        const name = (other.displayName || other.name || '').trim();
        if (!name) return [];
        return [{
          id: other.id,
          name,
          role: String(other.role),
          relationshipStatus: 'accepted' as const,
          online: false,
        }];
      });
      return { friends };
    } catch {
      return { friends: [] };
    }
  }

  async getFriendRequests(_userId: string) {
    // TODO: return this.prisma.friendRequest.findMany({ where: { toUserId: _userId, status: 'PENDING' } })
    return [];
  }

  async sendFriendRequest(_fromUserId: string, _toUserId: string) {
    // TODO: implement friend request logic
    return { success: false, message: 'TODO: Friend requests not yet implemented' };
  }

  async acceptFriendRequest(_requestId: string, _userId: string) {
    // TODO: implement accept logic
    return { success: false, message: 'TODO: Friend requests not yet implemented' };
  }

  async declineFriendRequest(_requestId: string, _userId: string) {
    // TODO: implement decline logic
    return { success: false, message: 'TODO: Friend requests not yet implemented' };
  }

  async removeFriend(_userId: string, _friendId: string) {
    // TODO: implement remove friend logic
    return { success: false, message: 'TODO: Friends not yet implemented' };
  }

  async isFriend(userId: string, targetId: string): Promise<boolean> {
    if (!userId || !targetId || userId === targetId) return false;
    try {
      const row = await this.prisma.friendship.findFirst({
        where: {
          status: 'accepted',
          OR: [
            { requesterId: userId, addresseeId: targetId },
            { requesterId: targetId, addresseeId: userId },
          ],
        },
        select: { id: true },
      });
      return Boolean(row);
    } catch {
      return false;
    }
  }
}
