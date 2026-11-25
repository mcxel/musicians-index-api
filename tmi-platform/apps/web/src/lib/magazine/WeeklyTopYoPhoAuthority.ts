/**
 * WeeklyTopYoPhoAuthority.ts — the Weekly Top YoPho Cards RANDOM page authority.
 *
 * FINAL MAGAZINE ADDITION (2026-10-31, owner-locked): a RANDOM-page subtype
 * (Magazine family = RANDOM, page type = WEEKLY TOP YOPHO CARDS). P→N→R is
 * unchanged — this page only ever occupies a RANDOM position.
 *
 * Ranking law: real weekly likes → adaptive qualification → dynamic weekly
 * ranking. No fake/bot/purchased engagement. The qualification threshold is
 * ADAPTIVE — it follows actual weekly engagement volume so a slow week still
 * fills, but never drops below a meaningful quality floor.
 *
 * HONEST-EMPTY LAW: there is currently no durable real YoPho "like" data
 * source (PublishedYoPhoCard carries no engagement fields and no createdAt
 * weekly window). This module therefore returns an empty qualifying set until
 * a real engagement signal exists — it never fabricates likes to fill a page.
 * `computeWeeklyTopYoPho` accepts an injectable engagement-signal input so the
 * composition/certification layer can prove the ranking behavior; production
 * reads stay honest until a canonical like authority is wired.
 */

import { listYoPhoCards } from "@/lib/yopho/YoPhoCardStore";
import type { PublishedYoPhoCard } from "@/lib/yopho/YoPhoCardRegistry";

/** One real engagement signal for a YoPho Card in the current weekly window. */
export interface YoPhoWeeklyEngagementSignal {
  cardId: string;
  /** Real human likes in the current weekly window (bots/paid excluded). */
  weeklyLikes: number;
}

export interface WeeklyTopYoPhoEntry {
  cardId: string;
  rank: number;
  weeklyLikes: number;
  title: string;
  creatorDisplayName: string;
  slug?: string;
  artworkUrl: string | null;
  /** Canonical card destination — never a Magazine-only fake player. */
  href: string;
}

/** The quality floor: a card must clear this regardless of how slow the week is. */
export const WEEKLY_YOPHO_MIN_LIKES_FLOOR = 1;

/**
 * Adaptive qualification threshold. Follows weekly engagement but never drops
 * below the floor, and never rises above the 90th-percentile-driven cap that
 * would empty the page on a strong week.
 */
export function resolveWeeklyYoPhoThreshold(signals: YoPhoWeeklyEngagementSignal[]): number {
  const likes = signals.map((s) => s.weeklyLikes).filter((n) => n > 0).sort((a, b) => a - b);
  if (likes.length === 0) return WEEKLY_YOPHO_MIN_LIKES_FLOOR;
  const median = likes[Math.floor(likes.length / 2)]!;
  // Adaptive: threshold tracks the median of genuinely-liked cards, floored.
  return Math.max(WEEKLY_YOPHO_MIN_LIKES_FLOOR, Math.min(median, likes[likes.length - 1]!));
}

/**
 * Compute the current weekly Top YoPho set. Only cards meeting the adaptive
 * threshold qualify; ranked by real weekly likes desc, tie-break by cardId
 * asc for determinism. Returns [] when nothing genuinely qualifies.
 */
export function computeWeeklyTopYoPho(
  signals: YoPhoWeeklyEngagementSignal[],
  cards: PublishedYoPhoCard[],
  limit = 12,
): WeeklyTopYoPhoEntry[] {
  const byCardId = new Map(cards.map((c) => [c.cardId, c]));
  const threshold = resolveWeeklyYoPhoThreshold(signals);

  const qualified = signals
    .filter((s) => byCardId.has(s.cardId) && s.weeklyLikes >= threshold)
    .sort((a, b) => b.weeklyLikes - a.weeklyLikes || a.cardId.localeCompare(b.cardId));

  return qualified.slice(0, Math.max(1, limit)).map((s, i) => {
    const card = byCardId.get(s.cardId)!;
    return {
      cardId: card.cardId,
      rank: i + 1,
      weeklyLikes: s.weeklyLikes,
      title: card.moodTitle ?? card.editionTitle ?? card.displayName,
      creatorDisplayName: card.displayName,
      slug: card.slug,
      artworkUrl: card.subjectUrl ?? card.customBgUrl ?? null,
      href: `/yopho/${card.slug ?? card.cardId}`,
    };
  });
}

/**
 * Production read — honest empty until a real engagement authority exists.
 * The Weekly Top YoPho Cards page shows fewer cards rather than fabricated
 * engagement. Returns [] today; never invents likes.
 */
export async function listWeeklyTopYoPhoCards(limit = 12): Promise<WeeklyTopYoPhoEntry[]> {
  // No canonical YoPho-like authority exists yet. Honest empty — never fake.
  void limit;
  return [];
}
