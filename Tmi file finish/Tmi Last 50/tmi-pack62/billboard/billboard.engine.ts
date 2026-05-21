// apps/web/src/engines/billboard/billboard.engine.ts
// Real billboard derived from actual platform behavior — NOT fake judges.
// Audience proves it. Behavior proves it.

export type BillboardCategory =
  | "top_song"              // Most-saved song this week
  | "top_performance"       // Most-watched live set
  | "top_artist"            // Composite score across metrics
  | "rising_artist"         // Fastest upward momentum
  | "top_battle_winner"     // Most battle victories
  | "top_cypher"            // Most-replayed cypher
  | "top_comedian"          // Most laughs / cheer reactions
  | "top_dancer"            // Most audience votes in dance battles
  | "top_instrument"        // Best instrument showcaser (by role)
  | "fan_favorite"          // Pure fan vote
  | "monthly_champion"      // Monthly finals winner
  | "top_magazine_story"    // Most-read article this week
  | "top_poll_topic";       // Most-voted platform poll

export interface BillboardSignals {
  entityId: string;         // artistId, songId, articleId, etc.
  entityType: "artist" | "song" | "article" | "battle" | "poll";
  liveViews: number;
  replayViews: number;
  profileVisits: number;
  saves: number;
  shares: number;
  audienceVotes: number;
  reactions: { fire:number; heart:number; applause:number; laugh:number };
  completionRate: number;   // 0-1, percentage who watched full
  growthVelocity: number;   // change vs previous period
  recency: number;          // how recent (days ago)
  sampleSize: number;       // total voters — used for confidence filter
}

export interface BillboardEntry {
  rank: number;
  entityId: string;
  entityName: string;
  category: BillboardCategory;
  score: number;
  confidence: number;       // 0-1 (low sample = low confidence)
  signals: BillboardSignals;
  trend: "up" | "down" | "stable" | "new";
  weeklyChange: number;
  isVerified: boolean;
  homePageTrigger: boolean; // if #1, triggers homepage hero + crown animation
}

// ── SCORING FORMULA ───────────────────────────────────────────────
// "Real people → real results — not fake judges"
export function calculateBillboardScore(signals: BillboardSignals): { score: number; confidence: number } {
  const WEIGHTS = {
    audienceVotes:   0.40,
    watchTime:       0.25,    // approximated by completionRate * views
    engagement:      0.20,    // saves + shares + reactions
    growthMomentum:  0.15,    // velocity × recency bonus
  };

  const watchScore     = (signals.liveViews + signals.replayViews) * signals.completionRate;
  const engagementScore = signals.saves + signals.shares +
    signals.reactions.fire + signals.reactions.heart +
    signals.reactions.applause + signals.reactions.laugh;
  const momentumScore  = signals.growthVelocity * Math.max(0, 1 - signals.recency / 30); // decay over 30 days

  const rawScore = (
    signals.audienceVotes * WEIGHTS.audienceVotes +
    watchScore            * WEIGHTS.watchTime +
    engagementScore       * WEIGHTS.engagement +
    momentumScore         * WEIGHTS.growthMomentum
  );

  // Confidence: penalize tiny sample sizes
  const confidence = Math.min(1, signals.sampleSize / 100); // 100 votes = full confidence

  return { score: rawScore * confidence, confidence };
}

// ── ANTI-FRAUD RULES ──────────────────────────────────────────────
export const FRAUD_RULES = {
  MAX_VOTES_PER_USER_PER_DAY: 5,
  MIN_SAMPLE_SIZE_FOR_BILLBOARD: 10,
  VELOCITY_ANOMALY_THRESHOLD: 5.0,   // 5× normal velocity = flag for review
  DUPLICATE_VOTE_WINDOW_HOURS: 24,
  SUSPICIOUS_VOTE_PATTERN: "all_from_same_ip",
};

// ── BILLBOARD → VISUAL SYSTEM ─────────────────────────────────────
// When rank #1, triggers homepage hero, crown animation, announcement stage
export function getBillboardVisualTrigger(entry: BillboardEntry): {
  triggerHomepageHero: boolean;
  triggerCrownAnimation: boolean;
  sceneOverride: string | null;
  announcementText: string;
} {
  if (entry.rank === 1 && entry.homePageTrigger) {
    return {
      triggerHomepageHero: true,
      triggerCrownAnimation: true,
      sceneOverride: "neon-announcement-stage",
      announcementText: `${entry.entityName} is #1 this week!`,
    };
  }
  return { triggerHomepageHero:false, triggerCrownAnimation:false, sceneOverride:null, announcementText:"" };
}

// ── POLL QUESTIONS FOR BILLBOARD ──────────────────────────────────
export const BILLBOARD_POLL_QUESTIONS = [
  "What's the #1 song RIGHT NOW in your opinion?",
  "Who gave the best live performance this week?",
  "Which artist is trending hardest right now?",
  "What was the best battle of the week?",
  "What's the hottest cypher this month?",
  "Who's the rising artist to watch?",
  "What performance blew your mind this week?",
];
