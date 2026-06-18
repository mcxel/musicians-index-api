/**
 * BroadcastDirectorEngine v2
 *
 * Implements the Broadcast Preview Canon v2 (Rule 16).
 * Context-aware television broadcast director.
 *
 * Dynamic Broadcast Profiles:
 * - Battle: 80% Audience / 10% Backstage / 10% Host
 * - Cypher: 75% Active / 15% Crowd / 10% Host
 * - Challenge: 85% Active / 10% Crowd / 5% Host
 * - Fan Lobby: 60% Host / 30% Avatar Lounge / 10% Host
 * - World Dance Party: 50% DJ / 30% Dance Floor / 10% Crowd / 10% Host
 */

import { audienceVisibilityEngine, type AudienceAvatar } from './AudienceVisibilityEngine';
import { battleBroadcastStateMachine } from '@/lib/competition/BattleBroadcastStateMachine';

export type RoomType = 'BATTLE' | 'CYPHER' | 'CHALLENGE' | 'FAN_LOBBY' | 'DANCE_PARTY' | 'PERFORMER_LIVE';

export interface BroadcastContext {
  roomType: RoomType;
  activePerformerId?: string;
  audienceCount?: number;
}

export type CameraShotType =
  | 'AudienceView'
  | 'StageView'
  | 'BackstageView'
  | 'DJView'
  | 'HostView'
  | 'CrowdView'
  | 'ReactionView'
  | 'DanceFloorView'
  | 'VIPView'
  | 'OverheadView';

export interface BroadcastShot {
  roomId: string;
  shotType: CameraShotType;
  caption: string;
  featured: AudienceAvatar[];
  hostName?: string;
  generatedAt: number;
}

const SHOT_CAPTIONS: Record<CameraShotType, string> = {
  AudienceView: 'LIVE AUDIENCE',
  StageView: 'MAIN STAGE',
  BackstageView: 'BACKSTAGE ACCESS',
  DJView: 'DJ BOOTH',
  HostView: 'TMI HOST',
  CrowdView: 'CROWD ENERGY',
  ReactionView: 'CROWD REACTION',
  DanceFloorView: 'DANCE FLOOR',
  VIPView: 'VIP SECTION',
  OverheadView: 'ARENA OVERHEAD',
};

const AI_HOSTS = ['Record Ralph', 'Bobby Stanley', 'Arena Announcer', 'Cypher Host'];

const GHOST_NAMES = ['NeonFan', 'BeatRider', 'WaveBreaker', 'CrownWatch', 'PulseHead', 'GrooveBot'];
const GHOST_TIERS: AudienceAvatar['tier'][] = ['fan', 'fan', 'fan', 'supporter', 'vip', 'superfan'];
const GHOST_STATES: AudienceAvatar['state'][] = ['sitting', 'clapping', 'waving', 'dancing', 'reacting'];

function ghostCrowd(roomId: string, count: number): AudienceAvatar[] {
  const seed = roomId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: count }, (_, i) => {
    const h = seed + i * 31;
    return {
      userId: `ghost-${roomId}-${i}`,
      displayName: GHOST_NAMES[h % GHOST_NAMES.length]!,
      avatarImageUrl: '',
      seatId: `ghost-seat-${i}`,
      state: GHOST_STATES[h % GHOST_STATES.length]!,
      tier: GHOST_TIERS[h % GHOST_TIERS.length]!,
      isBot: true,
      joinedAt: Date.now() - (h % 600_000),
      lastReactionAt: i % 3 === 0 ? Date.now() - (h % 12_000) : undefined,
    };
  });
}

function pickFeatured(roomId: string, shotType: CameraShotType): AudienceAvatar[] {
  let pool = audienceVisibilityEngine.getAvatars(roomId);
  if (pool.length === 0) pool = ghostCrowd(roomId, 24);

  switch (shotType) {
    case 'VIPView': return pool.filter((a) => a.tier === 'vip' || a.tier === 'superfan').slice(0, 6);
    case 'ReactionView': return pool.filter((a) => a.lastReactionAt && Date.now() - a.lastReactionAt < 20_000).slice(0, 8);
    case 'DanceFloorView': return pool.filter((a) => a.state === 'dancing').slice(0, 8);
    case 'HostView': return pool.slice(0, 1);
    case 'BackstageView': return pool.slice(0, 3);
    case 'DJView': return pool.slice(0, 5);
    case 'CrowdView':
    case 'AudienceView':
    case 'StageView':
    case 'OverheadView':
    default:
      return pool.slice(0, 24);
  }
}

export function getNextBroadcastShot(roomId: string, context: BroadcastContext = { roomType: 'PERFORMER_LIVE' }): BroadcastShot {
  const roll = Math.random();
  let shotType: CameraShotType;
  let hostName: string | undefined;

  // 1. Context-Aware Profile Resolution
  if (context.roomType === 'BATTLE') {
    const battleState = battleBroadcastStateMachine.getState(roomId)?.state;
    
    // Force specific states based on the Match Engine
    if (battleState === 'SOLO_WAITING') shotType = 'StageView';
    else if (battleState === 'VS_REVEAL' || battleState === 'WINNER_REVEAL') shotType = 'AudienceView';
    else {
      // BATTLE_LIVE / OPPONENT_JOINED profile: 80/10/10
      if (roll < 0.80) shotType = 'AudienceView';
      else if (roll < 0.90) shotType = 'BackstageView';
      else { shotType = 'HostView'; hostName = 'Arena Announcer'; }
    }
  } 
  else if (context.roomType === 'CYPHER') {
    // 75% Active Performer / 15% Crowd/Circle / 10% Host
    if (roll < 0.75) shotType = 'StageView';
    else if (roll < 0.90) shotType = Math.random() > 0.5 ? 'CrowdView' : 'ReactionView';
    else { shotType = 'HostView'; hostName = 'Cypher Host'; }
  }
  else if (context.roomType === 'CHALLENGE') {
    // 85% Active Performer / 10% Crowd / 5% Host
    if (roll < 0.85) shotType = 'StageView';
    else if (roll < 0.95) shotType = 'CrowdView';
    else { shotType = 'HostView'; hostName = 'Record Ralph'; }
  }
  else if (context.roomType === 'FAN_LOBBY') {
    // 60% Host / 30% Avatar Lounge / 10% Host Interjection
    if (roll < 0.60) shotType = 'HostView';
    else if (roll < 0.90) shotType = 'AudienceView';
    else { shotType = 'HostView'; hostName = 'Bobby Stanley'; }
  }
  else if (context.roomType === 'DANCE_PARTY') {
    // 50% DJ / 30% Dance Floor / 10% Crowd / 10% Host
    if (roll < 0.50) shotType = 'DJView';
    else if (roll < 0.80) shotType = 'DanceFloorView';
    else if (roll < 0.90) shotType = 'ReactionView';
    else { shotType = 'HostView'; hostName = 'Record Ralph'; }
  }
  else {
    // PERFORMER_LIVE Default: 70/20/10
    if (roll < 0.70) shotType = 'AudienceView';
    else if (roll < 0.90) shotType = 'BackstageView';
    else { shotType = 'HostView'; hostName = AI_HOSTS[Math.floor(Math.random() * AI_HOSTS.length)]; }
  }

  const featured = pickFeatured(roomId, shotType);
  return {
    roomId,
    shotType,
    caption: hostName ? `${hostName.toUpperCase()} ON MIC` : SHOT_CAPTIONS[shotType],
    featured,
    hostName,
    generatedAt: Date.now()
  };
}

/**
 * Subscribe to an automatically rotating broadcast camera for a room.
 * Fires immediately, then cuts to a new shot every `intervalMs`.
 * Returns an unsubscribe function.
 */
export function subscribeBroadcastDirector(
  roomId: string,
  context: BroadcastContext,
  onShot: (shot: BroadcastShot) => void,
  intervalMs = 4500,
): () => void {
  onShot(getNextBroadcastShot(roomId, context));
  const timer = setInterval(() => onShot(getNextBroadcastShot(roomId, context)), intervalMs);
  return () => clearInterval(timer);
}