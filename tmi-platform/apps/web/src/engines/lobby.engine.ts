/**
 * Lobby Engine — Client-Side
 * Manages lobby presence, themes, chat, invites, and real-time state
 * via WebSocket connection to the LobbyGateway (ws://api:4000).
 *
 * Connects to: /api/lobby/* REST + ws lobby namespace
 * Depends on: WebSocket gateway (Phase 6), Economy Engine (tier gating)
 */

import type { Socket } from 'socket.io-client';

// ─── Lobby Types ───────────────────────────────────────────────────────────────

export type LobbyType =
  | 'THEATER'
  | 'BAR'
  | 'CLUB'
  | 'ARENA'
  | 'VIP'
  | 'MEMORY_WALL'
  | 'JUKEBOX'
  | 'MINI_GAME';

export type LobbyStatus = 'OPEN' | 'FULL' | 'LOCKED' | 'PRIVATE' | 'MAINTENANCE';

export type LobbyTheme =
  | 'default'
  | 'neon'
  | 'gold'
  | 'midnight'
  | 'tropical'
  | 'retro'
  | 'futuristic'
  | 'underground';

export interface LobbyMember {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  tier: 'FREE' | 'SUPPORTER' | 'PRO' | 'ELITE';
  joinedAt: number;
  isHost: boolean;
  status: 'active' | 'idle' | 'away';
}

export interface LobbyState {
  id: string;
  name: string;
  type: LobbyType;
  theme: LobbyTheme;
  status: LobbyStatus;
  capacity: number;
  memberCount: number;
  members: LobbyMember[];
  hostUserId: string;
  isPublic: boolean;
  tags: string[];
  createdAt: number;
  activeRoomId?: string;
  jukeboxTrack?: string;
  chatEnabled: boolean;
}

export interface LobbyChatMessage {
  id: string;
  lobbyId: string;
  userId: string;
  displayName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'system' | 'reaction' | 'invite';
}

export interface LobbyInvite {
  id: string;
  lobbyId: string;
  lobbyName: string;
  fromUserId: string;
  fromDisplayName: string;
  toUserId: string;
  expiresAt: number;
}

// ─── Lobby Theme Config ────────────────────────────────────────────────────────

export const LOBBY_THEME_CONFIG: Record<LobbyTheme, {
  label: string;
  primaryColor: string;
  bgGradient: string;
  accentColor: string;
  requiresTier?: 'SUPPORTER' | 'PRO' | 'ELITE';
}> = {
  default:     { label: 'Default',     primaryColor: '#1f2937', bgGradient: 'from-gray-900 to-gray-800',   accentColor: '#f59e0b' },
  neon:        { label: 'Neon',        primaryColor: '#0f172a', bgGradient: 'from-slate-900 to-purple-900', accentColor: '#a855f7', requiresTier: 'SUPPORTER' },
  gold:        { label: 'Gold',        primaryColor: '#1c1400', bgGradient: 'from-yellow-950 to-amber-900', accentColor: '#f59e0b', requiresTier: 'PRO' },
  midnight:    { label: 'Midnight',    primaryColor: '#020617', bgGradient: 'from-slate-950 to-blue-950',   accentColor: '#3b82f6', requiresTier: 'SUPPORTER' },
  tropical:    { label: 'Tropical',    primaryColor: '#052e16', bgGradient: 'from-green-950 to-teal-900',   accentColor: '#10b981', requiresTier: 'SUPPORTER' },
  retro:       { label: 'Retro',       primaryColor: '#1a0a00', bgGradient: 'from-orange-950 to-red-900',   accentColor: '#f97316', requiresTier: 'PRO' },
  futuristic:  { label: 'Futuristic',  primaryColor: '#000d1a', bgGradient: 'from-cyan-950 to-blue-900',    accentColor: '#06b6d4', requiresTier: 'PRO' },
  underground: { label: 'Underground', primaryColor: '#0a0a0a', bgGradient: 'from-zinc-950 to-stone-900',   accentColor: '#ef4444', requiresTier: 'ELITE' },
};

export const LOBBY_TYPE_CONFIG: Record<LobbyType, {
  label: string;
  icon: string;
  defaultCapacity: number;
  description: string;
}> = {
  THEATER:     { label: 'Theater',     icon: '🎭', defaultCapacity: 200, description: 'Watch live performances together' },
  BAR:         { label: 'Bar',         icon: '🍻', defaultCapacity: 50,  description: 'Chill and chat with the community' },
  CLUB:        { label: 'Club',        icon: '🎵', defaultCapacity: 100, description: 'Dance and vibe to the music' },
  ARENA:       { label: 'Arena',       icon: '🏟️', defaultCapacity: 500, description: 'Massive events and competitions' },
  VIP:         { label: 'VIP Lounge',  icon: '👑', defaultCapacity: 20,  description: 'Exclusive space for premium members' },
  MEMORY_WALL: { label: 'Memory Wall', icon: '🖼️', defaultCapacity: 30,  description: 'Celebrate artists and moments' },
  JUKEBOX:     { label: 'Jukebox',     icon: '🎶', defaultCapacity: 40,  description: 'Community music selection' },
  MINI_GAME:   { label: 'Mini Games',  icon: '🎮', defaultCapacity: 16,  description: 'Play games with other members' },
};

// ─── Lobby Engine Class ────────────────────────────────────────────────────────

export class LobbyEngine {
  private socket: Socket | null = null;
  private currentLobby: LobbyState | null = null;
  private chatHistory: LobbyChatMessage[] = [];
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private baseUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // ─── Socket Connection ──────────────────────────────────────────────────────

  connect(socket: Socket): void {
    this.socket = socket;
    this.bindSocketEvents();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.off('lobby:state');
      this.socket.off('lobby:member_joined');
      this.socket.off('lobby:member_left');
      this.socket.off('lobby:chat');
      this.socket.off('lobby:theme_changed');
      this.socket.off('lobby:status_changed');
      this.socket = null;
    }
    this.currentLobby = null;
    this.chatHistory = [];
  }

  private bindSocketEvents(): void {
    if (!this.socket) return;

    this.socket.on('lobby:state', (state: LobbyState) => {
      this.currentLobby = state;
      this.emit('state', state);
    });

    this.socket.on('lobby:member_joined', (member: LobbyMember) => {
      if (this.currentLobby) {
        this.currentLobby.members.push(member);
        this.currentLobby.memberCount++;
        this.emit('member_joined', member);
        this.emit('state', this.currentLobby);
      }
    });

    this.socket.on('lobby:member_left', (userId: string) => {
      if (this.currentLobby) {
        this.currentLobby.members = this.currentLobby.members.filter(m => m.userId !== userId);
        this.currentLobby.memberCount = Math.max(0, this.currentLobby.memberCount - 1);
        this.emit('member_left', userId);
        this.emit('state', this.currentLobby);
      }
    });

    this.socket.on('lobby:chat', (message: LobbyChatMessage) => {
      this.chatHistory.push(message);
      if (this.chatHistory.length > 200) this.chatHistory.shift();
      this.emit('chat', message);
    });

    this.socket.on('lobby:theme_changed', (theme: LobbyTheme) => {
      if (this.currentLobby) {
        this.currentLobby.theme = theme;
        this.emit('theme_changed', theme);
        this.emit('state', this.currentLobby);
      }
    });

    this.socket.on('lobby:status_changed', (status: LobbyStatus) => {
      if (this.currentLobby) {
        this.currentLobby.status = status;
        this.emit('status_changed', status);
        this.emit('state', this.currentLobby);
      }
    });

    this.socket.on('lobby:invite', (invite: LobbyInvite) => {
      this.emit('invite', invite);
    });

    this.socket.on('disconnect', () => {
      this.emit('disconnected', null);
      this.attemptReconnect();
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.emit('connected', null);
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnect_failed', null);
      return;
    }
    this.reconnectAttempts++;
    setTimeout(() => {
      this.socket?.connect();
    }, Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000));
  }

  // ─── Lobby Actions ──────────────────────────────────────────────────────────

  joinLobby(lobbyId: string, userId: string): void {
    this.socket?.emit('lobby:join', { lobbyId, userId });
  }

  leaveLobby(): void {
    if (this.currentLobby) {
      this.socket?.emit('lobby:leave', { lobbyId: this.currentLobby.id });
      this.currentLobby = null;
      this.chatHistory = [];
    }
  }

  sendChat(content: string, type: LobbyChatMessage['type'] = 'text'): void {
    if (!this.currentLobby || !content.trim()) return;
    this.socket?.emit('lobby:chat', {
      lobbyId: this.currentLobby.id,
      content: content.trim(),
      type,
    });
  }

  sendInvite(toUserId: string): void {
    if (!this.currentLobby) return;
    this.socket?.emit('lobby:invite', {
      lobbyId: this.currentLobby.id,
      toUserId,
    });
  }

  changeTheme(theme: LobbyTheme): void {
    if (!this.currentLobby) return;
    this.socket?.emit('lobby:change_theme', {
      lobbyId: this.currentLobby.id,
      theme,
    });
  }

  setJukeboxTrack(trackId: string): void {
    if (!this.currentLobby) return;
    this.socket?.emit('lobby:jukebox', {
      lobbyId: this.currentLobby.id,
      trackId,
    });
  }

  // ─── State Accessors ────────────────────────────────────────────────────────

  getCurrentLobby(): LobbyState | null {
    return this.currentLobby;
  }

  getChatHistory(): LobbyChatMessage[] {
    return [...this.chatHistory];
  }

  getMemberCount(): number {
    return this.currentLobby?.memberCount ?? 0;
  }

  isInLobby(): boolean {
    return this.currentLobby !== null;
  }

  isFull(): boolean {
    if (!this.currentLobby) return false;
    return this.currentLobby.memberCount >= this.currentLobby.capacity;
  }

  getThemeConfig(theme: LobbyTheme) {
    return LOBBY_THEME_CONFIG[theme];
  }

  getTypeConfig(type: LobbyType) {
    return LOBBY_TYPE_CONFIG[type];
  }

  // ─── REST API Calls ─────────────────────────────────────────────────────────

  async fetchLobbies(type?: LobbyType): Promise<LobbyState[]> {
    const url = type
      ? `${this.baseUrl}/lobby?type=${type}`
      : `${this.baseUrl}/lobby`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch lobbies: ${res.status}`);
    return res.json();
  }

  async fetchLobby(id: string): Promise<LobbyState> {
    const res = await fetch(`${this.baseUrl}/lobby/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch lobby: ${res.status}`);
    return res.json();
  }

  async createLobby(data: {
    name: string;
    type: LobbyType;
    theme?: LobbyTheme;
    isPublic?: boolean;
    capacity?: number;
  }): Promise<LobbyState> {
    const res = await fetch(`${this.baseUrl}/lobby`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create lobby: ${res.status}`);
    return res.json();
  }

  // ─── Event Emitter ──────────────────────────────────────────────────────────

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(l => l(data));
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const lobbyEngine = new LobbyEngine();

export function useLobbyEngine(): LobbyEngine {
  return lobbyEngine;
}
