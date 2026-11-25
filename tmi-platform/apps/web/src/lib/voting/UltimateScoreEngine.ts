/**
 * UltimateScoreEngine — combine ONLINE / LOCAL (host-reported) / JUDGE channels.
 * Extends CanonicalVotingRuntime tallies; does not replace Battle/Challenge engines.
 *
 * Honesty labels:
 *   ONLINE  = verified digital ballots
 *   LOCAL   = HOST_REPORTED physical tallies (never claimed as verified digital)
 *   JUDGE   = authorized judge scores
 */

export type ScoreChannel = "ONLINE" | "LOCAL" | "JUDGE";

export type ChannelWeights = {
  online: number;
  local: number;
  judge: number;
};

export type ChannelTally = {
  choiceId: string;
  count: number;
};

export type UltimateScoreInput = {
  choiceIds: string[];
  online: ChannelTally[];
  local: ChannelTally[];
  judge: ChannelTally[];
  weights: ChannelWeights;
};

export type UltimateScoreResult = {
  onlineNormalized: Record<string, number>;
  localNormalized: Record<string, number>;
  judgeNormalized: Record<string, number>;
  combined: Record<string, number>;
  weights: ChannelWeights;
  winnerChoiceId: string | null;
  labels: {
    online: "VERIFIED_DIGITAL";
    local: "HOST_REPORTED";
    judge: "AUTHORIZED_JUDGE";
  };
};

const DEFAULT_WEIGHTS: ChannelWeights = { online: 0.5, local: 0.3, judge: 0.2 };

export function normalizeChannelWeights(weights?: Partial<ChannelWeights>): ChannelWeights {
  const w: ChannelWeights = {
    online: weights?.online ?? DEFAULT_WEIGHTS.online,
    local: weights?.local ?? DEFAULT_WEIGHTS.local,
    judge: weights?.judge ?? DEFAULT_WEIGHTS.judge,
  };
  const sum = w.online + w.local + w.judge;
  if (sum <= 0) return { ...DEFAULT_WEIGHTS };
  return {
    online: w.online / sum,
    local: w.local / sum,
    judge: w.judge / sum,
  };
}

function normalizeCounts(
  choiceIds: string[],
  tallies: ChannelTally[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const id of choiceIds) map[id] = 0;
  let total = 0;
  for (const t of tallies) {
    if (!(t.choiceId in map)) continue;
    map[t.choiceId] = (map[t.choiceId] ?? 0) + Math.max(0, t.count);
    total += Math.max(0, t.count);
  }
  if (total === 0) return map;
  for (const id of choiceIds) {
    map[id] = (map[id] ?? 0) / total;
  }
  return map;
}

/**
 * Compute Ultimate Score. Empty channels contribute 0; weights re-normalize over
 * channels that have at least one count so a missing judge panel does not zero the result.
 */
export function computeUltimateScore(input: UltimateScoreInput): UltimateScoreResult {
  const choiceIds = [...input.choiceIds];
  const onlineNormalized = normalizeCounts(choiceIds, input.online);
  const localNormalized = normalizeCounts(choiceIds, input.local);
  const judgeNormalized = normalizeCounts(choiceIds, input.judge);

  const onlineHas = input.online.some((t) => t.count > 0);
  const localHas = input.local.some((t) => t.count > 0);
  const judgeHas = input.judge.some((t) => t.count > 0);

  let weights = normalizeChannelWeights(input.weights);
  const activeSum =
    (onlineHas ? weights.online : 0) +
    (localHas ? weights.local : 0) +
    (judgeHas ? weights.judge : 0);
  if (activeSum > 0) {
    weights = {
      online: onlineHas ? weights.online / activeSum : 0,
      local: localHas ? weights.local / activeSum : 0,
      judge: judgeHas ? weights.judge / activeSum : 0,
    };
  }

  const combined: Record<string, number> = {};
  for (const id of choiceIds) {
    combined[id] =
      (onlineNormalized[id] ?? 0) * weights.online +
      (localNormalized[id] ?? 0) * weights.local +
      (judgeNormalized[id] ?? 0) * weights.judge;
  }

  let winnerChoiceId: string | null = null;
  let top = -1;
  let tie = false;
  for (const id of choiceIds) {
    const score = combined[id] ?? 0;
    if (score > top) {
      top = score;
      winnerChoiceId = id;
      tie = false;
    } else if (score === top && score > 0) {
      tie = true;
    }
  }
  if (tie || top <= 0) winnerChoiceId = null;

  return {
    onlineNormalized,
    localNormalized,
    judgeNormalized,
    combined,
    weights,
    winnerChoiceId,
    labels: {
      online: "VERIFIED_DIGITAL",
      local: "HOST_REPORTED",
      judge: "AUTHORIZED_JUDGE",
    },
  };
}
