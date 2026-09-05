"use client";

import { useState, useEffect, useRef } from "react";
import type { BroadcastFeedItem, BroadcastFeedKind } from "@/types/broadcast";
import { DECK_LABELS } from "@/types/broadcast";
import { TIMING } from "@/lib/motion/timingRegistry";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import {
  discoveryRecordToHomeOrbitCard,
  filterHomeOrbitEligibleRecords,
  sortHomeOrbitPool,
} from "@/lib/discovery/HomeDiscoveryRotationEngine";
import { SEED_FEEDS } from "./BroadcastSeedFeeds";

/** Canonical home broadcast deck rotation interval (Marcel lock — 13s). */
export const HOME_BROADCAST_ROTATION_MS = TIMING.broadcastDeckRotation;

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

export interface BroadcastRotationOptions {
  /** When provided, discovery feeds replace SEED_FEEDS for the active kind. */
  discoveryRecords?: readonly LiveDiscoveryRecord[];
}

export function useBroadcastRotation(
  sequence: BroadcastFeedKind[],
  intervalMs: number = HOME_BROADCAST_ROTATION_MS,
  options?: BroadcastRotationOptions,
): BroadcastRotationState {
  const [deckIndex, setDeckIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const prevIndex = useRef(0);
  const discoveryRecords = options?.discoveryRecords;

  const currentKind = sequence[deckIndex % sequence.length] as BroadcastFeedKind;
  const currentLabel = DECK_LABELS[currentKind];
  const discoveryFeeds = discoveryRecords?.length
    ? discoveryRecordsToBroadcastFeeds(discoveryRecords).filter((f) => f.kind === currentKind)
    : [];
  // Seed-free (Rule 20): honest empty when no live discovery records for this kind.
  const currentFeeds = discoveryFeeds;

  useEffect(() => {
    const id = setInterval(() => {
      setTransitioning(true);

      const nextIdx = (deckIndex + 1) % sequence.length;
      const nextKind = sequence[nextIdx] as BroadcastFeedKind;
      const xpToast = XP_TOASTS.find((t) => t.kind === nextKind);
      const nextDiscoveryHighXp = discoveryRecords?.some(
        (r) => mapDiscoveryCategoryToFeedKind(r.category) === nextKind &&
          (r.category === "battles" || r.category === "cyphers"),
      );
      if (xpToast && nextDiscoveryHighXp) {
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

  const allFeeds = discoveryRecords?.length
    ? discoveryRecordsToBroadcastFeeds(discoveryRecords)
    : [];

  return {
    currentKind,
    currentLabel,
    currentFeeds,
    deckIndex,
    transitioning,
    toast,
    allFeeds,
  };
}

// ─── Helper: getFeeds by kind ─────────────────────────────────────────────────

export function getFeedsByKind(kind: BroadcastFeedKind): BroadcastFeedItem[] {
  return SEED_FEEDS.filter((f) => f.kind === kind);
}

export function getHighXPFeeds(): BroadcastFeedItem[] {
  return SEED_FEEDS.filter((f) => f.isHighXP);
}

/** Map canonical discovery records → BroadcastFeedItem tiles (Home surfaces). */
export function discoveryRecordsToBroadcastFeeds(
  records: readonly LiveDiscoveryRecord[],
  maxTiles = 12,
): BroadcastFeedItem[] {
  const pool = sortHomeOrbitPool(filterHomeOrbitEligibleRecords(records));
  return pool.slice(0, maxTiles).map((record) => {
    const card = discoveryRecordToHomeOrbitCard(record);
    const kind = mapDiscoveryCategoryToFeedKind(record.category);
    return {
      id: `discovery-${record.roomId}`,
      kind,
      title: card.title,
      subtitle: `${card.hostName} · ${card.participantCount} watching`,
      href: card.exactJoinTarget,
      roomId: card.roomId,
      genre: record.category,
      status: record.recruiting ? ("scheduled" as const) : ("live" as const),
      layoutMode: "single" as const,
      mediaMode: record.previewUrl ? ("preview" as const) : ("avatar" as const),
      accentColor: card.accentColor,
      viewerCount: card.participantCount,
      shape: "octagon" as const,
      isHighXP: record.category === "battles" || record.category === "cyphers",
    };
  });
}

function mapDiscoveryCategoryToFeedKind(category: LiveDiscoveryRecord["category"]): BroadcastFeedKind {
  if (category === "battles") return "battle";
  if (category === "cyphers") return "cypher";
  if (category === "challenges") return "challenge";
  if (category === "games") return "game-show";
  if (category === "concerts") return "concert";
  if (category === "fan_lobbies") return "fan-lobby-wall";
  if (category === "lounges" || category === "listening") return "mixed-lobby-wall";
  return "live-camera";
}

// ── Live-First Priority Feed ──────────────────────────────────────────────────
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
  discoveryRecords: readonly LiveDiscoveryRecord[] = [],
): BroadcastFeedItem[] {
  const discoveryFeeds = discoveryRecords.length
    ? discoveryRecordsToBroadcastFeeds(discoveryRecords, maxTiles)
    : [];

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
    viewerCount: u.viewerCount ?? 0,
    shape: "octagon" as const,
    isHighXP: true,
  }));

  const combined = [...userFeeds, ...discoveryFeeds];
  const seedLive = discoveryFeeds.length === 0 ? SEED_FEEDS.filter((f) => f.status === "live") : [];
  const seedFallback = discoveryFeeds.length === 0 ? SEED_FEEDS.filter((f) => f.status !== "live") : [];

  const seen = new Set<string>();
  const deduped = [...combined, ...seedLive, ...seedFallback].filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });

  return deduped.slice(0, maxTiles);
}

