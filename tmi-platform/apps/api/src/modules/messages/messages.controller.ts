import { Controller, Get, Post, Delete, Param, Body, Request, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  getMessages(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.getMessages(id, req.user.id);
  }

  @Post()
  sendMessage(@Request() req: any, @Body() body: { toUserId: string; content: string }) {
    return this.messagesService.sendMessage(req.user.id, body.toUserId, body.content);
  }

  @Post('conversations/:id/read')
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.markAsRead(id, req.user.id);
  }

  @Delete(':messageId')
  deleteMessage(@Param('messageId') messageId: string, @Request() req: any) {
    return this.messagesService.deleteMessage(messageId, req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req: any) {
    return this.messagesService.getUnreadCount(req.user.id);
  }
}
