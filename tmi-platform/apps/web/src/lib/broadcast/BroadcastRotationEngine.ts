"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { BroadcastFeedItem, BroadcastFeedKind } from "@/types/broadcast";
import { DECK_LABELS } from "@/types/broadcast";
import { SEED_FEEDS } from "./BroadcastSeedFeeds";

export { SEED_FEEDS };

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
  "stream-and-win",
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
  { kind: "stream-and-win", message: "🎵 Stream & Win live — listen to enter" },
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

