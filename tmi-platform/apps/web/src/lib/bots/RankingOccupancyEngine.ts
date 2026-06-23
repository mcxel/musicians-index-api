/**
 * RankingOccupancyEngine — manages ranking seat occupancy (bot vs human).
 *
 * A RankingSeat describes who holds a given rank position in a category.
 * When isProvisional=true, a bot holds the seat and can be displaced by
 * any real user whose XP exceeds the bot's humanTakeoverThreshold (Rule 3).
 *
 * This is a read/compute layer. The canonical data lives in:
 *   - BotAccountRegistry  (bot accounts)
 *   - PerformerRegistry   (real human performers)
 * Rankings are XP-driven; seats are never assigned manually (Rule 3).
 */

import {
  getBotForSeat,
  displaceBotFromSeat,
  type BotAccount,
  type BotTier,
} from './BotAccountRegistry';

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
