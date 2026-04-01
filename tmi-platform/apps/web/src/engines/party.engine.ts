/**
 * Party Engine — Client-Side
 * Manages party formation, sync, invites, and real-time state
 * via WebSocket connection to the PartyGateway (ws://api:4000).
 *
 * Connects to: /api/party/* REST + ws party namespace
 * Depends on: WebSocket gateway (Phase 6)
 */

import type { Socket } from 'socket.io-client';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PartyStatus = 'FORMING' | 'ACTIVE' | 'IN_ROOM' | 'DISBANDED';
export type PartyRole = 'LEADER' | 'MEMBER' | 'GUEST';
export type PartyVisibility = 'PUBLIC' | 'FRIENDS_ONLY' | 'INVITE_ONLY';

export interface PartyMember {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: PartyRole;
  tier: 'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE';
  joinedAt: number;
  isReady: boolean;
  status: 'online' | 'idle' | 'in_room' | 'offline';
}

export interface PartyState {
  id: string;
  name: string;
  leaderId: string;
  status: PartyStatus;
  visibility: PartyVisibility;
  members: PartyMember[];
  maxSize: number;
  currentRoomId?: string;
  currentLobbyId?: string;
  createdAt: number;
  chatEnabled: boolean;
  allReady: boolean;
}

export interface PartyInvite {
  id: string;
  partyId: string;
  partyName: string;
  leaderName: string;
  fromUserId: string;
  toUserId: string;
  memberCount: number;
  maxSize: number;
  expiresAt: number;
}

export interface PartyChatMessage {
  id: string;
  partyId: string;
  userId: string;
  displayName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'system' | 'ready_check' | 'room_move';
}

export interface ReadyCheckState {
  partyId: string;
  initiatedBy: string;
  responses: Record<string, boolean>;
  expiresAt: number;
  allReady: boolean;
}

// ─── Party Size Limits by Tier ─────────────────────────────────────────────────

export const PARTY_SIZE_LIMITS: Record<'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE', number> = {
  FREE: 4,
  SUPPORTER: 8,
  PRO: 20,
  ELITE: 100,
};

// ─── Party Engine ──────────────────────────────────────────────────────────────

export class PartyEngine {
  private socket: Socket | null = null;
  private currentParty: PartyState | null = null;
  private chatHistory: PartyChatMessage[] = [];
  private pendingInvites: PartyInvite[] = [];
  private activeReadyCheck: ReadyCheckState | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private baseUrl: string;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // ─── Event Bus (declared first — used by bindSocketEvents) ─────────────────

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  private fireEvent(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }

  // ─── Socket Lifecycle ───────────────────────────────────────────────────────

  connect(socket: Socket): void {
    this.socket = socket;
    this.bindSocketEvents();
  }

  disconnect(): void {
    if (this.socket) {
      const events = [
        'party:state', 'party:member_joined', 'party:member_left',
        'party:member_ready', 'party:chat', 'party:invite',
        'party:ready_check', 'party:ready_check_result', 'party:room_move',
        'party:disbanded', 'party:leader_changed', 'disconnect', 'connect',
      ];
      events.forEach(e => this.socket!.off(e));
      this.socket = null;
    }
    this.currentParty = null;
    this.chatHistory = [];
    this.activeReadyCheck = null;
  }

  private bindSocketEvents(): void {
    if (!this.socket) return;

    this.socket.on('party:state', (state: PartyState) => {
      this.currentParty = state;
      this.fireEvent('state', state);
    });

    this.socket.on('party:member_joined', (member: PartyMember) => {
      if (!this.currentParty) return;
      const exists = this.currentParty.members.some(m => m.userId === member.userId);
      if (!exists) {
        this.currentParty.members.push(member);
      }
      this.fireEvent('member_joined', member);
      this.fireEvent('state', this.currentParty);
    });

    this.socket.on('party:member_left', (userId: string) => {
      if (!this.currentParty) return;
      this.currentParty.members = this.currentParty.members.filter(
        m => m.userId !== userId,
      );
      if (
        userId === this.currentParty.leaderId &&
        this.currentParty.members.length > 0
      ) {
        const next = this.currentParty.members[0];
        next.role = 'LEADER';
        this.currentParty.leaderId = next.userId;
      }
      this.fireEvent('member_left', userId);
      this.fireEvent('state', this.currentParty);
    });

    this.socket.on('party:member_ready', (payload: { userId: string; isReady: boolean }) => {
      if (!this.currentParty) return;
      const member = this.currentParty.members.find(m => m.userId === payload.userId);
      if (member) member.isReady = payload.isReady;
      this.currentParty.allReady = this.currentParty.members.every(m => m.isReady);
      this.fireEvent('member_ready', payload);
      this.fireEvent('state', this.currentParty);
    });

    this.socket.on('party:chat', (message: PartyChatMessage) => {
      this.chatHistory.push(message);
      if (this.chatHistory.length > 100) this.chatHistory.shift();
      this.fireEvent('chat', message);
    });

    this.socket.on('party:invite', (invite: PartyInvite) => {
      this.pendingInvites.push(invite);
      this.fireEvent('invite', invite);
    });

    this.socket.on('party:ready_check', (check: ReadyCheckState) => {
      this.activeReadyCheck = check;
      this.fireEvent('ready_check', check);
    });

    this.socket.on('party:ready_check_result', (check: ReadyCheckState) => {
      this.activeReadyCheck = check;
      this.fireEvent('ready_check_result', check);
      if (check.allReady) {
        setTimeout(() => {
          this.activeReadyCheck = null;
        }, 3000);
      }
    });

    this.socket.on('party:room_move', (payload: { roomId: string }) => {
      if (this.currentParty) {
        this.currentParty.currentRoomId = payload.roomId;
        this.currentParty.status = 'IN_ROOM';
      }
      this.fireEvent('room_move', payload);
    });

    this.socket.on('party:disbanded', () => {
      this.currentParty = null;
      this.chatHistory = [];
      this.activeReadyCheck = null;
      this.fireEvent('disbanded', null);
    });

    this.socket.on('party:leader_changed', (payload: { newLeaderId: string }) => {
      if (!this.currentParty) return;
      this.currentParty.leaderId = payload.newLeaderId;
      this.currentParty.members.forEach(m => {
        m.role = m.userId === payload.newLeaderId ? 'LEADER' : 'MEMBER';
      });
      this.fireEvent('leader_changed', payload);
      this.fireEvent('state', this.currentParty);
    });

    this.socket.on('disconnect', () => {
      this.fireEvent('disconnected', null);
      this.scheduleReconnect();
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.fireEvent('connected', null);
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.fireEvent('reconnect_failed', null);
      return;
    }
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    setTimeout(() => {
      this.socket?.connect();
    }, delay);
  }

  // ─── Party Actions ──────────────────────────────────────────────────────────

  joinParty(partyId: string): void {
    this.socket?.emit('party:join', { partyId });
  }

  leaveParty(): void {
    if (!this.currentParty) return;
    this.socket?.emit('party:leave', { partyId: this.currentParty.id });
  }

  disbandParty(): void {
    if (!this.currentParty) return;
    this.socket?.emit('party:disband', { partyId: this.currentParty.id });
  }

  inviteMember(toUserId: string): void {
    if (!this.currentParty) return;
    this.socket?.emit('party:invite', { partyId: this.currentParty.id, toUserId });
  }

  acceptInvite(inviteId: string): void {
    const invite = this.pendingInvites.find(i => i.id === inviteId);
    if (!invite) return;
    this.socket?.emit('party:accept_invite', { inviteId, partyId: invite.partyId });
    this.pendingInvites = this.pendingInvites.filter(i => i.id !== inviteId);
  }

  declineInvite(inviteId: string): void {
    this.socket?.emit('party:decline_invite', { inviteId });
    this.pendingInvites = this.pendingInvites.filter(i => i.id !== inviteId);
  }

  setReady(isReady: boolean): void {
    if (!this.currentParty) return;
    this.socket?.emit('party:ready', { partyId: this.currentParty.id, isReady });
  }

  initiateReadyCheck(): void {
    if (!this.currentParty) return;
    this.socket?.emit('party:ready_check', { partyId: this.currentParty.id });
  }

  respondToReadyCheck(isReady: boolean): void {
    if (!this.activeReadyCheck) return;
    this.socket?.emit('party:ready_check_response', {
      partyId: this.activeReadyCheck.partyId,
      isReady,
    });
  }

  moveToRoom(roomId: string): void {
    if (!this.currentParty) return;
    this.socket?.emit('party:move_to_room', { partyId: this.currentParty.id, roomId });
  }

  sendChat(content: string): void {
    if (!this.currentParty || !content.trim()) return;
    this.socket?.emit('party:chat', {
      partyId: this.currentParty.id,
      content: content.trim(),
    });
  }

  transferLeadership(toUserId: string): void {
    if (!this.currentParty) return;
    this.socket?.emit('party:transfer_leader', {
      partyId: this.currentParty.id,
      toUserId,
    });
  }

  kickMember(userId: string): void {
    if (!this.currentParty) return;
    this.socket?.emit('party:kick', { partyId: this.currentParty.id, userId });
  }

  // ─── State Accessors ────────────────────────────────────────────────────────

  getCurrentParty(): PartyState | null {
    return this.currentParty;
  }

  getChatHistory(): PartyChatMessage[] {
    return [...this.chatHistory];
  }

  getPendingInvites(): PartyInvite[] {
    return [...this.pendingInvites];
  }

  getActiveReadyCheck(): ReadyCheckState | null {
    return this.activeReadyCheck;
  }

  isInParty(): boolean {
    return this.currentParty !== null;
  }

  isLeader(userId: string): boolean {
    return this.currentParty?.leaderId === userId;
  }

  getMemberCount(): number {
    return this.currentParty?.members.length ?? 0;
  }

  isFull(): boolean {
    if (!this.currentParty) return false;
    return this.currentParty.members.length >= this.currentParty.maxSize;
  }

  isAllReady(): boolean {
    return this.currentParty?.allReady ?? false;
  }

  getReadyCount(): number {
    return this.currentParty?.members.filter(m => m.isReady).length ?? 0;
  }

  getMember(userId: string): PartyMember | undefined {
    return this.currentParty?.members.find(m => m.userId === userId);
  }

  getMaxPartySize(tier: 'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE'): number {
    return PARTY_SIZE_LIMITS[tier];
  }

  // ─── REST API ───────────────────────────────────────────────────────────────

  async fetchParty(id: string): Promise<PartyState> {
    const res = await fetch(`${this.baseUrl}/party/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch party: ${res.status}`);
    return res.json() as Promise<PartyState>;
  }

  async fetchMyParty(): Promise<PartyState | null> {
    const res = await fetch(`${this.baseUrl}/party/me`, { credentials: 'include' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch party: ${res.status}`);
    return res.json() as Promise<PartyState>;
  }

  async createPartyRest(data: {
    name: string;
    visibility?: PartyVisibility;
    maxSize?: number;
  }): Promise<PartyState> {
    const res = await fetch(`${this.baseUrl}/party`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create party: ${res.status}`);
    return res.json() as Promise<PartyState>;
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const partyEngine = new PartyEngine();

export function usePartyEngine(): PartyEngine {
  return partyEngine;
}
