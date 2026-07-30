/**
 * MJ Rule proof runner — transpiles compareRank.ts in-process (no path aliases).
 * Usage: node scripts/run-compare-rank-mj.cjs
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const file = path.join(__dirname, '../apps/web/src/lib/rankings/compareRank.ts');
const source = fs.readFileSync(file, 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
});

const mod = { exports: {} };
// eslint-disable-next-line no-new-func
new Function('exports', 'module', 'require', outputText)(mod.exports, mod, require);
const { compareRank, buildRankingSlots, isHumanActive, sortByRank } = mod.exports;

function assert(condition, message) {
  if (!condition) throw new Error(`[COMPARE_RANK_MJ_FAIL] ${message}`);
}

const topBot = {
  profileId: 'bot-overall-001',
  kind: 'bot',
  points: 12000,
  scoreReachedAt: 1,
};
const midBot = {
  profileId: 'bot-overall-002',
  kind: 'bot',
  points: 9500,
  scoreReachedAt: 2,
};
const humanOnePoint = {
  profileId: 'human-newcomer',
  kind: 'human',
  points: 1,
  scoreReachedAt: Date.now(),
};
const humanZero = {
  profileId: 'human-idle',
  kind: 'human',
  points: 0,
  scoreReachedAt: 0,
};

assert(compareRank(humanOnePoint, topBot) < 0, 'human with 1 point must sort above top bot');
assert(compareRank(topBot, humanOnePoint) > 0, 'top bot must sort below 1-pt human');
assert(isHumanActive(humanOnePoint), '1-pt human is Band 1 active');
assert(!isHumanActive(humanZero), '0-pt human is not Band 1');
assert(!isHumanActive(topBot), 'bot is never Band 1');
assert(humanOnePoint.points === 1, 'must not inflate human score');
assert(topBot.points === 12000, 'bot provisional score unchanged');

const slots = buildRankingSlots([topBot, midBot, humanZero, humanOnePoint], 12);
assert(slots[0].profileId === 'human-newcomer', 'crown slot must be 1-pt human');
assert(slots[0].rank === 1, '1-pt human must be rank #1');
assert(slots[0].kind === 'human', 'crown kind must be human');
assert(slots[1].kind === 'bot', 'band-2 fill starts with bots after sole active human');

const early = { ...humanOnePoint, profileId: 'human-early', scoreReachedAt: 100 };
const late = { ...humanOnePoint, profileId: 'human-late', scoreReachedAt: 200 };
const tied = sortByRank([late, early]);
assert(tied[0].profileId === 'human-early', 'earliest scoreReachedAt wins equal-point ties');

console.log('[COMPARE_RANK_MJ_ASSERT]', {
  ok: true,
  crown: slots[0].profileId,
  crownPoints: slots[0].points,
  displacedBot: topBot.profileId,
  top12: slots.map((s) => `${s.rank}:${s.profileId}:${s.kind}:${s.points}`),
});
