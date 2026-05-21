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

interface PartyMemberPresence {
  userId: string;
  username: string;
  avatarUrl?: string;
  isLeader: boolean;
  status: 'READY' | 'NOT_READY' | 'IN_ROOM';
  joinedAt: number;
}

@WebSocketGateway({
  namespace: '/party',
  cors: { origin: '*', credentials: true },
})
export class PartyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PartyGateway.name);

  // partyId -> Map<socketId, PartyMemberPresence>
  private parties = new Map<string, Map<string, PartyMemberPresence>>();

  // socketId -> partyId
  private socketPartyMap = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Party client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const partyId = this.socketPartyMap.get(client.id);
    if (partyId) {
      const members = this.parties.get(partyId);
      if (members) {
        const user = members.get(client.id);
        members.delete(client.id);
        this.socketPartyMap.delete(client.id);

        this.server.to(partyId).emit('party:sync', {
          partyId,
          event: 'member_left',
          userId: user?.userId,
          username: user?.username,
          members: Array.from(members.values()),
          memberCount: members.size,
          timestamp: Date.now(),
        });
      }
    }
    this.logger.log(`Party client disconnected: ${client.id}`);
  }

  @SubscribeMessage('party:join')
  handleJoin(
    @MessageBody() data: { partyId: string; userId: string; username: string; avatarUrl?: string; isLeader?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const { partyId, userId, username, avatarUrl, isLeader } = data;
    client.join(partyId);

    if (!this.parties.has(partyId)) {
      this.parties.set(partyId, new Map());
    }

    const member: PartyMemberPresence = {
      userId,
      username,
      avatarUrl,
      isLeader: isLeader ?? false,
      status: 'READY',
      joinedAt: Date.now(),
    };

    this.parties.get(partyId)!.set(client.id, member);
    this.socketPartyMap.set(client.id, partyId);

    const members = Array.from(this.parties.get(partyId)!.values());

    this.server.to(partyId).emit('party:sync', {
      partyId,
      event: 'member_joined',
      userId,
      username,
      members,
      memberCount: members.length,
      timestamp: Date.now(),
    });

    this.logger.log(`User ${username} joined party ${partyId} (${members.length} members)`);
    return { success: true, partyId, members, memberCount: members.length };
  }

  @SubscribeMessage('party:leave')
  handleLeave(
    @MessageBody() data: { partyId: string; userId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { partyId, userId, username } = data;
    client.leave(partyId);

    const members = this.parties.get(partyId);
    if (members) {
      members.delete(client.id);
      this.socketPartyMap.delete(client.id);

      this.server.to(partyId).emit('party:sync', {
        partyId,
        event: 'member_left',
        userId,
        username,
        members: Array.from(members.values()),
        memberCount: members.size,
        timestamp: Date.now(),
      });
    }

    return { success: true };
  }

  @SubscribeMessage('party:status')
  handleStatusUpdate(
    @MessageBody() data: { partyId: string; userId: string; status: 'READY' | 'NOT_READY' | 'IN_ROOM' },
    @ConnectedSocket() client: Socket,
  ) {
    const members = this.parties.get(data.partyId);
    if (members) {
      const member = members.get(client.id);
      if (member) {
        member.status = data.status;
      }
    }

    this.server.to(data.partyId).emit('party:status:update', {
      partyId: data.partyId,
      userId: data.userId,
      status: data.status,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  @SubscribeMessage('party:invite')
  handleInvite(
    @MessageBody() data: { partyId: string; fromUserId: string; fromUsername: string; toUserId: string },
    @ConnectedSocket() _client: Socket,
  ) {
    // Broadcast to party — target client filters by toUserId
    this.server.to(data.partyId).emit('party:invite:received', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  @SubscribeMessage('party:move')
  handleMove(
    @MessageBody() data: { partyId: string; leaderId: string; destination: string; destinationType: 'LOBBY' | 'ROOM' | 'EVENT' },
    @ConnectedSocket() _client: Socket,
  ) {
    // Leader moves entire party to a destination
    this.server.to(data.partyId).emit('party:move', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  @SubscribeMessage('party:chat')
  handleChat(
    @MessageBody() data: { partyId: string; userId: string; username: string; content: string },
    @ConnectedSocket() _client: Socket,
  ) {
    this.server.to(data.partyId).emit('party:chat', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  // Server-side broadcast utility
  broadcastToParty(partyId: string, event: string, payload: unknown) {
    this.server.to(partyId).emit(event, payload);
  }

  getPartyMemberCount(partyId: string): number {
    return this.parties.get(partyId)?.size ?? 0;
  }
}
