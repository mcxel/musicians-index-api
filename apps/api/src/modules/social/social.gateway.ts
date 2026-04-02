// apps/api/src/modules/social/social.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/social' })
export class SocialGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('social.friend_request')
  handleFriendRequest(client: Socket, payload: any): void {
    this.server.to(payload.recipientId).emit('social.friend_request', payload);
  }

  @SubscribeMessage('social.friend_accepted')
  handleFriendAccepted(client: Socket, payload: any): void {
    this.server.to(payload.recipientId).emit('social.friend_accepted', payload);
  }

  @SubscribeMessage('social.message')
  handleMessage(client: Socket, payload: any): void {
    this.server.to(payload.conversationId).emit('social.message', payload);
  }

  @SubscribeMessage('social.conversation_created')
  handleConversationCreated(client: Socket, payload: any): void {
    payload.members.forEach((memberId) => {
      this.server.to(memberId).emit('social.conversation_created', payload);
    });
  }
}
