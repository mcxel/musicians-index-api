// apps/api/src/modules/social/friends.controller.ts
import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get(':userId')
  getFriends(@Param('userId') userId: string) {
    return this.friendsService.getFriends(userId);
  }

  @Post('requests')
  sendFriendRequest(@Body() sendFriendRequestDto: SendFriendRequestDto) {
    return this.friendsService.sendFriendRequest(sendFriendRequestDto);
  }

  @Patch('requests')
  respondToFriendRequest(@Body() respondFriendRequestDto: RespondFriendRequestDto) {
    return this.friendsService.respondToFriendRequest(respondFriendRequestDto);
  }
}
