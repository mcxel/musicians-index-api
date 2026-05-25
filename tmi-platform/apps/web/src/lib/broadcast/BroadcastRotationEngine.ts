"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { BroadcastFeedItem, BroadcastFeedKind } from "@/types/broadcast";
import { DECK_LABELS } from "@/types/broadcast";

// ─── Seeded feed data ─────────────────────────────────────────────────────────
// In production, replace these with API calls to /api/live/feeds

export const SEED_FEEDS: BroadcastFeedItem[] = [
  // Audience seats
  { id: "aud-1", kind: "audience-seat", title: "Main Lobby Audience", subtitle: "84% occupied · 2,147 watching", href: "/live/rooms/monthly-idol", status: "live", layoutMode: "audience-grid", mediaMode: "avatar", accentColor: "#00FFFF", avatarEmoji: "🎭", viewerCount: 2147 },
  { id: "aud-2", kind: "audience-seat", title: "Battle Floor Crowd", subtitle: "1,204 in seats", href: "/live/rooms/dealer-feud-1000", status: "live", layoutMode: "audience-grid", mediaMode: "avatar", accentColor: "#FFD700", avatarEmoji: "👥", viewerCount: 1204 },

  // Public live cameras
  { id: "cam-1", kind: "live-camera", title: "Astra Nova", subtitle: "R&B · Live Now", href: "/live/lobby", genre: "R&B", status: "live", layoutMode: "single", mediaMode: "webrtc", accentColor: "#FF2DAA", avatarEmoji: "🎤", viewerCount: 847, shape: "octagon" },
  { id: "cam-2", kind: "live-camera", title: "Lagos Burst", subtitle: "Afrobeat · Live", href: "/live/lobby", genre: "Afrobeat", status: "live", layoutMode: "single", mediaMode: "webrtc", accentColor: "#FF6B35", avatarEmoji: "🔥", viewerCount: 563, shape: "octagon" },
  { id: "cam-3", kind: "live-camera", title: "Prism Vex", subtitle: "EDM · Live", href: "/live/lobby", genre: "EDM", status: "live", layoutMode: "single", mediaMode: "webrtc", accentColor: "#00FFFF", avatarEmoji: "🎛️", viewerCount: 701, shape: "octagon" },
  { id: "cam-4", kind: "live-camera", title: "Zion Freq", subtitle: "Gospel · Crown Holder", href: "/live/lobby", genre: "Gospel", status: "live", layoutMode: "single", mediaMode: "webrtc", accentColor: "#FFD700", avatarEmoji: "👑", viewerCount: 1204, shape: "octagon" },
  { id: "cam-5", kind: "live-camera", title: "Flex King", subtitle: "Dancer · Live", href: "/live/lobby", genre: "Dance", status: "live", layoutMode: "single", mediaMode: "avatar", accentColor: "#AA2DFF", avatarEmoji: "💃", viewerCount: 389, shape: "octagon" },
  { id: "cam-6", kind: "live-camera", title: "Nova Laugh", subtitle: "Comedian · Live", href: "/live/lobby", genre: "Comedy", status: "live", layoutMode: "single", mediaMode: "avatar", accentColor: "#39FF14", avatarEmoji: "😂", viewerCount: 512, shape: "octagon" },

  // Song challenges
  { id: "chal-1", kind: "challenge", title: "Song Challenge: Hip-Hop", subtitle: "Submit your track · Vote now", href: "/battles/new", genre: "Hip-Hop", status: "live", layoutMode: "single", mediaMode: "avatar", accentColor: "#FF2DAA", avatarEmoji: "🎵", isHighXP: true, prizePool: "$500" },
  { id: "chal-2", kind: "challenge", title: "Dance Challenge", subtitle: "Submit your video · Votes open", href: "/battles/new", genre: "Dance", status: "live", layoutMode: "single", mediaMode: "avatar", accentColor: "#AA2DFF", avatarEmoji: "💃", isHighXP: true, prizePool: "$250", performerCategories: ["dancer"] },
  { id: "chal-3", kind: "challenge", title: "Comedy Clip Challenge", subtitle: "Funniest 60 seconds wins", href: "/battles/new", genre: "Comedy", status: "live", layoutMode: "single", mediaMode: "avatar", accentColor: "#39FF14", avatarEmoji: "😂", isHighXP: true, performerCategories: ["comedian"] },

  // Battles
  { id: "bat-1", kind: "battle", title: "Big Ace vs Charro Ace", subtitle: "Hip-Hop Battle · Vote Now", href: "/battles", genre: "Hip-Hop", roomId: "battle-hiphop-1", performerIds: ["big-ace", "charro-ace"], status: "live", layoutMode: "split", mediaMode: "webrtc", accentColor: "#FFD700", avatarEmoji: "⚔️", viewerCount: 3200, isHighXP: true, prizePool: "$1,000" },
  { id: "bat-2", kind: "battle", title: "Flex King vs Wave Rider", subtitle: "Dance Battle · Live", href: "/battles", genre: "Dance", roomId: "battle-dance-1", performerIds: ["flex-king", "wave-rider"], status: "live", layoutMode: "split", mediaMode: "avatar", accentColor: "#AA2DFF", avatarEmoji: "💃", viewerCount: 1800, isHighXP: true, performerCategories: ["dancer"] },
  { id: "bat-3", kind: "battle", title: "Nova Laugh vs Jest King", subtitle: "Comedy Battle · Round 2", href: "/battles", genre: "Comedy", performerIds: ["nova-laugh", "jest-king"], status: "live", layoutMode: "split", mediaMode: "avatar", accentColor: "#39FF14", avatarEmoji: "😂", viewerCount: 940, isHighXP: true, performerCategories: ["comedian"] },

  // Cyphers
  { id: "cyp-1", kind: "cypher", title: "Hip-Hop Cypher Stage", subtitle: "Big Ace has the mic · Queue: 4", href: "/cypher/stage", genre: "Hip-Hop", roomId: "cypher-hiphop", status: "live", layoutMode: "spotlight", mediaMode: "webrtc", accentColor: "#FF2DAA", avatarEmoji: "🎤", viewerCount: 2800, isHighXP: true },
  { id: "cyp-2", kind: "cypher", title: "Spoken Word Circle", subtitle: "Nova Cipher up now", href: "/cypher/stage", genre: "Spoken Word", status: "live", layoutMode: "spotlight", mediaMode: "avatar", accentColor: "#00C8FF", avatarEmoji: "📜", viewerCount: 420, performerCategories: ["spoken-word"] },

  // Concerts
  { id: "con-1", kind: "concert", title: "World Dance Party", subtitle: "60+ countries · 5,800 watching", href: "/live/rooms/world-dance-party", genre: "Global", roomId: "world-dance-party", status: "live", layoutMode: "single", mediaMode: "webrtc", accentColor: "#FF6B35", avatarEmoji: "🌍", viewerCount: 5800, isHighXP: false, prizePool: "$4,000" },
  { id: "con-2", kind: "concert", title: "Monday Night Stage", subtitle: "Any talent welcome · 4,200 live", href: "/live/rooms/monday-night-stage", genre: "Variety", roomId: "monday-night-stage", status: "live", layoutMode: "single", mediaMode: "webrtc", accentColor: "#00FFFF", avatarEmoji: "🎶", viewerCount: 4200 },

  // World premieres
  { id: "pre-1", kind: "world-premiere", title: "Lani Flame — New Single", subtitle: "R&B · World Premiere Drop", href: "/articles/performer/lani-flame", genre: "R&B", status: "live", layoutMode: "billboard", mediaMode: "preview", accentColor: "#FF2DAA", avatarEmoji: "🔥", isHighXP: false },
  { id: "pre-2", kind: "world-premiere", title: "DJ Blend — Album Release Party", subtitle: "EDM · Tonight 9PM EST", href: "/live/rooms/monthly-idol", genre: "EDM", status: "scheduled", layoutMode: "billboard", mediaMode: "preview", accentColor: "#00C8FF", avatarEmoji: "🎧" },

  // Album releases
  { id: "alb-1", kind: "album-release", title: "Big Ace — Crown Season", subtitle: "Hip-Hop · 12 tracks · Out Now", href: "/articles/performer/big-ace", genre: "Hip-Hop", status: "live", layoutMode: "billboard", mediaMode: "preview", accentColor: "#FFD700", avatarEmoji: "🎤" },
  { id: "alb-2", kind: "album-release", title: "Trina Sky — Gospel Reborn", subtitle: "Gospel · 9 tracks · Listen Now", href: "/articles/performer/trina-sky", genre: "Gospel", status: "live", layoutMode: "billboard", mediaMode: "preview", accentColor: "#39FF14", avatarEmoji: "🙏" },

  // Game shows
  { id: "gam-1", kind: "game-show", title: "Monthly Idol", subtitle: "3,100 watching · $5,000 prize", href: "/live/rooms/monthly-idol", status: "live", layoutMode: "single", mediaMode: "webrtc", accentColor: "#FF2DAA", avatarEmoji: "⭐", viewerCount: 3100, isHighXP: true, prizePool: "$5,000" },
  { id: "gam-2", kind: "game-show", title: "Dealer Feud 1000", subtitle: "2,400 watching · $1,000 prize", href: "/live/rooms/dealer-feud-1000", status: "live", layoutMode: "single", mediaMode: "webrtc", accentColor: "#FFD700", avatarEmoji: "🎯", viewerCount: 2400, isHighXP: true },

  // Sponsor billboard
  { id: "spo-1", kind: "sponsor-billboard", title: "Sponsor an Artist Tonight", subtitle: "7 performers available · Spots open", href: "/sponsors", status: "live", layoutMode: "billboard", mediaMode: "avatar", accentColor: "#FFD700", avatarEmoji: "🤝" },

  // Magazine feature
  { id: "mag-1", kind: "magazine-feature", title: "Charro Ace — Cover Story", subtitle: "Hip-Hop · Issue 31", href: "/articles/performer/charro-ace", genre: "Hip-Hop", status: "live", layoutMode: "billboard", mediaMode: "preview", accentColor: "#FF6B00", avatarEmoji: "🌟" },

  // Venue ticketing
  { id: "ven-1", kind: "venue-ticketing", title: "Sell Your Tickets Here", subtitle: "Zero TMI platform fees. Lower prices. Bigger crowds.", href: "/venues/sell", status: "live", layoutMode: "billboard", mediaMode: "preview", accentColor: "#FFD700", avatarEmoji: "🎟️" },
  { id: "ven-2", kind: "venue-ticketing", title: "Promoters: List Your Show", subtitle: "Zero TMI platform fees. Standard payment processing fees may apply.", href: "/venues/sell", status: "live", layoutMode: "billboard", mediaMode: "preview", accentColor: "#00FF88", avatarEmoji: "🏟️" },
  { id: "ven-3", kind: "venue-ticketing", title: "Lower Fees = Bigger Crowds", subtitle: "Bring ticket prices back down. Your show. Your crowd.", href: "/venues/sell", status: "live", layoutMode: "billboard", mediaMode: "preview", accentColor: "#FF2DAA", avatarEmoji: "📈" },

  // Fan lobby wall
  { id: "fan-lobby-1", kind: "fan-lobby-wall", title: "Fan Discovery Lobby", subtitle: "42 fans online · Find your crew", href: "/live/lobby/fans", status: "live", layoutMode: "audience-grid", mediaMode: "avatar", accentColor: "#00FFFF", avatarEmoji: "👥", viewerCount: 42 },
  { id: "fan-lobby-2", kind: "fan-lobby-wall", title: "Looking for Group", subtitle: "16 fans searching · Invite anyone", href: "/live/lobby/fans", status: "live", layoutMode: "audience-grid", mediaMode: "avatar", accentColor: "#00FFFF", avatarEmoji: "🤝", viewerCount: 16 },

  // Performer lobby wall
  { id: "perf-lobby-1", kind: "performer-lobby-wall", title: "Performer Connect Lobby", subtitle: "18 performers looking to collab", href: "/live/lobby/performers", status: "live", layoutMode: "audience-grid", mediaMode: "webrtc", accentColor: "#FF2DAA", avatarEmoji: "🎤", viewerCount: 18 },
  { id: "perf-lobby-2", kind: "performer-lobby-wall", title: "Collab Crew — Open", subtitle: "Cypher + battle setups forming now", href: "/live/lobby/performers", status: "live", layoutMode: "audience-grid", mediaMode: "webrtc", accentColor: "#FF2DAA", avatarEmoji: "🎸", viewerCount: 9 },

  // Mixed lobby wall
  { id: "mix-lobby-1", kind: "mixed-lobby-wall", title: "Discovery Bridge", subtitle: "60+ fans & performers · Meet your match", href: "/live/lobby", status: "live", layoutMode: "audience-grid", mediaMode: "avatar", accentColor: "#AA2DFF", avatarEmoji: "🌐", viewerCount: 63 },
];

// ─── Venue/promoter ticker messages ──────────────────────────────────────────
export const VENUE_TICKER_MESSAGES: string[] = [
  "🎟️ VENUES: SELL YOUR TICKETS HERE",
  "🏟️ PROMOTERS: ZERO TMI PLATFORM FEES",
  "💸 BRING TICKET PRICES BACK DOWN",
  "🔥 YOUR SHOW. YOUR CROWD. YOUR TICKETS.",
  "📈 LOWER FEES = BIGGER CROWDS",
  "🎤 BOOK ARTISTS. LIST EVENTS. SELL OUT.",
  "🚀 LIST YOUR SHOW TODAY — THE INDEX",
];

// ─── Deck sequences per surface ───────────────────────────────────────────────

// Home 3 — audience/observational world
export const HOME3_DECK_SEQUENCE: BroadcastFeedKind[] = [
  "audience-seat",
  "live-camera",
  "fan-lobby-wall",
  "cypher",
  "battle",
  "performer-lobby-wall",
  "challenge",
  "concert",
  "mixed-lobby-wall",
  "world-premiere",
  "album-release",
  "game-show",
];

// Home 5 — competition/arena world
export const HOME5_DECK_SEQUENCE: BroadcastFeedKind[] = [
  "battle",
  "cypher",
  "challenge",
  "game-show",
  "sponsor-billboard",
  "live-camera",
  "world-premiere",
  "concert",
  "magazine-feature",
  "venue-ticketing",
];

// XP toast messages
export const XP_TOASTS: { kind: BroadcastFeedKind; message: string }[] = [
  { kind: "battle",    message: "⚔️ Next XP battle starting — join now" },
  { kind: "cypher",   message: "🎤 Cypher room opening — get in line" },
  { kind: "challenge",message: "🎵 Song challenge live — submit your track" },
  { kind: "game-show",message: "🎯 Game show starting — prizes on the line" },
  { kind: "concert",  message: "🌍 World premiere about to start" },
  { kind: "challenge",message: "💃 Dance challenge live — record your move" },
  { kind: "challenge",message: "😂 Comedy round coming up — get ready" },
];

// ─── Hook: useBroadcastRotation ───────────────────────────────────────────────

export interface BroadcastRotationState {
  currentKind: BroadcastFeedKind;
  currentLabel: string;
  currentFeeds: BroadcastFeedItem[];
  deckIndex: number;
  transitioning: boolean;
  toast: string | null;
  allFeeds: BroadcastFeedItem[];
}

export function useBroadcastRotation(
  sequence: BroadcastFeedKind[],
  intervalMs = 13000
): BroadcastRotationState {
  const [deckIndex, setDeckIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const prevIndex = useRef(0);

  const currentKind = sequence[deckIndex % sequence.length] as BroadcastFeedKind;
  const currentLabel = DECK_LABELS[currentKind];
  const currentFeeds = SEED_FEEDS.filter((f) => f.kind === currentKind);

  useEffect(() => {
    const id = setInterval(() => {
      // Crossfade out
      setTransitioning(true);

      // Show toast for next high-XP deck
      const nextIdx = (deckIndex + 1) % sequence.length;
      const nextKind = sequence[nextIdx] as BroadcastFeedKind;
      const xpToast = XP_TOASTS.find((t) => t.kind === nextKind);
      const nextIsHighXP = SEED_FEEDS.some((f) => f.kind === nextKind && f.isHighXP);
      if (xpToast && nextIsHighXP) {
        setToast(xpToast.message);
        setTimeout(() => setToast(null), 4500);
      }

      setTimeout(() => {
        setDeckIndex((i) => {
          const next = (i + 1) % sequence.length;
          prevIndex.current = i;
          return next;
        });
        setTransitioning(false);
      }, 280);
    }, intervalMs);
    return () => clearInterval(id);
  }, [deckIndex, sequence, intervalMs]);

  return {
    currentKind,
    currentLabel,
    currentFeeds,
    deckIndex,
    transitioning,
    toast,
    allFeeds: SEED_FEEDS,
  };
}

// ─── Helper: getFeeds by kind ─────────────────────────────────────────────────

export function getFeedsByKind(kind: BroadcastFeedKind): BroadcastFeedItem[] {
  return SEED_FEEDS.filter((f) => f.kind === kind);
}

export function getHighXPFeeds(): BroadcastFeedItem[] {
  return SEED_FEEDS.filter((f) => f.isHighXP);
}

// ── Live-First Priority Feed ──────────────────────────────────────────────────
// "Whoever is online owns the screen"
// Priority: real live users → SEED_FEEDS live → SEED_FEEDS fallback
// liveUsers: pass in from your real-time DB / presence layer when available

export interface LiveUserSlot {
  id: string;
  slug: string;
  name: string;
  genre: string;
  viewerCount?: number;
  accentColor?: string;
  avatarEmoji?: string;
  roomHref?: string;
}

export function getPrioritizedFeeds(
  liveUsers: LiveUserSlot[] = [],
  maxTiles = 12,
): BroadcastFeedItem[] {
  // Convert real live users to feed items — they always go first
  const userFeeds: BroadcastFeedItem[] = liveUsers.map((u) => ({
    id: `live-user-${u.id}`,
    kind: "live-camera" as const,
    title: u.name,
    subtitle: `${u.genre} · Live Now`,
    href: u.roomHref ?? `/live/lobby`,
    genre: u.genre,
    status: "live" as const,
    layoutMode: "single" as const,
    mediaMode: "webrtc" as const,
    accentColor: u.accentColor ?? "#FF2DAA",
    avatarEmoji: u.avatarEmoji ?? "🎤",
    viewerCount: u.viewerCount ?? 1,
    shape: "octagon" as const,
    isHighXP: true,
  }));

  // Fill remaining slots from SEED_FEEDS: live items first, then fallbacks
  const seedLive     = SEED_FEEDS.filter((f) => f.status === "live");
  const seedFallback = SEED_FEEDS.filter((f) => f.status !== "live");

  const combined = [...userFeeds, ...seedLive, ...seedFallback];

  // Deduplicate by id
  const seen = new Set<string>();
  const deduped = combined.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });

  return deduped.slice(0, maxTiles);
}

