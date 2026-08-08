/**
 * PreviewSurfaceRuntime.ts — Phase 5.4 Production UX Convergence
 * Canonical Preview Surface & Rotation Engine for Living OS Monitors.
 *
 * Enforces Rule 1 (No Prototype Assets in Production) & Rule 9 (Media Monitor Rotation).
 * Replaces static looping stage images with a dynamic rotation of live platform content:
 *   BATTLES → CYPHERS → CHALLENGES → CONCERTS → MONDAY NIGHT STAGE →
 *   DEAL OR FEUD → MAGAZINE PROMOS → YOPHO CARDS → SPONSORS
 *
 * Automatically interrupts preview rotation when a live WebRTC broadcast or match begins.
 */

export type PreviewSurfaceItemType =
  | "battle"
  | "cypher"
  | "challenge"
  | "concert"
  | "monday_night_stage"
  | "deal_or_feud"
  | "magazine"
  | "yopho"
  | "sponsor"
  | "live_stream";

import { getGovernedIdleFallbackPolicy } from "@/lib/adaptiveWorldRuntime/IdleFallbackGovernor";

export interface PreviewSurfaceItem {
  id: string;
  type: PreviewSurfaceItemType;
  title: string;
  subtitle: string;
  mediaUrl?: string;
  posterUrl?: string;
  accentColor: string;
  badgeText: string;
  actionRoute?: string;
  durationMs: number;
}

export const CANONICAL_PREVIEW_ROTATION: PreviewSurfaceItem[] = [
  {
    id: "prev-battle-1",
    type: "battle",
    title: "BEAT BATTLE CHAMPIONSHIP",
    subtitle: "California vs Texas · West Coast Regionals",
    mediaUrl: "/assets/videos/rooms/monday-night-stage.mp4",
    posterUrl: "/assets/images/showcase/battle-stage.jpg",
    accentColor: "#FF2DAA",
    badgeText: "BATTLE PREVIEW",
    actionRoute: "/games/battle-stage",
    durationMs: 8000,
  },
  {
    id: "prev-cypher-1",
    type: "cypher",
    title: "FREESTYLE CYPHER ARENA",
    subtitle: "21-Stage Round-Robin Beat Passing",
    mediaUrl: "/assets/videos/rooms/cypher-arena.mp4",
    posterUrl: "/assets/images/showcase/cypher-arena.jpg",
    accentColor: "#00FFFF",
    badgeText: "CYPHER PREVIEW",
    actionRoute: "/live/lobby",
    durationMs: 8000,
  },
  {
    id: "prev-challenge-1",
    type: "challenge",
    title: "MEDIA LOCKER SONG CHALLENGE",
    subtitle: "Best-of-Three Series · Media Locker Submissions",
    posterUrl: "/assets/images/showcase/challenge-arena.jpg",
    accentColor: "#FFD700",
    badgeText: "SONG CHALLENGE",
    actionRoute: "/hub/performer",
    durationMs: 8000,
  },
  {
    id: "prev-concert-1",
    type: "concert",
    title: "ARENA CONCERT EXPERIENCE",
    subtitle: "18-State Live Broadcast · Commercial OS",
    posterUrl: "/assets/images/showcase/concert-arena.jpg",
    accentColor: "#AA2DFF",
    badgeText: "CONCERT PREVIEW",
    actionRoute: "/live/lobby",
    durationMs: 8000,
  },
  {
    id: "prev-monday-stage-1",
    type: "monday_night_stage",
    title: "MONDAY NIGHT LIVE STAGE",
    subtitle: "Weekly Primetime Showcase & Crown Battles",
    mediaUrl: "/assets/videos/rooms/monday-night-stage.mp4",
    accentColor: "#00FF88",
    badgeText: "STAGE PREVIEW",
    actionRoute: "/live/lobby",
    durationMs: 8000,
  },
  {
    id: "prev-deal-feud-1",
    type: "deal_or_feud",
    title: "DEAL OR FEUD GAME SHOW",
    subtitle: "Interactive Commercial Showdown & Record Deal Bids",
    accentColor: "#FF6B1A",
    badgeText: "GAME SHOW",
    actionRoute: "/games",
    durationMs: 8000,
  },
  {
    id: "prev-magazine-1",
    type: "magazine",
    title: "TMI MAGAZINE COVER FEATURE",
    subtitle: "Spotlight Article · Independent Artist Index",
    accentColor: "#00FFFF",
    badgeText: "MAGAZINE PREVIEW",
    actionRoute: "/magazine/1",
    durationMs: 8000,
  },
  {
    id: "prev-yopho-1",
    type: "yopho",
    title: "YOPHO DIGITAL COLLECTIBLES",
    subtitle: "Interactive Cards · Audio Artifacts & Proof of Release",
    accentColor: "#FF2DAA",
    badgeText: "YOPHO SPOTLIGHT",
    actionRoute: "/hub/fan",
    durationMs: 8000,
  },
  {
    id: "prev-sponsor-1",
    type: "sponsor",
    title: "SPONSOR SHOWCASE · NIKE",
    subtitle: "Official Presentation Partner · California vs Texas",
    accentColor: "#FFD700",
    badgeText: "SPONSOR SPOTLIGHT",
    actionRoute: "/sponsors/advertise",
    durationMs: 8000,
  },
];

function governedRotationPool(): PreviewSurfaceItem[] {
  const policy = getGovernedIdleFallbackPolicy();
  if (policy.allowMonitorVideoRotation) {
    return CANONICAL_PREVIEW_ROTATION;
  }
  return CANONICAL_PREVIEW_ROTATION.map((item) =>
    item.mediaUrl ? { ...item, mediaUrl: undefined } : item,
  );
}

export class PreviewSurfaceRuntime {
  private static instance: PreviewSurfaceRuntime | null = null;
  private currentIndex: number = 0;
  private isLiveActive: boolean = false;
  private liveStreamItem: PreviewSurfaceItem | null = null;
  private listeners: Set<(item: PreviewSurfaceItem) => void> = new Set();
  private timerId: number | null = null;

  private constructor() {}

  public static getInstance(): PreviewSurfaceRuntime {
    if (!PreviewSurfaceRuntime.instance) {
      PreviewSurfaceRuntime.instance = new PreviewSurfaceRuntime();
    }
    return PreviewSurfaceRuntime.instance;
  }

  public subscribe(listener: (item: PreviewSurfaceItem) => void): () => void {
    this.listeners.add(listener);
    listener(this.getCurrentItem());
    if (!this.timerId && !this.isLiveActive) {
      this.startRotation();
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopRotation();
      }
    };
  }

  public getCurrentItem(): PreviewSurfaceItem {
    if (this.isLiveActive && this.liveStreamItem) {
      return this.liveStreamItem;
    }
    const pool = governedRotationPool();
    return pool[this.currentIndex % pool.length] ?? pool[0]!;
  }

  public setLiveActive(active: boolean, liveStreamInfo?: Partial<PreviewSurfaceItem>): void {
    this.isLiveActive = active;
    if (active) {
      this.stopRotation();
      this.liveStreamItem = {
        id: `live-stream-${Date.now()}`,
        type: "live_stream",
        title: liveStreamInfo?.title ?? "LIVE BROADCAST",
        subtitle: liveStreamInfo?.subtitle ?? "Stage Feed Active",
        mediaUrl: liveStreamInfo?.mediaUrl,
        posterUrl: liveStreamInfo?.posterUrl,
        accentColor: "#00FF88",
        badgeText: "LIVE NOW 🔴",
        actionRoute: liveStreamInfo?.actionRoute ?? "/live/go",
        durationMs: 0,
      };
    } else {
      this.liveStreamItem = null;
      this.startRotation();
    }
    this.notify();
  }

  public nextItem(): void {
    if (this.isLiveActive) return;
    const pool = governedRotationPool();
    if (pool.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % pool.length;
    this.notify();
  }

  private startRotation(): void {
    this.stopRotation();
    if (typeof window === "undefined") return;
    const policy = getGovernedIdleFallbackPolicy();
    const intervalMs = Math.max(policy.rotationIntervalMs, 4000);
    this.timerId = window.setInterval(() => {
      this.nextItem();
    }, intervalMs);
  }

  private stopRotation(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private notify(): void {
    const item = this.getCurrentItem();
    this.listeners.forEach((l) => l(item));
  }
}

export const previewSurfaceRuntime = PreviewSurfaceRuntime.getInstance();
