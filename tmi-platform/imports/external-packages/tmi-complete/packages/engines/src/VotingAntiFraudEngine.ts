/**
 * VotingAntiFraudEngine.ts
 * Purpose: Anti-fraud voting gates, cooldowns, account verification, anomaly detection.
 * Placement: packages/engines/src/VotingAntiFraudEngine.ts
 *            Import via @tmi/engines/VotingAntiFraudEngine
 * Depends on: TierEngine
 */

import { Tier, TIER_ORDER } from './TierEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VoteType =
  | 'AUDIENCE_VOTE'          // regular event vote
  | 'PREMIUM_VOTE'           // costs points, extra weight
  | 'JUDGE_SCORE'            // panel judge
  | 'CROWD_REACTION_VOTE'    // emote-based crowd sentiment
  | 'GAME_SHOW_VOTE';        // Deal vs Feud / other game show

export interface Vote {
  id: string;
  eventId: string;
  voterId: string;
  targetId: string;          // performer/team being voted for
  voteType: VoteType;
  weight: number;            // 1 for FREE, up to 10 for DIAMOND
  timestamp: Date;
  sessionId: string;
  deviceFingerprint: string;
  ipHash: string;            // hashed for privacy
  tier: Tier;
}

export interface VoterProfile {
  userId: string;
  tier: Tier;
  accountAgeDays: number;
  deviceFingerprints: string[];     // known devices
  ipHashes: string[];               // known IP hashes
  totalVotesCast: number;
  votesThisEvent: number;
  lastVoteAt?: Date;
  fraudScore: number;               // 0–100; 80+ = flagged
  isSuspended: boolean;
  suspensionReason?: string;
}

export interface VoteResult {
  eventId: string;
  targetId: string;
  rawVotes: number;
  weightedVotes: number;
  uniqueVoters: number;
  fraudAdjustedVotes: number;
  detectedAnomalies: AnomalyFlag[];
}

export type AnomalyFlag =
  | 'VELOCITY_SPIKE'         // sudden burst of votes
  | 'DEVICE_CLUSTER'         // many votes from same device
  | 'IP_CLUSTER'             // many votes from same IP
  | 'NEW_ACCOUNT_FLOOD'      // surge of new accounts voting
  | 'COORDINATED_VOTING'     // statistical pattern of coordination
  | 'IMPOSSIBLE_TIMING'      // votes faster than humanly possible
  | 'SUSPICIOUS_WEIGHT';     // premium votes from suspicious accounts

// ─── Fraud Score Weights ──────────────────────────────────────────────────────

export const ANOMALY_WEIGHTS: Record<AnomalyFlag, number> = {
  VELOCITY_SPIKE:       15,
  DEVICE_CLUSTER:       25,
  IP_CLUSTER:           20,
  NEW_ACCOUNT_FLOOD:    20,
  COORDINATED_VOTING:   30,
  IMPOSSIBLE_TIMING:    40,
  SUSPICIOUS_WEIGHT:    20,
};

// ─── Config ───────────────────────────────────────────────────────────────────

export interface VotingConfig {
  cooldownMs: number;            // min ms between votes from same user
  maxVotesPerEvent: number;      // per user per event
  minAccountAgeDays: number;     // account must be X days old
  velocityWindowMs: number;      // window for velocity check
  velocityThreshold: number;     // max votes in velocityWindow globally
  deviceLimit: number;           // max votes from same device fingerprint
  ipLimit: number;               // max votes from same IP hash
  fraudScoreThreshold: number;   // above this = auto-flag
}

export const VOTING_CONFIGS: Record<VoteType, VotingConfig> = {
  AUDIENCE_VOTE: {
    cooldownMs: 5_000,
    maxVotesPerEvent: 5,
    minAccountAgeDays: 3,
    velocityWindowMs: 60_000,
    velocityThreshold: 100,
    deviceLimit: 3,
    ipLimit: 5,
    fraudScoreThreshold: 70,
  },
  PREMIUM_VOTE: {
    cooldownMs: 10_000,
    maxVotesPerEvent: 10,
    minAccountAgeDays: 7,
    velocityWindowMs: 60_000,
    velocityThreshold: 50,
    deviceLimit: 2,
    ipLimit: 3,
    fraudScoreThreshold: 60,
  },
  JUDGE_SCORE: {
    cooldownMs: 0,
    maxVotesPerEvent: 1,
    minAccountAgeDays: 0,
    velocityWindowMs: 0,
    velocityThreshold: 999,
    deviceLimit: 1,
    ipLimit: 1,
    fraudScoreThreshold: 90,
  },
  CROWD_REACTION_VOTE: {
    cooldownMs: 1_000,
    maxVotesPerEvent: 999,
    minAccountAgeDays: 0,
    velocityWindowMs: 10_000,
    velocityThreshold: 1_000,
    deviceLimit: 999,
    ipLimit: 999,
    fraudScoreThreshold: 80,
  },
  GAME_SHOW_VOTE: {
    cooldownMs: 3_000,
    maxVotesPerEvent: 1,
    minAccountAgeDays: 1,
    velocityWindowMs: 30_000,
    velocityThreshold: 200,
    deviceLimit: 2,
    ipLimit: 4,
    fraudScoreThreshold: 70,
  },
};

// ─── Vote Weight by Tier ──────────────────────────────────────────────────────

export const VOTE_WEIGHTS: Record<Tier, number> = {
  FREE:    1,
  BRONZE:  2,
  SILVER:  3,
  GOLD:    5,
  DIAMOND: 10,
};

// ─── Pure Functions ───────────────────────────────────────────────────────────

/** Validate a vote before accepting it */
export function validateVote(
  vote: Vote,
  voter: VoterProfile,
  recentVotesByUser: Vote[],
  config: VotingConfig,
): { valid: boolean; reason?: string } {
  // Account age check
  if (voter.accountAgeDays < config.minAccountAgeDays) {
    return { valid: false, reason: `Account too new (${voter.accountAgeDays}/${config.minAccountAgeDays} days)` };
  }

  // Suspended voter
  if (voter.isSuspended) {
    return { valid: false, reason: 'Voter account suspended' };
  }

  // Fraud score check
  if (voter.fraudScore >= config.fraudScoreThreshold) {
    return { valid: false, reason: `Fraud score too high (${voter.fraudScore})` };
  }

  // Cooldown check
  if (voter.lastVoteAt) {
    const elapsed = Date.now() - voter.lastVoteAt.getTime();
    if (elapsed < config.cooldownMs) {
      return { valid: false, reason: `Voting too fast. Wait ${config.cooldownMs - elapsed}ms` };
    }
  }

  // Max votes per event
  if (voter.votesThisEvent >= config.maxVotesPerEvent) {
    return { valid: false, reason: `Max votes reached (${config.maxVotesPerEvent})` };
  }

  // Impossible timing — 2 votes less than 200ms apart from the same session
  const tooFast = recentVotesByUser.some(v =>
    v.sessionId === vote.sessionId &&
    Math.abs(v.timestamp.getTime() - vote.timestamp.getTime()) < 200
  );
  if (tooFast) {
    return { valid: false, reason: 'Impossible timing detected' };
  }

  return { valid: true };
}

/** Detect anomalies in a batch of votes */
export function detectAnomalies(
  votes: Vote[],
  windowMs: number = 60_000,
): AnomalyFlag[] {
  const flags: Set<AnomalyFlag> = new Set();
  const now = Date.now();
  const recent = votes.filter(v => now - v.timestamp.getTime() <= windowMs);

  // Device cluster
  const deviceCounts = new Map<string, number>();
  recent.forEach(v => deviceCounts.set(v.deviceFingerprint, (deviceCounts.get(v.deviceFingerprint) ?? 0) + 1));
  if ([...deviceCounts.values()].some(c => c > 10)) flags.add('DEVICE_CLUSTER');

  // IP cluster
  const ipCounts = new Map<string, number>();
  recent.forEach(v => ipCounts.set(v.ipHash, (ipCounts.get(v.ipHash) ?? 0) + 1));
  if ([...ipCounts.values()].some(c => c > 15)) flags.add('IP_CLUSTER');

  // Velocity spike
  if (recent.length > 200) flags.add('VELOCITY_SPIKE');

  // New account flood
  const freeNewAccounts = votes.filter(v => v.tier === 'FREE');
  if (freeNewAccounts.length > votes.length * 0.7) flags.add('NEW_ACCOUNT_FLOOD');

  // Impossible timing in sequence
  const sorted = [...recent].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].voterId === sorted[i - 1].voterId &&
        sorted[i].timestamp.getTime() - sorted[i - 1].timestamp.getTime() < 200) {
      flags.add('IMPOSSIBLE_TIMING');
      break;
    }
  }

  return [...flags];
}

/** Adjust vote weights based on detected anomalies */
export function adjustForFraud(
  votes: Vote[],
  anomalies: AnomalyFlag[],
): { adjustedVotes: Vote[]; discardedVotes: Vote[]; adjustmentFactor: number } {
  if (anomalies.length === 0) {
    return { adjustedVotes: votes, discardedVotes: [], adjustmentFactor: 1 };
  }

  const totalPenalty = anomalies.reduce((sum, flag) => sum + ANOMALY_WEIGHTS[flag], 0);
  const adjustmentFactor = Math.max(0.1, 1 - totalPenalty / 100);

  // Discard suspicious votes (from device clusters or new account floods)
  const discardedVotes: Vote[] = [];
  const adjustedVotes: Vote[] = [];

  if (anomalies.includes('DEVICE_CLUSTER') || anomalies.includes('IP_CLUSTER')) {
    const deviceCounts = new Map<string, number>();
    votes.forEach(v => deviceCounts.set(v.deviceFingerprint, (deviceCounts.get(v.deviceFingerprint) ?? 0) + 1));
    votes.forEach(v => {
      if ((deviceCounts.get(v.deviceFingerprint) ?? 0) > 5) {
        discardedVotes.push(v);
      } else {
        adjustedVotes.push({ ...v, weight: Math.floor(v.weight * adjustmentFactor) });
      }
    });
  } else {
    votes.forEach(v => adjustedVotes.push({ ...v, weight: Math.floor(v.weight * adjustmentFactor) }));
  }

  return { adjustedVotes, discardedVotes, adjustmentFactor };
}

/** Seed-based fair randomness for game shows (provably fair) */
export function fairRandom(seed: string, options: string[]): string {
  // Simple deterministic hash for game show reveals
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % options.length;
  return options[idx];
}
