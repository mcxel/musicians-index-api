// apps/web/src/lib/billboard/billboard.engine.ts
// REAL audience-driven billboard. Not judges. Not fake numbers.
// Powered by: live votes + watch time + engagement + shares.
// Drives: homepage hero, crown, scenes, magazine, sponsor value.

export interface BillboardSignal {
  entityId: string;       // artistId, songId, performanceId
  entityType: "artist" | "song" | "performance" | "poll_winner";
  signal: "vote" | "watch_time" | "replay" | "share" | "save" | "profile_visit";
  value: number;          // raw value (1 for vote, seconds for watch_time)
  timestamp: Date;
}

export interface BillboardEntry {
  entityId: string;
  entityType: BillboardSignal["entityType"];
  name: string;
  rank: number;
  score: number;
  confidenceScore: number;  // 0-1, needs min sample for credibility
  weeklyChange: number;     // +/-
  voteCount: number;
  avgWatchTimeSeconds: number;
  replayCount: number;
  shareCount: number;
  isRising: boolean;
  isCrownHolder: boolean;
  thumbnailUrl?: string;
  genre?: string;
}

// Score formula — real behavior, not manufactured
export function calculateBillboardScore(signals: BillboardSignal[]): number {
  let voteScore = 0;
  let watchScore = 0;
  let engagementScore = 0;
  let shareScore = 0;

  for (const s of signals) {
    if (s.signal === "vote")         voteScore      += s.value;
    if (s.signal === "watch_time")   watchScore     += Math.min(s.value, 300) / 300; // max 5 min per view
    if (s.signal === "replay")       engagementScore += 0.8;
    if (s.signal === "save")         engagementScore += 0.4;
    if (s.signal === "profile_visit")engagementScore += 0.2;
    if (s.signal === "share")        shareScore      += s.value;
  }

  // Weighted composite — audience led
  return (voteScore * 0.40) + (watchScore * 0.25) + (engagementScore * 0.20) + (shareScore * 0.15);
}

// Scene selection based on billboard rank
export function getBillboardScene(rank: number, isCrownHolder: boolean): string {
  if (isCrownHolder || rank === 1) return "neon-announcement-stage";
  if (rank <= 3) return "concert-hall";
  if (rank <= 10) return "tv-studio";
  return "festival";
}

// Billboard categories — all real signals
export const BILLBOARD_CATEGORIES = [
  { id:"top_song",          label:"Top Song",              entityType:"song"        },
  { id:"top_performance",   label:"Top Performance",       entityType:"performance" },
  { id:"rising_artist",     label:"Rising Artist",         entityType:"artist"      },
  { id:"top_live_artist",   label:"Most Watched Live",     entityType:"artist"      },
  { id:"battle_champion",   label:"Battle Champion",       entityType:"artist"      },
  { id:"fan_favorite",      label:"Fan Favorite",          entityType:"performance" },
  { id:"most_replayed",     label:"Most Replayed Clip",    entityType:"performance" },
  { id:"magazine_hot",      label:"Magazine Trending",     entityType:"performance" },
] as const;
