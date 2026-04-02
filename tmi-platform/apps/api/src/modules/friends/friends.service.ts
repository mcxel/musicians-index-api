import { Injectable } from '@nestjs/common';

// TODO: Add Friend, FriendRequest models to Prisma schema
// TODO: Implement full friends logic once schema models are added

@Injectable()
export class FriendsService {
  async getFriends(_userId: string) {
    // TODO: return this.prisma.friend.findMany({ where: { userId: _userId } })
    return [];
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

  async isFriend(_userId: string, _targetId: string): Promise<boolean> {
    // TODO: check friendship
    return false;
  }
}
