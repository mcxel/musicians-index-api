import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(MessagingGateway.name);

  constructor(private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.join(`user_${userId}`);
      this.logger.log(`User connected to chat: ${userId}`);
      this.server.emit('presence:update', { userId, status: 'ONLINE' });
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      this.server.emit('presence:update', { userId, status: 'OFFLINE' });
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(client: Socket, payload: { conversationId: string; content: string; senderId: string }) {
    const message = await this.prisma.message.create({
      data: {
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        content: payload.content,
      },
    });
    this.server.to(payload.conversationId).emit('message:receive', message);
  }

  @SubscribeMessage('room:join')
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
  }
}