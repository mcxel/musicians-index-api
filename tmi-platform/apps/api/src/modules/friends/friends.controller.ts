import { Controller, Get, Post, Delete, Param, Body, Request, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  getFriends(@Request() req: any) {
    return this.friendsService.getFriends(req.user.id);
  }

  @Get('requests')
  getFriendRequests(@Request() req: any) {
    return this.friendsService.getFriendRequests(req.user.id);
  }

  @Post('request')
  sendFriendRequest(@Request() req: any, @Body() body: { toUserId: string }) {
    return this.friendsService.sendFriendRequest(req.user.id, body.toUserId);
  }

  @Post('request/:id/accept')
  acceptFriendRequest(@Param('id') id: string, @Request() req: any) {
    return this.friendsService.acceptFriendRequest(id, req.user.id);
  }

  @Post('request/:id/decline')
  declineFriendRequest(@Param('id') id: string, @Request() req: any) {
    return this.friendsService.declineFriendRequest(id, req.user.id);
  }

  @Delete(':friendId')
  removeFriend(@Request() req: any, @Param('friendId') friendId: string) {
    return this.friendsService.removeFriend(req.user.id, friendId);
  }
}
