/**
 * UniversalRankingSnapshot — publishes Top-N ranked slots via MJ Rule compareRank.
 *
 * Audit notes (assembly, not redesign):
 * - FanPointLedgerEngine: fan wallet audit trail (earned/spent) — not crown ranking source
 * - GET /api/rankings: Prisma UserStats xp>0 — real humans only, no bot fill
 * - RankingOccupancyEngine + BotAccountRegistry: provisional bot seats (threshold model)
 * - ChampionshipYearlyEngine: weekly/monthly/yearly belts — separate competition lane
 * - /api/homepage/charts: top10 proxy + winnerEntries fallback
 * - OrbitalWheel / Home1CoverPage orbit: consumers of THIS snapshot
 *
 * This publisher is the single sync point for Orbital Top 12 + Home 1/1-2 ranking rails.
 * Does NOT claim Universal Presence Engine or full analytics taxonomy.
 */

import {
  buildRankingSlots as buildRankingSlotsPure,
  compareRank,
  sortByRank,
  type RankComparable,
  type RankKind,
} from './compareRank';
import { rankingEvents } from './RankingEvents';
import { PERFORMER_REGISTRY } from '@/lib/performers/PerformerRegistry';
import { getActiveBots } from '@/lib/bots/BotAccountRegistry';

export const ORBITAL_TOP_N = 12;

export interface RankCandidate extends RankComparable {
  displayName: string;
  slug: string;
  profileRoute: string;
  avatarUrl?: string;
  genre?: string;
  isLive?: boolean;
  motionUrl?: string;
}

export interface RankSlot extends RankCandidate {
  rank: number;
}

export interface UniversalRankingSnapshot {
  publishedAt: number;
  limit: number;
  slots: RankSlot[];
  crownProfileId: string | null;
}

type SnapshotListener = (snapshot: UniversalRankingSnapshot) => void;

let currentSnapshot: UniversalRankingSnapshot = {
  publishedAt: 0,
  limit: ORBITAL_TOP_N,
  slots: [],
  crownProfileId: null,
};

const listeners = new Set<SnapshotListener>();

/** In-memory overlay for live human scores (tests / ledger hooks). Never fakes XP. */
const humanScoreOverlay = new Map<string, { points: number; scoreReachedAt: number }>();

export function setHumanRankPoints(
  profileId: string,
  points: number,
  scoreReachedAt: number = Date.now(),
): void {
  if (points <= 0) {
    humanScoreOverlay.delete(profileId);
  } else {
    humanScoreOverlay.set(profileId, { points, scoreReachedAt });
  }
}

export function clearHumanRankPoints(profileId?: string): void {
  if (profileId) humanScoreOverlay.delete(profileId);
  else humanScoreOverlay.clear();
}

/**
 * Delta-based sibling to setHumanRankPoints() for callers that award XP in
 * increments (submissions, fan-loop completion, referrals, ...) rather than
 * publishing an absolute total. Operates on any canonical profileId (DB user,
 * performer, or registry entry).
 */
export function addHumanRankPoints(profileId: string, delta: number): void {
  if (delta === 0 || !profileId) return;
  const base = PERFORMER_REGISTRY.find((p) => p.id === profileId)?.xp ?? 0;
  const current = humanScoreOverlay.get(profileId)?.points ?? base;
  setHumanRankPoints(profileId, current + delta);
}

function botScoreReachedAt(createdAt: string): number {
  const parsed = Date.parse(createdAt);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

/**
 * Build registry-backed candidates.
 * Humans: PerformerRegistry (+ optional overlay points, + overlay-only profiles).
 * Bots: BotAccountRegistry ACTIVE seats (fill band).
 *
 * Deliberately client-safe: this module is imported directly by client
 * components (Home1CoverPage, OrbitalWheel, Home1Top10DoubleSpreaded), so it
 * must never statically import anything that pulls in Node-only built-ins
 * (e.g. UserStore's node:crypto) — that breaks the client webpack bundle.
 * DB-user-merged candidates live in UniversalRankingSnapshot.server.ts,
 * for server-only callers (API routes / Server Components) only.
 */
export function collectRankCandidates(): RankCandidate[] {
  const registryIds = new Set<string>();

  const registryHumans: RankCandidate[] = PERFORMER_REGISTRY.map((p) => {
    registryIds.add(p.id);
    if (p.slug) registryIds.add(p.slug);

    const overlay = humanScoreOverlay.get(p.id);
    const points = overlay?.points ?? p.xp;
    const scoreReachedAt =
      overlay?.scoreReachedAt ??
      (p.crownSince ? Date.parse(p.crownSince) : Number.MAX_SAFE_INTEGER - Math.min(p.xp, 1_000_000_000));

    return {
      profileId: p.id,
      kind: 'human' as RankKind,
      points,
      scoreReachedAt: Number.isFinite(scoreReachedAt) ? scoreReachedAt : Number.MAX_SAFE_INTEGER,
      displayName: p.name,
      slug: p.slug,
      profileRoute: p.profileRoute || `/performers/${p.slug}`,
      avatarUrl: p.profileImageUrl || '/images/tmi-placeholder.jpg',
      genre: p.category,
      isLive: Boolean(p.isLive),
      motionUrl: p.introVideoUrl ?? p.motionPosterUrl,
    };
  });

  const dbHumans: RankCandidate[] = [];

  // Include any overlay-only human profiles (pure in-memory Map — client-safe).
  // DB-registered users are merged in separately by collectRankCandidatesWithDbUsers()
  // (UniversalRankingSnapshot.server.ts, server-only callers).
  for (const [profileId, overlayData] of humanScoreOverlay.entries()) {
    if (registryIds.has(profileId)) continue;
    dbHumans.push({
      profileId,
      kind: 'human' as RankKind,
      points: overlayData.points,
      scoreReachedAt: overlayData.scoreReachedAt,
      displayName: profileId.includes('@') ? profileId.split('@')[0]! : profileId,
      slug: profileId,
      profileRoute: `/profile/${encodeURIComponent(profileId)}`,
      avatarUrl: '/images/tmi-placeholder.jpg',
      genre: 'Performer',
      isLive: false,
    });
  }

  const bots: RankCandidate[] = getActiveBots().map((b) => ({
    profileId: b.id,
    kind: 'bot' as RankKind,
    points: b.provisionalScore,
    scoreReachedAt: botScoreReachedAt(b.createdAt),
    displayName: `[BOT] ${b.displayName}`,
    slug: b.slug,
    profileRoute: b.profileRoute || `/bots/${b.slug}`,
    avatarUrl: b.avatarUrl || '/images/tmi-placeholder.jpg',
    genre: b.genres[0] ?? 'All Genres',
    isLive: false,
  }));

  return [...registryHumans, ...dbHumans, ...bots];
}

/**
 * Pure builder — unit-testable without registries.
 * Band 1: human active; Band 2: remaining filled by bots/placeholders (already sorted via compareRank).
 */
export function buildRankingSlots(
  candidates: readonly RankCandidate[],
  limit: number = ORBITAL_TOP_N,
): RankSlot[] {
  return buildRankingSlotsPure(candidates, limit);
}

function emitDiff(previous: UniversalRankingSnapshot, next: UniversalRankingSnapshot): void {
  const prevById = new Map(previous.slots.map((s) => [s.profileId, s]));
  const nextById = new Map(next.slots.map((s) => [s.profileId, s]));

  for (const slot of next.slots) {
    const prior = prevById.get(slot.profileId);
    if (!prior) {
      rankingEvents.emit('RANK_ENTERED', {
        profileId: slot.profileId,
        rank: slot.rank,
        points: slot.points,
        kind: slot.kind,
      });
    } else if (prior.rank !== slot.rank) {
      rankingEvents.emit('RANK_MOVED', {
        profileId: slot.profileId,
        fromRank: prior.rank,
        toRank: slot.rank,
        points: slot.points,
        kind: slot.kind,
      });
    }
  }

  for (const slot of previous.slots) {
    if (!nextById.has(slot.profileId)) {
      rankingEvents.emit('RANK_EXITED', {
        profileId: slot.profileId,
        previousRank: slot.rank,
        kind: slot.kind,
      });
    }
  }

  if (previous.crownProfileId !== next.crownProfileId) {
    const crown = next.slots[0] ?? null;
    rankingEvents.emit('ORBITAL_CROWN_CHANGED', {
      previousCrownProfileId: previous.crownProfileId,
      crownProfileId: next.crownProfileId,
      crownDisplayName: crown?.displayName ?? null,
      crownProfileRoute: crown?.profileRoute ?? null,
    });
  }
}

function slotsSignature(slots: RankSlot[]): string {
  return slots.map((s) => `${s.rank}:${s.profileId}:${s.points}:${s.kind}`).join('|');
}

export function publishUniversalRankingSnapshot(
  candidates?: readonly RankCandidate[],
  limit: number = ORBITAL_TOP_N,
): UniversalRankingSnapshot {
  const pool = candidates ?? collectRankCandidates();
  const slots = buildRankingSlots(pool, limit);
  const next: UniversalRankingSnapshot = {
    publishedAt: Date.now(),
    limit,
    slots,
    crownProfileId: slots[0]?.profileId ?? null,
  };

  const previous = currentSnapshot;
  const unchanged =
    previous.publishedAt > 0 &&
    previous.crownProfileId === next.crownProfileId &&
    slotsSignature(previous.slots) === slotsSignature(next.slots);

  currentSnapshot = next;
  if (!unchanged) {
    emitDiff(previous, next);
    for (const listener of listeners) {
      try {
        listener(next);
      } catch {
        // Subscriber errors must not break publish
      }
    }
  }

  return next;
}

export function getUniversalRankingSnapshot(): UniversalRankingSnapshot {
  if (currentSnapshot.publishedAt === 0) {
    return publishUniversalRankingSnapshot();
  }
  return currentSnapshot;
}

export function subscribeUniversalRanking(
  listener: SnapshotListener,
  options?: { emitCurrent?: boolean },
): () => void {
  listeners.add(listener);
  if (options?.emitCurrent !== false) {
    listener(getUniversalRankingSnapshot());
  }
  return () => {
    listeners.delete(listener);
  };
}

/** Map snapshot slots for Orbital Wheel / Home orbit UI. */
export function getOrbitalTopSlots(limit: number = ORBITAL_TOP_N): RankSlot[] {
  const snap = getUniversalRankingSnapshot();
  if (snap.slots.length === 0) {
    return publishUniversalRankingSnapshot(undefined, Math.max(limit, ORBITAL_TOP_N)).slots.slice(0, limit);
  }
  return snap.slots.slice(0, limit);
}

/** Test helper — resets in-memory state without touching registries. */
export function __resetUniversalRankingForTests(): void {
  humanScoreOverlay.clear();
  currentSnapshot = {
    publishedAt: 0,
    limit: ORBITAL_TOP_N,
    slots: [],
    crownProfileId: null,
  };
  listeners.clear();
}

// Re-export comparator for consumers that only need the policy
export { compareRank, sortByRank };
