/**
 * Bubble Engine — manages a user's Bubble Character, which is their
 * world identity used in rooms, games, world dance party, chats, and comments.
 * A bubble wraps an AvatarConfig with social/rank layers.
 */

import type { AvatarConfig, AnimationStyle } from '@/lib/avatar/avatarEngine';

export type RankBadge =
  | 'newcomer' | 'regular' | 'rising' | 'performer' | 'artist'
  | 'headliner' | 'legend' | 'vip' | 'sponsor' | 'moderator' | 'host';

export type DanceMove =
  | 'two-step' | 'bounce' | 'wave' | 'snap' | 'dab'
  | 'bankroll' | 'running-man' | 'hit-dem-folks' | 'wobble' | 'moonwalk';

export type EmoteType =
  | 'fire' | 'clap' | 'point-up' | 'laugh' | 'sunglasses'
  | 'crown' | 'mic-drop' | 'money-rain' | 'heart' | 'skull';

export interface BubbleCharacter {
  id: string;
  userId: string;
  displayName: string;
  avatar: AvatarConfig;

  // Rank / Status
  rankBadge: RankBadge;
  points: number;
  level: number;
  hasCrown: boolean;

  // Visual effects
  glowColor: string;         // hex — aura color
  glowIntensity: number;     // 0–1 based on points/rank
  nameTagColor: string;

  // Motion
  currentDance: DanceMove;
  idleAnimation: AnimationStyle;
  activeEmote?: EmoteType;

  // Equippable items
  sponsorItems: string[];    // sponsor logo overlays, badges
  collectibles: string[];    // NFT cosmetics

  // World state
  isInRoom: boolean;
  currentRoomId?: string;
  isOnStage: boolean;
  isAudience: boolean;

  createdAt: string;
  updatedAt: string;
}

const RANK_GLOW: Record<RankBadge, string> = {
  newcomer:   '#888888',
  regular:    '#AAAAAA',
  rising:     '#00FF88',
  performer:  '#00FFFF',
  artist:     '#AA2DFF',
  headliner:  '#FF2DAA',
  legend:     '#FFD700',
  vip:        '#FFD700',
  sponsor:    '#FF9500',
  moderator:  '#0088FF',
  host:       '#FFFFFF',
};

export function getRankGlow(rank: RankBadge): string {
  return RANK_GLOW[rank] ?? '#888888';
}

export function calculateGlowIntensity(points: number): number {
  if (points < 100)    return 0.2;
  if (points < 500)    return 0.4;
  if (points < 2000)   return 0.6;
  if (points < 10000)  return 0.8;
  return 1.0;
}

export function calculateLevel(points: number): number {
  return Math.floor(Math.sqrt(points / 10)) + 1;
}

export function getRankFromPoints(points: number): RankBadge {
  if (points < 50)     return 'newcomer';
  if (points < 250)    return 'regular';
  if (points < 1000)   return 'rising';
  if (points < 5000)   return 'performer';
  if (points < 15000)  return 'artist';
  if (points < 50000)  return 'headliner';
  return 'legend';
}

/** Generate a BubbleCharacter from an AvatarConfig and user profile */
export function generateBubble(
  userId: string,
  displayName: string,
  avatar: AvatarConfig,
  options: { points?: number; sponsorItems?: string[] } = {},
): BubbleCharacter {
  const points = options.points ?? 0;
  const rank = getRankFromPoints(points);
  const glow = getRankGlow(rank);

  return {
    id: `bubble_${userId}_${Date.now()}`,
    userId,
    displayName,
    avatar,
    rankBadge: rank,
    points,
    level: calculateLevel(points),
    hasCrown: rank === 'legend' || rank === 'host',
    glowColor: glow,
    glowIntensity: calculateGlowIntensity(points),
    nameTagColor: glow,
    currentDance: 'two-step',
    idleAnimation: 'idle-bounce',
    activeEmote: undefined,
    sponsorItems: options.sponsorItems ?? [],
    collectibles: [],
    isInRoom: false,
    isOnStage: false,
    isAudience: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** Save a BubbleCharacter to the platform API */
export async function saveBubble(bubble: BubbleCharacter): Promise<boolean> {
  try {
    const res = await fetch('/api/bubble/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bubble),
    });
    return res.ok;
  } catch {
    return true;
  }
}

/** Load a BubbleCharacter for a user */
export async function loadBubble(userId: string): Promise<BubbleCharacter | null> {
  try {
    const res = await fetch(`/api/bubble/load?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Enter a room — updates bubble's room state */
export function enterRoom(bubble: BubbleCharacter, roomId: string, onStage = false): BubbleCharacter {
  return {
    ...bubble,
    isInRoom: true,
    currentRoomId: roomId,
    isOnStage: onStage,
    isAudience: !onStage,
    updatedAt: new Date().toISOString(),
  };
}

/** Leave a room */
export function leaveRoom(bubble: BubbleCharacter): BubbleCharacter {
  return {
    ...bubble,
    isInRoom: false,
    currentRoomId: undefined,
    isOnStage: false,
    isAudience: false,
    updatedAt: new Date().toISOString(),
  };
}
