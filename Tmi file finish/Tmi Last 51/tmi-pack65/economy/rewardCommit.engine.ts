// apps/web/src/lib/engines/rewardCommit.engine.ts
// Every earn/spend action commits through here.
// No reward is real until it commits through this bridge.
// Platform Law #5: Big Ace must approve cash payouts.

export type RewardAction =
  | "vote" | "tip" | "watch_time" | "ad_watch" | "win_battle"
  | "win_contest" | "win_game" | "win_yearly" | "participation"
  | "reaction" | "follow" | "subscription_bonus" | "sponsor_gift"
  | "advertiser_gift" | "surprise_giveaway" | "season_pass_claim"
  | "achievement_unlock" | "first_action" | "onboarding_bonus";

export interface RewardCommit {
  commitId: string;
  userId: string;
  action: RewardAction;
  points: number;
  xp: number;
  cashCents: number;        // 0 unless specific actions
  itemUnlock?: string;      // emote/cosmetic/skin ID
  seasonPassProgress: number; // XP toward season pass
  requiresBigAce: boolean;  // Platform Law #5 for cash
  roomId?: string;
  roundId?: string;
  sessionId?: string;
  committedAtMs: number;
  auditNote: string;
  status: "pending" | "committed" | "failed" | "held";
}

// Points and XP per action
export const REWARD_TABLE: Record<RewardAction, { points: number; xp: number; cashCents: number }> = {
  vote:               { points: 3,    xp: 5,    cashCents: 0    },
  tip:                { points: 0,    xp: 10,   cashCents: 0    }, // cash goes to artist
  watch_time:         { points: 1,    xp: 2,    cashCents: 0    }, // per minute
  ad_watch:           { points: 5,    xp: 5,    cashCents: 0    },
  win_battle:         { points: 150,  xp: 200,  cashCents: 0    }, // weekly
  win_contest:        { points: 500,  xp: 500,  cashCents: 5000 }, // monthly — needs Big Ace
  win_game:           { points: 100,  xp: 150,  cashCents: 0    },
  win_yearly:         { points: 5000, xp: 5000, cashCents: 50000}, // needs Big Ace
  participation:      { points: 20,   xp: 30,   cashCents: 0    },
  reaction:           { points: 0,    xp: 1,    cashCents: 0    },
  follow:             { points: 5,    xp: 10,   cashCents: 0    },
  subscription_bonus: { points: 100,  xp: 100,  cashCents: 0    },
  sponsor_gift:       { points: 0,    xp: 0,    cashCents: 0    }, // variable
  advertiser_gift:    { points: 0,    xp: 0,    cashCents: 0    }, // variable
  surprise_giveaway:  { points: 0,    xp: 0,    cashCents: 0    }, // variable
  season_pass_claim:  { points: 0,    xp: 0,    cashCents: 0    }, // item unlock
  achievement_unlock: { points: 50,   xp: 100,  cashCents: 0    },
  first_action:       { points: 100,  xp: 150,  cashCents: 0    },
  onboarding_bonus:   { points: 250,  xp: 250,  cashCents: 0    },
};

let _commitCounter = 0;

export function buildRewardCommit(
  userId: string,
  action: RewardAction,
  overrides: Partial<{ cashCents: number; itemUnlock: string; roomId: string; roundId: string; note: string }>
): RewardCommit {
  const base = REWARD_TABLE[action];
  const cashCents = overrides.cashCents ?? base.cashCents;
  const requiresBigAce = cashCents > 0;

  return {
    commitId: `commit_${userId}_${action}_${++_commitCounter}_${Date.now()}`,
    userId, action,
    points: base.points,
    xp: base.xp,
    cashCents,
    itemUnlock: overrides.itemUnlock,
    seasonPassProgress: base.xp,
    requiresBigAce,
    roomId: overrides.roomId,
    roundId: overrides.roundId,
    committedAtMs: Date.now(),
    auditNote: overrides.note ?? `${action} reward for ${userId}`,
    status: requiresBigAce ? "held" : "pending", // held until Big Ace approves cash
  };
}

// Pending commits (replace with DB in production)
const _pendingCommits: RewardCommit[] = [];

export async function commitReward(commit: RewardCommit): Promise<RewardCommit> {
  console.log(`[RewardCommit] ${commit.action} → ${commit.points}pts ${commit.xp}xp ${commit.cashCents}¢ [${commit.requiresBigAce ? "HELD-BIG-ACE" : "PENDING"}]`);
  _pendingCommits.push(commit);
  // Blackbox: POST /api/rewards/commit → persist to wallet + ledger
  return commit;
}
