/**
 * RankingOccupancyEngine — manages ranking seat occupancy (bot vs human).
 *
 * MJ Rule (Human-over-Bot): humans with points > 0 ALWAYS rank above bots,
 * then points desc, then earliest scoreReachedAt — see compareRank.ts.
 * Legacy resolveSeat still supports per-seat bot placeholders; prefer
 * resolveTopSeatsMj / UniversalRankingSnapshot for Orbital + Home sync.
 *
 * This is a read/compute layer. The canonical data lives in:
 *   - BotAccountRegistry  (bot accounts)
 *   - PerformerRegistry   (real human performers)
 * Rankings are XP-driven; seats are never assigned manually (Rule 3).
 */

import {
  getBotForSeat,
  getActiveBots,
  displaceBotFromSeat,
  type BotAccount,
} from './BotAccountRegistry';
import { sortByRank, type RankKind } from '@/lib/rankings/compareRank';

export type TierName = 'FREE' | 'PRO' | 'RUBY' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface RankedEntity {
  type: 'BOT' | 'HUMAN';
  id: string;
  displayName: string;
  /** '[BOT]' prefix is always appended on render for type==='BOT' */
  score: number;
  tier: TierName;
  profileRoute: string;
  avatarUrl?: string;
  genres: string[];
}

export interface RankingSeat {
  category: string;
  position: number;
  occupant: RankedEntity;
  /** true when a bot is holding this seat provisionally */
  isProvisional: boolean;
}

function botToEntity(bot: BotAccount): RankedEntity {
  return {
    type: 'BOT',
    id: bot.id,
    displayName: `[BOT] ${bot.displayName}`,
    score: bot.provisionalScore,
    tier: bot.tier as TierName,
    profileRoute: bot.profileRoute,
    avatarUrl: bot.avatarUrl,
    genres: bot.genres,
  };
}

/**
 * Returns the current seat occupant for a category+position.
 * If a real human performer exists with sufficient XP, they own the seat.
 * Otherwise the provisional bot placeholder holds it.
 *
 * humanPerformers should come from computeRanks() in PerformerRegistry —
 * pass the relevant ranked slice here.
 */
export function resolveSeat(
  category: string,
  position: number,
  humanPerformers: Array<{
    id: string;
    displayName: string;
    xp: number;
    tier: TierName;
    profileRoute?: string;
    avatarUrl?: string;
    genres?: string[];
  }>
): RankingSeat {
  const humanAtPosition = humanPerformers[position - 1];

  const bot = getBotForSeat(category, position);

  if (!humanAtPosition) {
    // No real performer at this position — bot holds the seat
    if (bot) {
      return { category, position, occupant: botToEntity(bot), isProvisional: true };
    }
    // No bot either — seat is empty (honest empty state per Rule 20)
    return {
      category,
      position,
      occupant: {
        type: 'HUMAN',
        id: `empty-${category}-${position}`,
        displayName: 'Open Seat',
        score: 0,
        tier: 'FREE',
        profileRoute: `/performers?genre=${category}`,
        genres: [category],
      },
      isProvisional: false,
    };
  }

  // Real human at this position — check if they beat the bot threshold
  if (bot && humanAtPosition.xp >= bot.humanTakeoverThreshold) {
    displaceBotFromSeat(bot.id, humanAtPosition.id);
  }

  return {
    category,
    position,
    occupant: {
      type: 'HUMAN',
      id: humanAtPosition.id,
      displayName: humanAtPosition.displayName,
      score: humanAtPosition.xp,
      tier: humanAtPosition.tier,
      profileRoute: humanAtPosition.profileRoute ?? `/performers/${humanAtPosition.id}`,
      avatarUrl: humanAtPosition.avatarUrl,
      genres: humanAtPosition.genres ?? [],
    },
    isProvisional: false,
  };
}

/**
 * Resolves the top-N seats for a category.
 * Pass the full ranked performer list (highest XP first).
 * @deprecated Prefer resolveTopSeatsMj (Human-over-Bot / MJ Rule).
 */
export function resolveTopSeats(
  category: string,
  count: number,
  humanPerformers: Parameters<typeof resolveSeat>[2]
): RankingSeat[] {
  return Array.from({ length: count }, (_, i) =>
    resolveSeat(category, i + 1, humanPerformers)
  );
}

/**
 * MJ Rule Top-N: active humans (points > 0) fill first, then bots fill remaining.
 * Any human with 1 point outranks every bot regardless of provisionalScore.
 */
export function resolveTopSeatsMj(
  category: string,
  count: number,
  humanPerformers: Parameters<typeof resolveSeat>[2],
): RankingSeat[] {
  type SeatCandidate = {
    profileId: string;
    kind: RankKind;
    points: number;
    scoreReachedAt: number;
    entity: RankedEntity;
  };

  const humans: SeatCandidate[] = humanPerformers
    .filter((h) => h.xp > 0)
    .map((h, index) => ({
      profileId: h.id,
      kind: 'human' as RankKind,
      points: h.xp,
      scoreReachedAt: index,
      entity: {
        type: 'HUMAN' as const,
        id: h.id,
        displayName: h.displayName,
        score: h.xp,
        tier: h.tier,
        profileRoute: h.profileRoute ?? `/performers/${h.id}`,
        avatarUrl: h.avatarUrl,
        genres: h.genres ?? [],
      },
    }));

  const bots: SeatCandidate[] = getActiveBots()
    .filter((b) => category === 'overall' || b.assignments.some((a) => a.category === category))
    .map((b) => ({
      profileId: b.id,
      kind: 'bot' as RankKind,
      points: b.provisionalScore,
      scoreReachedAt: Date.parse(b.createdAt) || Number.MAX_SAFE_INTEGER,
      entity: botToEntity(b),
    }));

  return sortByRank([...humans, ...bots])
    .slice(0, count)
    .map((entry, i) => ({
      category,
      position: i + 1,
      occupant: entry.entity,
      isProvisional: entry.kind === 'bot',
    }));
}

/** All ranking categories the engine recognises */
export const RANKING_CATEGORIES = [
  'overall',
  'hip-hop',
  'rnb',
  'pop',
  'rock',
  'country',
  'gospel',
  'edm',
  'jazz',
  'latin',
  'comedy',
  'dance',
  'producer',
] as const;

export type RankingCategory = (typeof RANKING_CATEGORIES)[number];
