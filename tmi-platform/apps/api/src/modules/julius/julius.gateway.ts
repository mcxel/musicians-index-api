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

interface JuliusChatMessage {
  roomId: string;
  userId: string;
  username: string;
  message: string;
  isJuliusResponse?: boolean;
}

interface JuliusEffectPayload {
  roomId: string;
  triggeredByUserId: string;
  effectKey: string;   // e.g. "confetti_burst", "spotlight_prank"
  effectType: string;  // THROWABLE, FILTER, OVERLAY
  targetUserId?: string;
  meta?: Record<string, unknown>;
}

interface JuliusAnimationPayload {
  roomId: string;
  animationKey: string; // e.g. "dance_wave", "mic_drop"
  triggeredByUserId: string;
  durationMs?: number;
}

interface JuliusPollPayload {
  roomId: string;
  pollId: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  durationSeconds: number;
  createdByUserId: string;
}

interface JuliusPollVotePayload {
  roomId: string;
  pollId: string;
  userId: string;
  optionId: string;
}

@WebSocketGateway({
  namespace: '/julius',
  cors: { origin: '*', credentials: true },
})
export class JuliusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(JuliusGateway.name);

  // roomId -> Set<socketId>
  private rooms = new Map<string, Set<string>>();

  // socketId -> roomId
  private socketRoomMap = new Map<string, string>();

  // Active polls: pollId -> { votes: Map<userId, optionId>, expiresAt }
  private activePolls = new Map<string, { votes: Map<string, string>; expiresAt: number; roomId: string }>();

  handleConnection(client: Socket) {
    this.logger.log(`Julius client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const roomId = this.socketRoomMap.get(client.id);
    if (roomId) {
      const members = this.rooms.get(roomId);
      if (members) {
        members.delete(client.id);
      }
      this.socketRoomMap.delete(client.id);
    }
    this.logger.log(`Julius client disconnected: ${client.id}`);
  }

  @SubscribeMessage('julius:join')
  handleJoin(
    @MessageBody() data: { roomId: string; userId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, username } = data;
    client.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(client.id);
    this.socketRoomMap.set(client.id, roomId);

    // Announce Julius is active in this room
    this.server.to(roomId).emit('julius:active', {
      roomId,
      userId,
      username,
      timestamp: Date.now(),
    });

    this.logger.log(`User ${username} joined Julius room ${roomId}`);
    return { success: true, roomId };
  }

  @SubscribeMessage('julius:leave')
  handleLeave(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    client.leave(roomId);

    const members = this.rooms.get(roomId);
    if (members) {
      members.delete(client.id);
    }
    this.socketRoomMap.delete(client.id);

    return { success: true };
  }

  @SubscribeMessage('julius:chat')
  handleChat(
    @MessageBody() data: JuliusChatMessage,
    @ConnectedSocket() _client: Socket,
  ) {
    // Broadcast user message to room
    this.server.to(data.roomId).emit('julius:chat', {
      ...data,
      timestamp: Date.now(),
    });

    // Simulate Julius AI response (in production, this calls JuliusService)
    if (!data.isJuliusResponse) {
      setTimeout(() => {
        this.server.to(data.roomId).emit('julius:chat', {
          roomId: data.roomId,
          userId: 'julius-ai',
          username: 'Julius',
          message: this.generateJuliusResponse(data.message),
          isJuliusResponse: true,
          timestamp: Date.now(),
        });
      }, 800);
    }

    return { success: true };
  }

  @SubscribeMessage('julius:effect')
  handleEffect(
    @MessageBody() data: JuliusEffectPayload,
    @ConnectedSocket() _client: Socket,
  ) {
    this.server.to(data.roomId).emit('julius:effect', {
      ...data,
      timestamp: Date.now(),
    });

    this.logger.debug(`Julius effect "${data.effectKey}" triggered in room ${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('julius:animation')
  handleAnimation(
    @MessageBody() data: JuliusAnimationPayload,
    @ConnectedSocket() _client: Socket,
  ) {
    this.server.to(data.roomId).emit('julius:animation', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  @SubscribeMessage('julius:poll:create')
  handlePollCreate(
    @MessageBody() data: JuliusPollPayload,
    @ConnectedSocket() _client: Socket,
  ) {
    const expiresAt = Date.now() + data.durationSeconds * 1000;

    this.activePolls.set(data.pollId, {
      votes: new Map(),
      expiresAt,
      roomId: data.roomId,
    });

    this.server.to(data.roomId).emit('julius:poll:started', {
      ...data,
      expiresAt,
      timestamp: Date.now(),
    });

    // Auto-close poll after duration
    setTimeout(() => {
      this.closePoll(data.pollId, data.roomId);
    }, data.durationSeconds * 1000);

    this.logger.log(`Julius poll "${data.question}" started in room ${data.roomId}`);
    return { success: true, pollId: data.pollId, expiresAt };
  }

  @SubscribeMessage('julius:poll:vote')
  handlePollVote(
    @MessageBody() data: JuliusPollVotePayload,
    @ConnectedSocket() _client: Socket,
  ) {
    const poll = this.activePolls.get(data.pollId);
    if (!poll || Date.now() > poll.expiresAt) {
      return { success: false, error: 'Poll expired or not found' };
    }

    // One vote per user
    poll.votes.set(data.userId, data.optionId);

    // Broadcast live vote tally
    const tally = this.computeTally(poll.votes);
    this.server.to(data.roomId).emit('julius:poll:update', {
      pollId: data.pollId,
      tally,
      totalVotes: poll.votes.size,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  @SubscribeMessage('julius:shoulder-pet')
  handleShoulderPet(
    @MessageBody() data: { roomId: string; fromUserId: string; toUserId: string; petType: string },
    @ConnectedSocket() _client: Socket,
  ) {
    this.server.to(data.roomId).emit('julius:shoulder-pet', {
      ...data,
      timestamp: Date.now(),
    });
    return { success: true };
  }

  // ---- Private helpers ----

  private closePoll(pollId: string, roomId: string) {
    const poll = this.activePolls.get(pollId);
    if (!poll) return;

    const tally = this.computeTally(poll.votes);
    const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];

    this.server.to(roomId).emit('julius:poll:closed', {
      pollId,
      tally,
      totalVotes: poll.votes.size,
      winner: winner ? { optionId: winner[0], votes: winner[1] } : null,
      timestamp: Date.now(),
    });

    this.activePolls.delete(pollId);
    this.logger.log(`Julius poll ${pollId} closed in room ${roomId}`);
  }

  private computeTally(votes: Map<string, string>): Record<string, number> {
    const tally: Record<string, number> = {};
    for (const optionId of votes.values()) {
      tally[optionId] = (tally[optionId] ?? 0) + 1;
    }
    return tally;
  }

  private generateJuliusResponse(message: string): string {
    // Lightweight response generator — production version calls JuliusService/AI
    const lower = message.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) return "Yo! Julius in the building! 🎤";
    if (lower.includes('music') || lower.includes('song')) return "Let's get this party started! 🎵";
    if (lower.includes('dance')) return "You know I can't resist a good beat! 💃";
    if (lower.includes('game')) return "Game time! Who's ready to compete? 🏆";
    if (lower.includes('poll')) return "Great idea! Let me set up a poll for the room! 📊";
    return "Julius is listening... 👀🎤";
  }

  // Server-side broadcast utility
  broadcastToRoom(roomId: string, event: string, payload: unknown) {
    this.server.to(roomId).emit(event, payload);
  }

  triggerEffect(roomId: string, effectKey: string, meta?: Record<string, unknown>) {
    this.server.to(roomId).emit('julius:effect', {
      roomId,
      effectKey,
      effectType: 'OVERLAY',
      triggeredByUserId: 'julius-ai',
      meta,
      timestamp: Date.now(),
    });
  }
}
