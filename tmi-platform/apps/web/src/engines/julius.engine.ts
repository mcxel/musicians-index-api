/**
 * Julius Engine — Client-Side
 * Manages Julius AI avatar: chat, animations, polls, games, effects,
 * store, unlocks, shoulder pet, and VR mode.
 *
 * Connects to: /api/julius/* REST + ws julius namespace
 * Depends on: JuliusGateway (Phase 6), EffectsEngine
 */

import type { Socket } from 'socket.io-client';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type JuliusMood = 'HYPE' | 'CHILL' | 'HYPE_BEAST' | 'MYSTERIOUS' | 'PLAYFUL' | 'SERIOUS';
export type JuliusAnimationId =
  | 'idle' | 'wave' | 'dance' | 'point' | 'laugh' | 'shrug'
  | 'thumbs_up' | 'thumbs_down' | 'spin' | 'bow' | 'celebrate'
  | 'think' | 'facepalm' | 'clap' | 'hype';

export type JuliusEffectId =
  | 'confetti' | 'fireworks' | 'sparkle' | 'lightning' | 'smoke'
  | 'rainbow' | 'gold_coins' | 'hearts' | 'fire' | 'ice';

export type JuliusPollStatus = 'PENDING' | 'ACTIVE' | 'CLOSED';
export type JuliusGameType = 'TRIVIA' | 'DEAL_OR_FEUD' | 'CYPHER' | 'SPIN_WIN' | 'GUESS_TRACK';

export interface JuliusChatMessage {
  id: string;
  role: 'julius' | 'user';
  content: string;
  timestamp: number;
  mood?: JuliusMood;
  animation?: JuliusAnimationId;
  effect?: JuliusEffectId;
}

export interface JuliusPoll {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; votes: number }>;
  status: JuliusPollStatus;
  totalVotes: number;
  userVote?: string;
  expiresAt?: number;
  createdAt: number;
}

export interface JuliusGame {
  id: string;
  type: JuliusGameType;
  title: string;
  status: 'WAITING' | 'ACTIVE' | 'FINISHED';
  players: Array<{ userId: string; displayName: string; score: number }>;
  currentRound?: number;
  totalRounds?: number;
  startedAt?: number;
  finishedAt?: number;
}

export interface JuliusStoreItem {
  id: string;
  name: string;
  description: string;
  category: 'SKIN' | 'ANIMATION' | 'EFFECT' | 'PET' | 'ACCESSORY' | 'VR_SKIN';
  price: number;
  currency: 'POINTS' | 'USD';
  previewUrl?: string;
  unlocked: boolean;
  equipped: boolean;
}

export interface JuliusShoulderPet {
  id: string;
  name: string;
  species: string;
  mood: string;
  level: number;
  xp: number;
  animations: string[];
  equipped: boolean;
}

export interface JuliusState {
  mood: JuliusMood;
  currentAnimation: JuliusAnimationId;
  activeEffect: JuliusEffectId | null;
  isVRMode: boolean;
  isSpeaking: boolean;
  equippedSkin: string;
  equippedPet: JuliusShoulderPet | null;
  chatHistory: JuliusChatMessage[];
  activePoll: JuliusPoll | null;
  activeGame: JuliusGame | null;
  unlockedItems: string[];
}

// ─── Julius Mood Config ────────────────────────────────────────────────────────

export const JULIUS_MOOD_CONFIG: Record<JuliusMood, { color: string; emoji: string; label: string }> = {
  HYPE:       { color: '#f59e0b', emoji: '🔥', label: 'Hype'       },
  CHILL:      { color: '#3b82f6', emoji: '😎', label: 'Chill'      },
  HYPE_BEAST: { color: '#ef4444', emoji: '💥', label: 'Hype Beast' },
  MYSTERIOUS: { color: '#8b5cf6', emoji: '🌙', label: 'Mysterious' },
  PLAYFUL:    { color: '#10b981', emoji: '🎮', label: 'Playful'    },
  SERIOUS:    { color: '#6b7280', emoji: '🎯', label: 'Serious'    },
};

// ─── Julius Engine ─────────────────────────────────────────────────────────────

export class JuliusEngine {
  private socket: Socket | null = null;
  private state: JuliusState;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private baseUrl: string;
  private animationQueue: JuliusAnimationId[] = [];
  private isProcessingQueue = false;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.state = this.getDefaultState();
  }

  private getDefaultState(): JuliusState {
    return {
      mood: 'CHILL',
      currentAnimation: 'idle',
      activeEffect: null,
      isVRMode: false,
      isSpeaking: false,
      equippedSkin: 'default',
      equippedPet: null,
      chatHistory: [],
      activePoll: null,
      activeGame: null,
      unlockedItems: [],
    };
  }

  // ─── Event Bus ─────────────────────────────────────────────────────────────

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  private fire(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }

  // ─── Socket Lifecycle ───────────────────────────────────────────────────────

  connect(socket: Socket): void {
    this.socket = socket;
    this.bindSocketEvents();
  }

  disconnect(): void {
    if (this.socket) {
      [
        'julius:state', 'julius:chat', 'julius:animation', 'julius:effect',
        'julius:mood', 'julius:poll', 'julius:poll_vote', 'julius:poll_closed',
        'julius:game_start', 'julius:game_update', 'julius:game_end',
        'julius:unlock', 'julius:pet_update', 'julius:vr_mode',
      ].forEach(e => this.socket!.off(e));
      this.socket = null;
    }
    this.state = this.getDefaultState();
  }

  private bindSocketEvents(): void {
    if (!this.socket) return;

    this.socket.on('julius:state', (state: Partial<JuliusState>) => {
      this.state = { ...this.state, ...state };
      this.fire('state', this.state);
    });

    this.socket.on('julius:chat', (message: JuliusChatMessage) => {
      this.state.chatHistory.push(message);
      if (this.state.chatHistory.length > 50) this.state.chatHistory.shift();
      if (message.animation) this.queueAnimation(message.animation);
      if (message.effect) this.triggerEffect(message.effect);
      this.fire('chat', message);
      this.fire('state', this.state);
    });

    this.socket.on('julius:animation', (animation: JuliusAnimationId) => {
      this.queueAnimation(animation);
    });

    this.socket.on('julius:effect', (effect: JuliusEffectId) => {
      this.triggerEffect(effect);
    });

    this.socket.on('julius:mood', (mood: JuliusMood) => {
      this.state.mood = mood;
      this.fire('mood', mood);
      this.fire('state', this.state);
    });

    this.socket.on('julius:poll', (poll: JuliusPoll) => {
      this.state.activePoll = poll;
      this.fire('poll', poll);
      this.fire('state', this.state);
    });

    this.socket.on('julius:poll_vote', (update: { pollId: string; options: JuliusPoll['options']; totalVotes: number }) => {
      if (this.state.activePoll?.id === update.pollId) {
        this.state.activePoll.options = update.options;
        this.state.activePoll.totalVotes = update.totalVotes;
        this.fire('poll_update', this.state.activePoll);
        this.fire('state', this.state);
      }
    });

    this.socket.on('julius:poll_closed', (pollId: string) => {
      if (this.state.activePoll?.id === pollId) {
        this.state.activePoll.status = 'CLOSED';
        this.fire('poll_closed', this.state.activePoll);
        setTimeout(() => {
          this.state.activePoll = null;
          this.fire('state', this.state);
        }, 5000);
      }
    });

    this.socket.on('julius:game_start', (game: JuliusGame) => {
      this.state.activeGame = game;
      this.fire('game_start', game);
      this.fire('state', this.state);
    });

    this.socket.on('julius:game_update', (update: Partial<JuliusGame>) => {
      if (this.state.activeGame) {
        this.state.activeGame = { ...this.state.activeGame, ...update };
        this.fire('game_update', this.state.activeGame);
        this.fire('state', this.state);
      }
    });

    this.socket.on('julius:game_end', (result: JuliusGame) => {
      this.state.activeGame = result;
      this.fire('game_end', result);
      setTimeout(() => {
        this.state.activeGame = null;
        this.fire('state', this.state);
      }, 10000);
    });

    this.socket.on('julius:unlock', (itemId: string) => {
      if (!this.state.unlockedItems.includes(itemId)) {
        this.state.unlockedItems.push(itemId);
      }
      this.fire('unlock', itemId);
      this.fire('state', this.state);
    });

    this.socket.on('julius:pet_update', (pet: JuliusShoulderPet | null) => {
      this.state.equippedPet = pet;
      this.fire('pet_update', pet);
      this.fire('state', this.state);
    });

    this.socket.on('julius:vr_mode', (enabled: boolean) => {
      this.state.isVRMode = enabled;
      this.fire('vr_mode', enabled);
      this.fire('state', this.state);
    });
  }

  // ─── Animation Queue ────────────────────────────────────────────────────────

  private queueAnimation(animation: JuliusAnimationId): void {
    this.animationQueue.push(animation);
    if (!this.isProcessingQueue) {
      this.processAnimationQueue();
    }
  }

  private processAnimationQueue(): void {
    if (this.animationQueue.length === 0) {
      this.isProcessingQueue = false;
      this.state.currentAnimation = 'idle';
      this.fire('animation', 'idle');
      return;
    }
    this.isProcessingQueue = true;
    const next = this.animationQueue.shift()!;
    this.state.currentAnimation = next;
    this.fire('animation', next);
    // Estimated animation durations (ms)
    const durations: Partial<Record<JuliusAnimationId, number>> = {
      idle: 2000, wave: 1500, dance: 3000, point: 1000, laugh: 2000,
      shrug: 1200, thumbs_up: 1000, thumbs_down: 1000, spin: 1500,
      bow: 1500, celebrate: 2500, think: 2000, facepalm: 1500,
      clap: 2000, hype: 3000,
    };
    setTimeout(() => this.processAnimationQueue(), durations[next] ?? 1500);
  }

  // ─── Effect Control ─────────────────────────────────────────────────────────

  private triggerEffect(effect: JuliusEffectId): void {
    this.state.activeEffect = effect;
    this.fire('effect', effect);
    setTimeout(() => {
      this.state.activeEffect = null;
      this.fire('effect_end', effect);
    }, 3000);
  }

  // ─── Chat Actions ───────────────────────────────────────────────────────────

  sendChat(content: string): void {
    if (!content.trim()) return;
    const userMsg: JuliusChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };
    this.state.chatHistory.push(userMsg);
    this.fire('chat', userMsg);
    this.socket?.emit('julius:chat', { content: content.trim() });
  }

  triggerAnimation(animation: JuliusAnimationId): void {
    this.socket?.emit('julius:animation', { animation });
    this.queueAnimation(animation);
  }

  triggerEffectRemote(effect: JuliusEffectId): void {
    this.socket?.emit('julius:effect', { effect });
  }

  setMood(mood: JuliusMood): void {
    this.socket?.emit('julius:set_mood', { mood });
  }

  // ─── Poll Actions ───────────────────────────────────────────────────────────

  votePoll(pollId: string, optionId: string): void {
    if (!this.state.activePoll || this.state.activePoll.id !== pollId) return;
    if (this.state.activePoll.userVote) return; // already voted
    this.state.activePoll.userVote = optionId;
    this.socket?.emit('julius:poll_vote', { pollId, optionId });
  }

  // ─── Game Actions ───────────────────────────────────────────────────────────

  joinGame(gameId: string): void {
    this.socket?.emit('julius:game_join', { gameId });
  }

  submitGameAnswer(gameId: string, answer: string): void {
    this.socket?.emit('julius:game_answer', { gameId, answer });
  }

  // ─── VR Mode ────────────────────────────────────────────────────────────────

  enableVRMode(): void {
    this.socket?.emit('julius:vr_mode', { enabled: true });
  }

  disableVRMode(): void {
    this.socket?.emit('julius:vr_mode', { enabled: false });
  }

  // ─── State Accessors ────────────────────────────────────────────────────────

  getState(): JuliusState { return { ...this.state }; }
  getMood(): JuliusMood { return this.state.mood; }
  getMoodConfig() { return JULIUS_MOOD_CONFIG[this.state.mood]; }
  getCurrentAnimation(): JuliusAnimationId { return this.state.currentAnimation; }
  getActiveEffect(): JuliusEffectId | null { return this.state.activeEffect; }
  isVRMode(): boolean { return this.state.isVRMode; }
  getChatHistory(): JuliusChatMessage[] { return [...this.state.chatHistory]; }
  getActivePoll(): JuliusPoll | null { return this.state.activePoll; }
  getActiveGame(): JuliusGame | null { return this.state.activeGame; }
  getEquippedPet(): JuliusShoulderPet | null { return this.state.equippedPet; }
  hasUnlocked(itemId: string): boolean { return this.state.unlockedItems.includes(itemId); }

  // ─── REST API ───────────────────────────────────────────────────────────────

  async fetchStoreItems(): Promise<JuliusStoreItem[]> {
    const res = await fetch(`${this.baseUrl}/julius/store`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Julius store fetch failed: ${res.status}`);
    return res.json() as Promise<JuliusStoreItem[]>;
  }

  async purchaseItem(itemId: string): Promise<{ success: boolean; item: JuliusStoreItem }> {
    const res = await fetch(`${this.baseUrl}/julius/store/purchase`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    if (!res.ok) throw new Error(`Julius purchase failed: ${res.status}`);
    return res.json();
  }

  async equipItem(itemId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${this.baseUrl}/julius/equip`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    if (!res.ok) throw new Error(`Julius equip failed: ${res.status}`);
    return res.json();
  }

  async fetchPolls(roomId?: string): Promise<JuliusPoll[]> {
    const url = roomId
      ? `${this.baseUrl}/julius/polls?roomId=${roomId}`
      : `${this.baseUrl}/julius/polls`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`Julius polls fetch failed: ${res.status}`);
    return res.json() as Promise<JuliusPoll[]>;
  }

  async createPoll(question: string, options: string[], expiresInSeconds?: number): Promise<JuliusPoll> {
    const res = await fetch(`${this.baseUrl}/julius/polls`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options, expiresInSeconds }),
    });
    if (!res.ok) throw new Error(`Julius poll create failed: ${res.status}`);
    return res.json() as Promise<JuliusPoll>;
  }

  async fetchGames(): Promise<JuliusGame[]> {
    const res = await fetch(`${this.baseUrl}/julius/games`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Julius games fetch failed: ${res.status}`);
    return res.json() as Promise<JuliusGame[]>;
  }

  async fetchChatHistory(limit = 20): Promise<JuliusChatMessage[]> {
    const res = await fetch(`${this.baseUrl}/julius/chat?limit=${limit}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Julius chat history fetch failed: ${res.status}`);
    return res.json() as Promise<JuliusChatMessage[]>;
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const juliusEngine = new JuliusEngine();

export function useJuliusEngine(): JuliusEngine {
  return juliusEngine;
}
