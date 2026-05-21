// apps/web/src/lib/voting/audienceVoting.engine.ts
// Real audience votes with confidence scoring and fraud protection.
// This is the REAL billboard — not judges, not fake numbers.

export interface VoteSignal {
  userId: string;
  targetId: string;      // artist/performer being voted for
  battleId: string;
  signalType: "vote" | "cheer" | "reaction" | "watch_through" | "share" | "save";
  weight: number;        // different signals have different weights
  timestamp: Date;
  ipHash: string;        // for anti-spam (hashed, not stored raw)
  sessionId: string;
}

// Weight constants — behavior signals, not just clicks
export const SIGNAL_WEIGHTS = {
  vote:          1.0,   // direct audience vote
  cheer:         0.3,   // cheer reaction in room
  watch_through: 0.8,   // watched full performance
  share:         0.5,   // shared the performance
  save:          0.4,   // saved/favorited
  reaction:      0.2,   // any other reaction
} as const;

export interface VoteTally {
  targetId: string;
  rawVotes: number;
  weightedScore: number;
  confidenceLevel: number;   // 0-1 (low = small sample, high = reliable)
  fraudFlagged: boolean;
  breakdown: Record<string, number>;  // by signal type
}

export function calculateTally(signals: VoteSignal[]): VoteTally {
  if (!signals.length) return { targetId:"", rawVotes:0, weightedScore:0, confidenceLevel:0, fraudFlagged:false, breakdown:{} };

  const targetId = signals[0].targetId;
  let rawVotes = 0;
  let weightedScore = 0;
  const breakdown: Record<string, number> = {};
  const userVotes = new Map<string, number>();  // anti-spam: count votes per user

  for (const s of signals) {
    const w = SIGNAL_WEIGHTS[s.signalType] ?? 0.1;
    weightedScore += w;
    breakdown[s.signalType] = (breakdown[s.signalType] || 0) + 1;
    if (s.signalType === "vote") rawVotes++;
    userVotes.set(s.userId, (userVotes.get(s.userId) || 0) + 1);
  }

  // Confidence: higher sample size = higher confidence, min 100 votes for full confidence
  const confidenceLevel = Math.min(1, rawVotes / 100);

  // Fraud detection: if any user voted more than 3 times, flag it
  const fraudFlagged = Array.from(userVotes.values()).some(v => v > 3);

  return { targetId, rawVotes, weightedScore, confidenceLevel, fraudFlagged, breakdown };
}

// Clear winner determination with tie-break
export function determineWinner(tallies: VoteTally[]): { winnerId: string; margin: number; isTie: boolean } {
  if (!tallies.length) return { winnerId:"", margin:0, isTie:false };

  const sorted = [...tallies].sort((a, b) => b.weightedScore - a.weightedScore);
  const top = sorted[0];
  const second = sorted[1];

  const margin = second ? (top.weightedScore - second.weightedScore) / Math.max(top.weightedScore, 1) : 1;
  const isTie = second ? Math.abs(top.weightedScore - second.weightedScore) < 0.05 * top.weightedScore : false;

  return { winnerId: top.targetId, margin, isTie };
}
