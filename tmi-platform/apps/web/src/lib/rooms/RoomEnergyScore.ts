/**
 * RoomEnergyScore
 * Rates a room's "energy" from 0–100 based on viewers, activity, prize, type.
 * Used for: sorting lobby walls, featuring rooms, smart random.
 */

import type { LobbyRoom } from '@/components/live/LiveLobbyWallGrid';

export type EnergyTier = 'cold' | 'warm' | 'hot' | 'blazing';

export type RoomEnergy = {
  score: number;     // 0–100
  tier: EnergyTier;
  label: string;
  color: string;
};

const ENERGY_TIER_COLOR: Record<EnergyTier, string> = {
  cold:    '#4169E1',
  warm:    '#FF8C00',
  hot:     '#FF3B5C',
  blazing: '#FFD700',
};

function tierFromScore(score: number): EnergyTier {
  if (score >= 80) return 'blazing';
  if (score >= 55) return 'hot';
  if (score >= 30) return 'warm';
  return 'cold';
}

export function scoreRoomEnergy(room: LobbyRoom): RoomEnergy {
  let score = 0;

  // Viewers (up to 40 points)
  if (room.viewerCount >= 5000) score += 40;
  else if (room.viewerCount >= 2000) score += 30;
  else if (room.viewerCount >= 1000) score += 20;
  else if (room.viewerCount >= 500) score += 12;
  else if (room.viewerCount >= 100) score += 6;
  else score += 2;

  // Status (up to 20 points)
  if (room.status === 'live') score += 20;
  else if (room.status === 'starting') score += 8;

  // Prize pool (up to 20 points)
  if (room.prizePool) {
    const amount = parseInt(room.prizePool.replace(/[^0-9]/g, '') || '0', 10);
    if (amount >= 5000) score += 20;
    else if (amount >= 2000) score += 15;
    else if (amount >= 1000) score += 10;
    else if (amount >= 500) score += 6;
    else score += 3;
  }

  // Type bonus (up to 20 points)
  const typeBonus: Record<string, number> = {
    battle: 18, challenge: 15, 'mini-cypher': 12, cypher: 14, game: 20, live: 10,
  };
  score += typeBonus[room.type] ?? 8;

  score = Math.min(100, score);
  const tier = tierFromScore(score);

  return {
    score,
    tier,
    color: ENERGY_TIER_COLOR[tier],
    label: tier === 'blazing' ? '🔥 BLAZING' : tier === 'hot' ? '⚡ HOT' : tier === 'warm' ? '🟠 WARM' : '🔵 LIVE',
  };
}

export function sortRoomsByEnergy(rooms: LobbyRoom[]): LobbyRoom[] {
  return [...rooms].sort((a, b) => scoreRoomEnergy(b).score - scoreRoomEnergy(a).score);
}

export function getTopRooms(rooms: LobbyRoom[], count = 4): LobbyRoom[] {
  return sortRoomsByEnergy(rooms).slice(0, count);
}
