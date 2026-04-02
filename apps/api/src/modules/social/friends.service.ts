// apps/api/src/modules/social/friends.service.ts
import { Injectable } from '@nestjs/common';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';

@Injectable()
export class FriendsService {
  getFriends(userId: string) {
    // Logic to get friends from the database
    return { userId, friends: [] };
  }

  sendFriendRequest(sendFriendRequestDto: SendFriendRequestDto) {
    // Logic to create a friend request
    console.log(sendFriendRequestDto);
    return { status: 'request sent' };
  }

  respondToFriendRequest(respondFriendRequestDto: RespondFriendRequestDto) {
    // Logic to accept/decline a friend request
    console.log(respondFriendRequestDto);
    return { status: 'request responded' };
  }
}
