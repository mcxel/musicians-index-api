/**
 * MJ Rule proof: human with 1 point displaces top bot.
 *
 * Pure comparator only — no Next path aliases / registries.
 * Run from repo root:
 *   $env:TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}'; pnpm exec ts-node --transpile-only apps/web/src/tests/runCompareRank.mj.test.ts
 */

import {
  buildRankingSlots,
  compareRank,
  isHumanActive,
  sortByRank,
  type RankComparable,
} from '../lib/rankings/compareRank';

type TestCandidate = RankComparable & {
  displayName: string;
  slug: string;
  profileRoute: string;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`[COMPARE_RANK_MJ_FAIL] ${message}`);
}

function runCompareRankMjTest() {
  const topBot: TestCandidate = {
    profileId: 'bot-overall-001',
    kind: 'bot',
    points: 12_000,
    scoreReachedAt: 1,
    displayName: '[BOT] Apex Placeholder',
    slug: 'bot-overall-001',
    profileRoute: '/bots/bot-overall-001',
  };

  const midBot: TestCandidate = {
    profileId: 'bot-overall-002',
    kind: 'bot',
    points: 9_500,
    scoreReachedAt: 2,
    displayName: '[BOT] Runner Up',
    slug: 'bot-overall-002',
    profileRoute: '/bots/bot-overall-002',
  };

  const humanOnePoint: TestCandidate = {
    profileId: 'human-newcomer',
    kind: 'human',
    points: 1,
    scoreReachedAt: Date.now(),
    displayName: 'New Human',
    slug: 'new-human',
    profileRoute: '/performers/new-human',
  };

  const humanZero: TestCandidate = {
    profileId: 'human-idle',
    kind: 'human',
    points: 0,
    scoreReachedAt: 0,
    displayName: 'Idle Human',
    slug: 'idle-human',
    profileRoute: '/performers/idle-human',
  };

  // Pure comparator: 1-pt human beats 12k bot
  assert(compareRank(humanOnePoint, topBot) < 0, 'human with 1 point must sort above top bot');
  assert(compareRank(topBot, humanOnePoint) > 0, 'top bot must sort below 1-pt human');
  assert(isHumanActive(humanOnePoint), '1-pt human is Band 1 active');
  assert(!isHumanActive(humanZero), '0-pt human is not Band 1');
  assert(!isHumanActive(topBot), 'bot is never Band 1');

  // NOT blunt score boost: points stay 1 vs 12000
  assert(humanOnePoint.points === 1, 'must not inflate human score');
  assert(topBot.points === 12_000, 'bot provisional score unchanged');

  const slots = buildRankingSlots([topBot, midBot, humanZero, humanOnePoint], 12);
  assert(slots[0]?.profileId === 'human-newcomer', 'crown slot must be 1-pt human');
  assert(slots[0]?.rank === 1, '1-pt human must be rank #1');
  assert(slots[0]?.kind === 'human', 'crown kind must be human');
  assert(slots[1]?.kind === 'bot', 'band-2 fill starts with bots after sole active human');

  // Tie-break: earlier scoreReachedAt wins among equal points in same band
  const early: TestCandidate = {
    ...humanOnePoint,
    profileId: 'human-early',
    scoreReachedAt: 100,
    slug: 'human-early',
  };
  const late: TestCandidate = {
    ...humanOnePoint,
    profileId: 'human-late',
    scoreReachedAt: 200,
    slug: 'human-late',
  };
  const tied = sortByRank([late, early]);
  assert(tied[0]?.profileId === 'human-early', 'earliest scoreReachedAt wins equal-point ties');

  console.log('[COMPARE_RANK_MJ_ASSERT]', {
    ok: true,
    crown: slots[0]?.profileId,
    crownPoints: slots[0]?.points,
    displacedBot: topBot.profileId,
    top12: slots.map((s) => `${s.rank}:${s.profileId}:${s.kind}:${s.points}`),
  });
}

runCompareRankMjTest();
