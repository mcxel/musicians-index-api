import { NextResponse } from "next/server";
import type { LiveFeedItem } from "@/components/billboard/TMIBillboardLiveWall";

/**
 * GET /api/live
 * Returns the current live feed for the Billboard, homepage widgets,
 * and LiveStateRegistry sync. Stats are randomized slightly on each
 * request to simulate real-time activity fluctuation.
 *
 * In production: replace SEED_PERFORMERS with a database query, e.g.:
 *   SELECT * FROM performer_sessions WHERE is_live = true ORDER BY score DESC
 */

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maybeBoost(): number {
  return Math.random() < 0.15 ? rand(20, 60) : 0;
}

/* ─── Seed performers (bot + real accounts for soft launch) ─────────────────
   These populate the Billboard and homepage widgets on day 1.
   Replace/extend from your database as real performers go live.
   ─────────────────────────────────────────────────────────────────────────── */
const SEED: Omit<LiveFeedItem, "viewers" | "tips" | "battleRank" | "activityLevel" | "boostWeight">[] = [
  {
    id:            "feed-001",
    performerId:   "HYP-0001",
    performerName: "Kreach",
    performerTier: "diamond",
    roomId:        "cypher-arena",
    genre:         "cypher",
    privacy:       "PUBLIC",
    accentColor:   "#00FFFF",
    isLive:        true,
  },
  {
    id:            "feed-002",
    performerId:   "HYP-0002",
    performerName: "Drez Wavez",
    performerTier: "gold",
    roomId:        "monday-night-stage",
    genre:         "battle",
    privacy:       "PUBLIC",
    accentColor:   "#FF2DAA",
    isLive:        true,
  },
  {
    id:            "feed-003",
    performerId:   "HYP-0003",
    performerName: "Solo Ace",
    performerTier: "platinum",
    roomId:        "monthly-idol",
    genre:         "live",
    privacy:       "PUBLIC",
    accentColor:   "#FFD700",
    isLive:        true,
  },
  {
    id:            "feed-004",
    performerId:   "HYP-0004",
    performerName: "Nova Redd",
    performerTier: "gold",
    roomId:        "venue-room",
    genre:         "concert",
    privacy:       "PAID_ENTRY",
    accentColor:   "#AA2DFF",
    isLive:        true,
    entryPriceUsd: 4.99,
  },
  {
    id:            "feed-005",
    performerId:   "HYP-0005",
    performerName: "Mic Titan",
    performerTier: "silver",
    roomId:        "battle-pit-05",
    genre:         "battle",
    privacy:       "PUBLIC",
    accentColor:   "#FF6B35",
    isLive:        true,
  },
  {
    id:            "feed-006",
    performerId:   "HYP-0006",
    performerName: "Zynth",
    performerTier: "diamond",
    roomId:        "diamond-surf-06",
    genre:         "live",
    privacy:       "DIAMOND_SURF",
    accentColor:   "#38bdf8",
    isLive:        true,
  },
  {
    id:            "feed-007",
    performerId:   "HYP-0007",
    performerName: "Lyric Lens",
    performerTier: "free",
    roomId:        "open-cypher-07",
    genre:         "cypher",
    privacy:       "PUBLIC",
    accentColor:   "#22c55e",
    isLive:        true,
  },
  {
    id:            "feed-008",
    performerId:   "REG-0001",
    performerName: "Blaze Trak",
    performerTier: "gold",
    roomId:        "challenge-ring-08",
    genre:         "challenge",
    privacy:       "PUBLIC",
    accentColor:   "#f97316",
    isLive:        true,
  },
  {
    id:            "feed-009",
    performerId:   "REG-0002",
    performerName: "Phantom Beat",
    performerTier: "platinum",
    roomId:        "game-vault-09",
    genre:         "game",
    privacy:       "INVITE_ONLY",
    accentColor:   "#818cf8",
    isLive:        false,
  },
  {
    id:            "feed-010",
    performerId:   "REG-0003",
    performerName: "Crown Chaser",
    performerTier: "silver",
    roomId:        "deal-or-feud",
    genre:         "battle",
    privacy:       "PUBLIC",
    accentColor:   "#fb923c",
    isLive:        false,
  },
  {
    id:            "feed-011",
    performerId:   "REG-0004",
    performerName: "Bass Prophet",
    performerTier: "free",
    roomId:        "bass-room-11",
    genre:         "live",
    privacy:       "PUBLIC",
    accentColor:   "#c084fc",
    isLive:        true,
  },
  {
    id:            "feed-012",
    performerId:   "REG-0005",
    performerName: "Verse Architect",
    performerTier: "gold",
    roomId:        "cypher-arena",
    genre:         "cypher",
    privacy:       "PUBLIC",
    accentColor:   "#2dd4bf",
    isLive:        true,
  },
];

export async function GET() {
  // Hydrate each seed with live-fluctuating stats
  const feed: LiveFeedItem[] = SEED.map((s) => ({
    ...s,
    viewers:       s.isLive ? rand(8, 420) : rand(0, 12),
    tips:          s.isLive ? rand(0, 180) : 0,
    battleRank:    rand(1, 50),
    activityLevel: s.isLive ? rand(30, 100) : rand(0, 20),
    boostWeight:   maybeBoost(),
    boostExpiresAt: maybeBoost() > 0 ? Date.now() + rand(30_000, 180_000) : undefined,
  }));

  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });
}
