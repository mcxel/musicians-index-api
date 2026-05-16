/**
 * LiveReactionEngine
 * Live vote, hype, clout, and support signals during live rooms.
 * Distinct from reactionEngine.ts (crowd meter keyed by venueSlug for UI).
 * This engine tracks explicit fan interaction signals for scoring and rewards.
 */

import { loopFanVote } from "@/lib/social/SocialLoopEngine";
import type { FanActivityActor } from "@/lib/social/FanActivityFeedEngine";
import { battleInterestEngine } from '@/lib/learning/BattleInterestEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';
import { platformLearningCore } from '@/lib/learning/PlatformLearningCore';

export type LiveVoteTarget = {
  targetId: string;  // performerId or contestEntryId
  targetLabel: string;
};

export type LiveSignalType = "vote" | "hype" | "clout" | "support";

export type LiveReactionSignal = {
  signalId: string;
  roomId: string;
  fanId: string;
  signalType: LiveSignalType;
  targetId: string;
  targetLabel: string;
  weight: number;
  createdAtMs: number;
};

export type LiveVoteRecord = {
  voteId: string;
  roomId: string;
  fanId: string;
  targetId: string;
  targetLabel: string;
  createdAtMs: number;
};

export type LiveReactionSnapshot = {
  roomId: string;
  votesByTarget: Record<string, number>;
  hypeByTarget: Record<string, number>;
  cloutByTarget: Record<string, number>;
  supportByTarget: Record<string, number>;
  totalSignals: number;
  leadingTargetId: string | null;
  leadingTargetVotes: number;
  updatedAtMs: number;
};

const SIGNAL_WEIGHT: Record<LiveSignalType, number> = {
  vote: 10,
  clout: 4,
  hype: 2,
  support: 1,
};

// --- in-memory stores ---
const signals: Map<string, LiveReactionSignal[]> = new Map(); // keyed by roomId
const votes: Map<string, LiveVoteRecord[]> = new Map();        // keyed by roomId
let signalCounter = 0;
let voteCounter = 0;

function getRoomSignals(roomId: string): LiveReactionSignal[] {
  if (!signals.has(roomId)) signals.set(roomId, []);
  return signals.get(roomId)!;
}

function getRoomVotes(roomId: string): LiveVoteRecord[] {
  if (!votes.has(roomId)) votes.set(roomId, []);
  return votes.get(roomId)!;
}

// --- Write API ---

export function castLiveVote(
  roomId: string,
  fanId: string,
  target: LiveVoteTarget,
  actor?: FanActivityActor,
): LiveVoteRecord {
  const roomVotes = getRoomVotes(roomId);

  // One vote per fan per room — replace previous
  const existingIdx = roomVotes.findIndex((v) => v.fanId === fanId);
  if (existingIdx !== -1) roomVotes.splice(existingIdx, 1);

  const record: LiveVoteRecord = {
    voteId: `live-vote-${++voteCounter}`,
    roomId,
    fanId,
    targetId: target.targetId,
    targetLabel: target.targetLabel,
    createdAtMs: Date.now(),
  };
  roomVotes.push(record);

  // Record signal
  addLiveSignal(roomId, fanId, "vote", target);

  // Bridge to social loop
  if (actor) {
    loopFanVote(actor, record.voteId, `vote:${target.targetLabel}`);
  }

  return record;
}

function addLiveSignal(
  roomId: string,
  fanId: string,
  signalType: LiveSignalType,
  target: LiveVoteTarget,
): LiveReactionSignal {
  const battleSignal = battleInterestEngine.getBattleSignals(30).find((item) => item.battleId === roomId);
  const baseWeight = SIGNAL_WEIGHT[signalType];
  const requestedWeight = baseWeight + Math.round((battleSignal?.hypeScore ?? 0) / 25);
  const mutation = applySafeLearningMutation({
    engine: 'LiveReactionEngine',
    targetId: roomId,
    metric: `${signalType}-weight`,
    beforeValue: baseWeight,
    requestedValue: requestedWeight,
    minValue: 1,
    maxValue: 20,
    confidence: battleSignal ? 0.73 : 0.5,
    reason: 'reaction weighting adapts from battle momentum and participation',
  });

  const signal: LiveReactionSignal = {
    signalId: `live-signal-${++signalCounter}`,
    roomId,
    fanId,
    signalType,
    targetId: target.targetId,
    targetLabel: target.targetLabel,
    weight: mutation.appliedValue,
    createdAtMs: Date.now(),
  };
  getRoomSignals(roomId).push(signal);

  platformLearningCore.ingestEvent({
    type: signalType === 'vote' ? 'vote' : signalType === 'hype' ? 'emote' : signalType === 'support' ? 'tip' : 'chat',
    userId: fanId,
    route: roomId,
    targetId: target.targetId,
    value: mutation.appliedValue,
    context: {
      signalType,
      targetLabel: target.targetLabel,
      learnedWeight: mutation.appliedValue,
    },
  });

  return signal;
}

export function addLiveHype(
  roomId: string,
  fanId: string,
  target: LiveVoteTarget,
): LiveReactionSignal {
  return addLiveSignal(roomId, fanId, "hype", target);
}

export function addLiveClout(
  roomId: string,
  fanId: string,
  target: LiveVoteTarget,
): LiveReactionSignal {
  return addLiveSignal(roomId, fanId, "clout", target);
}

export function addLiveSupport(
  roomId: string,
  fanId: string,
  target: LiveVoteTarget,
): LiveReactionSignal {
  return addLiveSignal(roomId, fanId, "support", target);
}

// --- Read API ---

export function getLiveReactionSnapshot(roomId: string): LiveReactionSnapshot {
  const roomSignals = getRoomSignals(roomId);
  const roomVotes = getRoomVotes(roomId);

  const votesByTarget: Record<string, number> = {};
  for (const v of roomVotes) {
    votesByTarget[v.targetId] = (votesByTarget[v.targetId] ?? 0) + 1;
  }

  const hypeByTarget: Record<string, number> = {};
  const cloutByTarget: Record<string, number> = {};
  const supportByTarget: Record<string, number> = {};

  for (const s of roomSignals) {
    if (s.signalType === "hype") {
      hypeByTarget[s.targetId] = (hypeByTarget[s.targetId] ?? 0) + 1;
    } else if (s.signalType === "clout") {
      cloutByTarget[s.targetId] = (cloutByTarget[s.targetId] ?? 0) + 1;
    } else if (s.signalType === "support") {
      supportByTarget[s.targetId] = (supportByTarget[s.targetId] ?? 0) + 1;
    }
  }

  let leadingTargetId: string | null = null;
  let leadingTargetVotes = 0;
  for (const [id, count] of Object.entries(votesByTarget)) {
    if (count > leadingTargetVotes) {
      leadingTargetVotes = count;
      leadingTargetId = id;
    }
  }

  return {
    roomId,
    votesByTarget,
    hypeByTarget,
    cloutByTarget,
    supportByTarget,
    totalSignals: roomSignals.length,
    leadingTargetId,
    leadingTargetVotes,
    updatedAtMs: Date.now(),
  };
}

export function getFanVoteInRoom(roomId: string, fanId: string): LiveVoteRecord | undefined {
  return getRoomVotes(roomId).find((v) => v.fanId === fanId);
}

export function getRoomVoteCount(roomId: string, targetId: string): number {
  return getRoomVotes(roomId).filter((v) => v.targetId === targetId).length;
}
