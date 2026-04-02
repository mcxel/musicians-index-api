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

interface LobbyPresenceUser {
  userId: string;
  username: string;
  avatarUrl?: string;
  role?: string;
  joinedAt: number;
}

interface LobbyInvitePayload {
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  lobbyId: string;
  lobbyName: string;
}

@WebSocketGateway({
  namespace: '/lobby',
  cors: { origin: '*', credentials: true },
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LobbyGateway.name);

  // lobbyId -> Map<socketId, LobbyPresenceUser>
  private lobbies = new Map<string, Map<string, LobbyPresenceUser>>();

  // socketId -> lobbyId (for cleanup on disconnect)
  private socketLobbyMap = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Lobby client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Lobby client disconnected: ${client.id}`);
    const lobbyId = this.socketLobbyMap.get(client.id);
    if (lobbyId) {
      const members = this.lobbies.get(lobbyId);
      if (members) {
        const user = members.get(client.id);
        members.delete(client.id);
        this.socketLobbyMap.delete(client.id);

        this.server.to(lobbyId).emit('lobby:presence', {
          lobbyId,
          event: 'leave',
          userId: user?.userId,
          username: user?.username,
          members: Array.from(members.values()),
          memberCount: members.size,
          timestamp: Date.now(),
        });
      }
    }
  }

  @SubscribeMessage('lobby:join')
  handleJoin(
    @MessageBody() data: { lobbyId: string; userId: string; username: string; avatarUrl?: string; role?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { lobbyId, userId, username, avatarUrl, role } = data;
    client.join(lobbyId);

    if (!this.lobbies.has(lobbyId)) {
      this.lobbies.set(lobbyId, new Map());
    }

    const user: LobbyPresenceUser = { userId, username, avatarUrl, role, joinedAt: Date.now() };
    this.lobbies.get(lobbyId)!.set(client.id, user);
    this.socketLobbyMap.set(client.id, lobbyId);

    const members = Array.from(this.lobbies.get(lobbyId)!.values());

    this.server.to(lobbyId).emit('lobby:presence', {
      lobbyId,
      event: 'join',
      userId,
      username,
      members,
      memberCount: members.length,
      timestamp: Date.now(),
    });

    this.logger.log(`User ${username} joined lobby ${lobbyId} (${members.length} members)`);
    return { success: true, lobbyId, members, memberCount: members.length };
  }

  @SubscribeMessage('lobby:leave')
  handleLeave(
    @MessageBody() data: { lobbyId: string; userId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { lobbyId, userId, username } = data;
    client.leave(lobbyId);

    const members = this.lobbies.get(lobbyId);
    if (members) {
      members.delete(client.id);
      this.socketLobbyMap.delete(client.id);

      this.server.to(lobbyId).emit('lobby:presence', {
        lobbyId,
        event: 'leave',
        userId,
        username,
        members: Array.from(members.values()),
        memberCount: members.size,
        timestamp: Date.now(),
      });
    }

    return { success: true };
  }

  @SubscribeMessage('lobby:chat')
  handleChat(
    @MessageBody() data: { lobbyId: string; userId: string; username: string; content: string },
    @ConnectedSocket() _client: Socket,
  ) {
    this.server.to(data.lobbyId).emit('lobby:chat', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  @SubscribeMessage('lobby:invite')
  handleInvite(
    @MessageBody() data: LobbyInvitePayload,
    @ConnectedSocket() _client: Socket,
  ) {
    // Broadcast invite to all in lobby — target client filters by toUserId
    this.server.to(data.lobbyId).emit('lobby:invite:received', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  @SubscribeMessage('lobby:activity')
  handleActivity(
    @MessageBody() data: { lobbyId: string; userId: string; activity: string; meta?: Record<string, unknown> },
    @ConnectedSocket() _client: Socket,
  ) {
    // Broadcast activity events (jukebox play, minigame start, etc.)
    this.server.to(data.lobbyId).emit('lobby:activity', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  // Server-side broadcast utility
  broadcastToLobby(lobbyId: string, event: string, payload: unknown) {
    this.server.to(lobbyId).emit(event, payload);
  }

  getLobbyMemberCount(lobbyId: string): number {
    return this.lobbies.get(lobbyId)?.size ?? 0;
  }

  getLobbyMembers(lobbyId: string): LobbyPresenceUser[] {
    return Array.from(this.lobbies.get(lobbyId)?.values() ?? []);
  }
}
