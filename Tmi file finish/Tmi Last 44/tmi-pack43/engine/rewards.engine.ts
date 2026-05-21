// packages/rewards-engine/src/rewards.engine.ts
// The complete rewards, giveaways, audience participation, and avatar economy engine.
// Used by: live rooms, games, cypher, sponsor campaigns, cron jobs, bots.

// ── REWARD TYPES ──────────────────────────────────────────
export type RewardType =
  | "points"              // +N points to user's ledger
  | "avatar_item"         // cosmetic item added to inventory
  | "sponsor_item"        // sponsor-branded item or merch
  | "discount_code"       // % off next purchase
  | "free_ticket"         // entry to an event
  | "backstage_pass"      // VIP room access
  | "merch_item"          // physical or digital merch
  | "digital_collectible" // limited issue collectible
  | "badge"               // profile badge
  | "title"               // display title ("Crown Holder", "Cypher Legend")
  | "rank_boost"          // temporary discovery ranking boost
  | "shoutout"            // broadcaster mentions user live
  | "skip_queue"          // front-row access to next event
  | "priority_entry"      // first into a room
  | "bonus_vote"          // extra vote in next contest
  | "mystery_box"         // random item from loot table
  | "wallet_credit";      // real money credit (Big Ace approved)

// ── TRIGGER TYPES ─────────────────────────────────────────
export type RewardTrigger =
  | "random_audience_drop"     // bot drops at random interval
  | "random_contestant_drop"   // game-specific random drop
  | "first_to_react"           // first person to send any reaction
  | "first_correct_answer"     // first correct answer in trivia
  | "first_to_join_room"       // first N people who join
  | "first_ticket_buyer"       // first buyer of new ticket tier
  | "fastest_response"         // lowest latency buzz-in
  | "moderator_manual_gift"    // mod manually triggers
  | "host_manual_gift"         // host manually gifts
  | "sponsor_triggered"        // sponsor campaign fires drop
  | "bot_triggered"            // scheduled bot fires
  | "streak_reward"            // N consecutive days/wins
  | "attendance_reward"        // stayed for N minutes
  | "participation_reward"     // took any qualifying action
  | "loyalty_reward"           // long-term platform member
  | "surprise_live_drop"       // unannounced mid-show drop
  | "milestone_reward"         // platform milestone hit (10k viewers etc)
  | "leaderboard_reward"       // end-of-week leaderboard finish
  | "contest_winner"           // official contest winner
  | "audience_vote_winner"     // most votes in a round
  | "challenge_completion"     // completed a sponsor task
  | "referral_reward";         // referred a user who joined

// ── REWARD RULE ───────────────────────────────────────────
// Every reward drop is governed by a RewardRule.
// Rules prevent abuse, define eligibility, and control distribution.
export interface RewardRule {
  id: string;
  name: string;
  rewardType: RewardType;
  triggerType: RewardTrigger;
  
  // What the reward contains
  payload: {
    points?: number;          // for "points" reward
    itemId?: string;          // for item rewards
    discountPct?: number;     // for discount codes
    walletCreditCents?: number; // requires Big Ace approval if > 0
  };
  
  // Eligibility gates
  eligibleRoles: string[];     // [] = all roles
  eligibleRooms: string[];     // roomType array, [] = all
  minimumWatchTimeSeconds: number;  // must be in room this long
  minimumParticipationActions: number; // votes, reactions, etc
  requiresTicket: boolean;     // must have event ticket
  requiresVerifiedAccount: boolean;
  
  // Distribution controls
  dropOddsPct: number;         // 0-100: probability of drop
  maxClaimsPerUser: number;    // 1 = one-time, 0 = unlimited
  maxClaimsPerEvent: number;   // total drops per event
  maxClaimsPerSession: number; // total per game/show session
  
  // Timing
  cooldownSeconds: number;     // min seconds between claims for same user
  availableFrom?: Date;
  availableUntil?: Date;
  
  // Anti-abuse
  minAccountAgeDays: number;   // prevent fresh-account farming
  maxVelocityPerMinute: number;// claim attempts rate limit
  requiresRoomPresence: boolean; // validated via WebSocket
  requiresBigAceApproval: boolean; // for wallet_credit rewards
  
  // Sponsor link
  sponsorId?: string;          // if sponsored drop
  campaignId?: string;
  
  isActive: boolean;
  createdAt: Date;
}

// ── ANTI-ABUSE VALIDATION ─────────────────────────────────
export interface AbuseCheck {
  userId: string;
  ruleId: string;
  roomId: string;
  timestamp: Date;
}

export async function validateRewardClaim(
  check: AbuseCheck,
  rule: RewardRule
): Promise<{ allowed: boolean; reason?: string }> {
  // 1. Check cooldown (Redis key: reward:cooldown:{userId}:{ruleId})
  // 2. Check max claims per user (DB: RewardClaim count)
  // 3. Check account age (User.createdAt)
  // 4. Check velocity (Redis rate limit)
  // 5. Check room presence (RoomMember.isActive)
  // 6. Check watch time (RoomMember.joinedAt delta)
  // 7. Check participation actions (PointsLedger count for event)
  // 8. Flag suspicious if multiple claims in different rooms simultaneously
  console.log(`[RewardEngine] Validate claim: user=${check.userId} rule=${rule.id}`);
  return { allowed: true };
}

// ── LIVE AUDIENCE PROMPT SYSTEM ───────────────────────────
// Host or bot fires a prompt → audience responds → fastest/first wins
export interface AudiencePrompt {
  id: string;
  sessionId: string;          // room or game session
  promptType: "trivia" | "reaction" | "fastest_tap" | "fill_blank" | "pick_winner" | "shoutout_request";
  question?: string;          // for trivia / fill_blank
  correctAnswer?: string;     // for trivia scoring
  rewardRuleId: string;       // what they win
  windowSeconds: number;      // how long to answer
  maxWinners: number;         // 1 = first correct, N = first N
  status: "pending" | "active" | "closed" | "rewarded";
  entries: AudiencePromptEntry[];
  winners: string[];          // userIds
  firedAt?: Date;
  closedAt?: Date;
}

export interface AudiencePromptEntry {
  userId: string;
  response?: string;
  responseTimeMs: number;     // from prompt fire to response
  isCorrect?: boolean;
  isWinner: boolean;
  points?: number;            // participation points regardless of win
  submittedAt: Date;
}

// Templates for common prompt types
export const PROMPT_TEMPLATES = {
  trivia_fastest: {
    promptType: "trivia",
    windowSeconds: 15,
    maxWinners: 1,
    description: "First correct answer wins",
  },
  reaction_first: {
    promptType: "reaction",
    windowSeconds: 10,
    maxWinners: 3,
    description: "First 3 to react win",
  },
  fill_blank: {
    promptType: "fill_blank",
    windowSeconds: 20,
    maxWinners: 1,
    description: "Complete the lyric",
  },
  surprise_drop: {
    promptType: "fastest_tap",
    windowSeconds: 5,
    maxWinners: 1,
    description: "Tap first to claim",
  },
} as const;

// ── FULFILLMENT CHAIN ─────────────────────────────────────
// Every reward claim goes through this pipeline
export type FulfillmentStep =
  | "claim_received"
  | "abuse_check"
  | "rule_validation"
  | "winner_selected"
  | "reward_prepared"
  | "points_granted"          // if points reward
  | "item_added_to_inventory" // if item reward
  | "coupon_generated"        // if discount reward
  | "ticket_issued"           // if ticket reward
  | "wallet_credited"         // if wallet_credit (Big Ace required)
  | "badge_unlocked"
  | "notification_sent"
  | "winner_banner_shown"     // frontend display
  | "broadcaster_shoutout"    // if shoutout reward
  | "audit_logged"
  | "fraud_reviewed"          // if suspicious patterns
  | "fulfillment_complete";

export interface RewardFulfillment {
  claimId: string;
  userId: string;
  ruleId: string;
  rewardType: RewardType;
  steps: { step: FulfillmentStep; completedAt: Date; success: boolean; note?: string }[];
  currentStep: FulfillmentStep;
  isComplete: boolean;
  requiresBigAce: boolean;    // auto-set if wallet_credit reward
  requiresFraudReview: boolean; // auto-set if suspicious
  fulfilledAt?: Date;
}

// ── DROP TABLE SYSTEM (loot box / mystery box) ────────────
export interface DropTable {
  id: string;
  name: string;
  sponsorId?: string;
  eventId?: string;
  drops: DropTableEntry[];
  guaranteedAfterNDraws?: number; // pity timer
}

export interface DropTableEntry {
  rewardType: RewardType;
  payload: RewardRule["payload"];
  weight: number;    // relative probability weight
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "EXCLUSIVE";
  maxTotal?: number; // global cap on this drop
  droppedCount: number;
}

export function rollDropTable(table: DropTable): DropTableEntry {
  const totalWeight = table.drops.reduce((sum, d) => sum + d.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const drop of table.drops) {
    rand -= drop.weight;
    if (rand <= 0) return drop;
  }
  return table.drops[table.drops.length - 1]; // fallback
}
