/**
 * Server-only sibling to UniversalRankingSnapshot.ts.
 *
 * collectRankCandidates() in the main module is imported directly by client
 * components (Home1CoverPage, OrbitalWheel, Home1Top10DoubleSpreaded) and
 * must stay free of Node-only built-ins. This file merges in real DB users
 * (UserStore, which needs node:crypto) on top of that — import it only from
 * API routes / Server Components, never from a "use client" file.
 */
import { getAllUsers } from '@/lib/auth/UserStore';
import { collectRankCandidates, type RankCandidate } from './UniversalRankingSnapshot';

export function collectRankCandidatesWithDbUsers(): RankCandidate[] {
  const base = collectRankCandidates();
  const knownIds = new Set(base.map((c) => c.profileId));

  const dbUsers = getAllUsers();
  const dbHumans: RankCandidate[] = [];

  for (const u of dbUsers) {
    if (knownIds.has(u.id) || knownIds.has(u.email)) continue;
    const points = u.role === 'admin' ? 100000 : 0;
    if (points <= 0 && u.role !== 'admin') continue;

    dbHumans.push({
      profileId: u.id,
      kind: 'human',
      points,
      scoreReachedAt: u.createdAt,
      displayName: u.displayName || u.email.split('@')[0] || 'User',
      slug: u.id,
      profileRoute: `/profile/${encodeURIComponent(u.id)}`,
      avatarUrl: '/images/tmi-placeholder.jpg',
      genre: u.role === 'admin' ? 'Executive' : 'Performer',
      isLive: false,
    });
  }

  return [...base, ...dbHumans];
}
