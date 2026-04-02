import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface ChatMessage {
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

interface ReactionPayload {
  roomId: string;
  userId: string;
  emoji: string;
}

interface PollVotePayload {
  roomId: string;
  pollId: string;
  userId: string;
  optionId: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Track room membership: roomId -> Set<socketId>
  private rooms = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove from all rooms
    this.rooms.forEach((members, roomId) => {
      if (members.has(client.id)) {
        members.delete(client.id);
        this.server.to(roomId).emit('user:left', {
          socketId: client.id,
          roomId,
          memberCount: members.size,
        });
      }
    });
  }

  @SubscribeMessage('room:join')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, username } = data;
    client.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(client.id);

    this.server.to(roomId).emit('user:joined', {
      socketId: client.id,
      userId,
      username,
      roomId,
      memberCount: this.rooms.get(roomId)!.size,
    });

    this.logger.log(`User ${username} (${userId}) joined room ${roomId}`);
    return { success: true, roomId, memberCount: this.rooms.get(roomId)!.size };
  }

  @SubscribeMessage('room:leave')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string; userId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, username } = data;
    client.leave(roomId);

    const members = this.rooms.get(roomId);
    if (members) {
      members.delete(client.id);
    }

    this.server.to(roomId).emit('user:left', {
      socketId: client.id,
      userId,
      username,
      roomId,
      memberCount: members?.size ?? 0,
    });

    this.logger.log(`User ${username} (${userId}) left room ${roomId}`);
    return { success: true };
  }

  @SubscribeMessage('chat:message')
  handleChatMessage(
    @MessageBody() message: ChatMessage,
    @ConnectedSocket() _client: Socket,
  ) {
    const payload = {
      ...message,
      timestamp: message.timestamp ?? Date.now(),
    };

    this.server.to(message.roomId).emit('chat:message', payload);
    this.logger.debug(`Chat message in room ${message.roomId} from ${message.userId}`);
    return { success: true };
  }

  @SubscribeMessage('reaction:send')
  handleReaction(
    @MessageBody() data: ReactionPayload,
    @ConnectedSocket() _client: Socket,
  ) {
    this.server.to(data.roomId).emit('reaction:received', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  @SubscribeMessage('poll:vote')
  handlePollVote(
    @MessageBody() data: PollVotePayload,
    @ConnectedSocket() _client: Socket,
  ) {
    // Broadcast vote to room so all clients can update poll UI
    this.server.to(data.roomId).emit('poll:vote:received', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  @SubscribeMessage('presence:ping')
  handlePresencePing(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() _client: Socket,
  ) {
    this.server.to(data.roomId).emit('presence:update', {
      userId: data.userId,
      roomId: data.roomId,
      memberCount: this.rooms.get(data.roomId)?.size ?? 0,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  // Utility: broadcast from server-side (called by other services)
  broadcastToRoom(roomId: string, event: string, payload: unknown) {
    this.server.to(roomId).emit(event, payload);
  }

  getRoomMemberCount(roomId: string): number {
    return this.rooms.get(roomId)?.size ?? 0;
  }
}
