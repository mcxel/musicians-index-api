/**
 * FanLoyaltyProfile
 * Derives nightlife-culture identity titles from FanMomentum.
 * NO "Level 38 User" energy here — these read like backstage recognition.
 */

import type { FanMomentum } from './SuperFanMomentumEngine';

export type FanTitle =
  | 'LEGENDARY FAN'
  | 'FOUNDING FAN'
  | 'BIG DONOR'
  | 'FRONT ROW'
  | 'HYPE LEADER'
  | 'DAY ONE'
  | 'VIP DIAMOND'
  | 'BATTLE BOOSTER'
  | 'REGULAR';

export interface FanIdentity {
  title: FanTitle;
  glyph: string;
  color: string;
  description: string;
}

const IDENTITY_MAP: Record<FanTitle, Omit<FanIdentity, 'title'>> = {
  'LEGENDARY FAN':  { glyph: '👑', color: '#FFD700', description: 'Always here. Legendary presence.' },
  'FOUNDING FAN':   { glyph: '🏛️', color: '#00FFFF', description: 'Here since the beginning.' },
  'BIG DONOR':      { glyph: '💸', color: '#00FF88', description: 'Largest tipper in the room.' },
  'FRONT ROW':      { glyph: '🕺', color: '#FF2DAA', description: 'Front row every session.' },
  'HYPE LEADER':    { glyph: '🔥', color: '#FF6B35', description: 'Starts the waves.' },
  'DAY ONE':        { glyph: '⭐', color: '#FFD700', description: 'Original supporter.' },
  'VIP DIAMOND':    { glyph: '💎', color: '#38bdf8', description: 'Diamond member.' },
  'BATTLE BOOSTER': { glyph: '🥊', color: '#AA2DFF', description: 'Fuels the battles.' },
  'REGULAR':        { glyph: '🎶', color: 'rgba(255,255,255,0.5)', description: 'Part of the crowd.' },
};

export function deriveFanTitle(m: FanMomentum): FanTitle {
  if (m.legendaryMoments >= 5 && m.sessionCount >= 10) return 'LEGENDARY FAN';
  if (m.isFoundingFan && m.sessionCount >= 3)           return 'FOUNDING FAN';
  if (m.tipTotalUsd >= 50)                              return 'BIG DONOR';
  if (m.sessionCount >= 8)                              return 'FRONT ROW';
  if (m.messageCount >= 30)                             return 'HYPE LEADER';
  if (m.isFoundingFan)                                  return 'DAY ONE';
  if (m.tipTotalUsd >= 10)                              return 'BATTLE BOOSTER';
  if (m.sessionCount >= 3)                              return 'FRONT ROW';
  return 'REGULAR';
}

export function getFanIdentity(m: FanMomentum): FanIdentity {
  const title = deriveFanTitle(m);
  return { title, ...IDENTITY_MAP[title] };
}

export function getRecognitionLine(m: FanMomentum): string {
  const identity = getFanIdentity(m);
  const parts: string[] = [identity.title];
  if (m.legendaryMoments > 0) parts.push(`${m.legendaryMoments} legendary moment${m.legendaryMoments > 1 ? 's' : ''}`);
  if (m.sessionCount > 1)     parts.push(`${m.sessionCount} sessions`);
  if (m.tipTotalUsd > 0)      parts.push(`$${m.tipTotalUsd.toFixed(0)} tipped`);
  return parts.join(' · ');
}
