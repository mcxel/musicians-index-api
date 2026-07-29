/**
 * AutoDirectorRegistry — Flight Deck idle-monitor discovery (Phase 3.x / 4.8).
 *
 * Content sources resolve from ExperienceRegistry.entryRoute (and a few real
 * discovery routes that are not yet EOS experiences). No fabricated schedules,
 * viewer counts, or “opponent found” signals — Rule 20.
 *
 * Matchmaking / room-merge is LOCKED FUTURE (see TODO.md) — not implemented here.
 */

import { getExperienceById } from "./ExperienceRegistry";
import type { MonitorContentType } from "@/core/eos/monitorAssignment";

/** Discovery lane for Auto-Director rotation (priority-weighted). */
export type AutoDirectorLane =
  | "STARTING_SOON"
  | "LIVE_EXPERIENCE"
  | "VOCAL_IMPROV"
  | "BATTLE"
  | "CYPHER"
  | "CHALLENGE"
  | "DIRTY_DOZENS"
  | "JOKE_OFF"
  | "DANCE_OFF"
  | "OFFICIAL_SHOW"
  | "LOBBY";

export interface AutoDirectorContentSource {
  id: string;
  lane: AutoDirectorLane;
  contentType: Extract<MonitorContentType, "EXPERIENCE" | "LIVE_PREVIEW">;
  /** ExperienceRegistry id when contentType is EXPERIENCE */
  experienceId?: string;
  /** Fallback / non-EOS route when experienceId is absent or unresolved */
  href?: string;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  /** Lane weight contribution (higher = more often selected) */
  weight: number;
}

export interface AutoDirectorLaneWeight {
  lane: AutoDirectorLane;
  weight: number;
  /** Hint only — engine may rotate on this cadence; not a fake schedule */
  rotationCadenceMsHint: number;
}

/** Lane priority weights + rotation cadence hints (not a live scheduler). */
export const AUTO_DIRECTOR_LANE_WEIGHTS: readonly AutoDirectorLaneWeight[] = [
  { lane: "LIVE_EXPERIENCE", weight: 100, rotationCadenceMsHint: 20_000 },
  { lane: "STARTING_SOON", weight: 90, rotationCadenceMsHint: 25_000 },
  { lane: "BATTLE", weight: 80, rotationCadenceMsHint: 30_000 },
  { lane: "CYPHER", weight: 75, rotationCadenceMsHint: 30_000 },
  { lane: "VOCAL_IMPROV", weight: 70, rotationCadenceMsHint: 35_000 },
  { lane: "CHALLENGE", weight: 65, rotationCadenceMsHint: 35_000 },
  { lane: "DIRTY_DOZENS", weight: 60, rotationCadenceMsHint: 40_000 },
  { lane: "JOKE_OFF", weight: 55, rotationCadenceMsHint: 40_000 },
  { lane: "DANCE_OFF", weight: 55, rotationCadenceMsHint: 40_000 },
  { lane: "OFFICIAL_SHOW", weight: 50, rotationCadenceMsHint: 45_000 },
  { lane: "LOBBY", weight: 40, rotationCadenceMsHint: 45_000 },
] as const;

/**
 * Discovery catalog. EXPERIENCE rows prefer ExperienceRegistry.entryRoute at
 * resolve time. Non-EOS hrefs must be real app routes (never href="#").
 */
export const AUTO_DIRECTOR_CONTENT_SOURCES: readonly AutoDirectorContentSource[] = [
  {
    id: "battle",
    lane: "BATTLE",
    contentType: "EXPERIENCE",
    experienceId: "battle",
    title: "Battle Arena",
    subtitle: "Head-to-head — crowd votes the winner",
    icon: "⚔️",
    accentColor: "#FF2DAA",
    weight: 80,
  },
  {
    id: "cypher",
    lane: "CYPHER",
    contentType: "EXPERIENCE",
    experienceId: "cypher",
    title: "Cypher Circle",
    subtitle: "Open circle — every bar counts",
    icon: "🔄",
    accentColor: "#00FFFF",
    weight: 75,
  },
  {
    id: "challenge",
    lane: "CHALLENGE",
    contentType: "EXPERIENCE",
    experienceId: "challenge",
    title: "Challenge Arena",
    subtitle: "Producer & artist challenge rooms",
    icon: "🏆",
    accentColor: "#FFD700",
    weight: 65,
  },
  {
    id: "jazz-scat-battle",
    lane: "VOCAL_IMPROV",
    contentType: "EXPERIENCE",
    experienceId: "jazz-scat-battle",
    title: "Jazz Scat Battle",
    subtitle: "Vocal improv — scat vs scat",
    icon: "🎷",
    accentColor: "#FFD700",
    weight: 70,
  },
  {
    id: "gibberish-battle",
    lane: "VOCAL_IMPROV",
    contentType: "EXPERIENCE",
    experienceId: "gibberish-battle",
    title: "Gibberish Battle",
    subtitle: "Vocal improv — nonsense energy duel",
    icon: "🗣️",
    accentColor: "#00FFFF",
    weight: 70,
  },
  {
    id: "monday-night-stage",
    lane: "OFFICIAL_SHOW",
    contentType: "EXPERIENCE",
    experienceId: "monday-night-stage",
    title: "Monday Night Stage",
    subtitle: "Weekly flagship performance show",
    icon: "🎤",
    accentColor: "#FF2DAA",
    weight: 50,
  },
  {
    id: "deal-or-feud",
    lane: "OFFICIAL_SHOW",
    contentType: "EXPERIENCE",
    experienceId: "deal-or-feud",
    title: "Deal or Feud 1000",
    subtitle: "Game show — risk it all",
    icon: "🎰",
    accentColor: "#FFD700",
    weight: 50,
  },
  {
    id: "world-dance-party",
    lane: "LIVE_EXPERIENCE",
    contentType: "EXPERIENCE",
    experienceId: "world-dance-party",
    title: "World Dance Party",
    subtitle: "Global dance floor — join the party",
    icon: "💃",
    accentColor: "#FF2DAA",
    weight: 90,
  },
  {
    id: "fan-lobby",
    lane: "LOBBY",
    contentType: "EXPERIENCE",
    experienceId: "fan-lobby",
    title: "Fan Lobby",
    subtitle: "Social hangout — fans only",
    icon: "👥",
    accentColor: "#AA2DFF",
    weight: 40,
  },
  {
    id: "lounge",
    lane: "LOBBY",
    contentType: "EXPERIENCE",
    experienceId: "lounge",
    title: "VIP Lounge",
    subtitle: "Video-window social lounge",
    icon: "🛋️",
    accentColor: "#AA2DFF",
    weight: 40,
  },
  // Real discovery routes (not yet ExperienceRegistry entries — href only)
  {
    id: "dirty-dozens",
    lane: "DIRTY_DOZENS",
    contentType: "LIVE_PREVIEW",
    href: "/dirty-dozens",
    title: "Dirty Dozens",
    subtitle: "Championship roast battles",
    icon: "👑",
    accentColor: "#FFD700",
    weight: 60,
  },
  {
    id: "joke-off",
    lane: "JOKE_OFF",
    contentType: "LIVE_PREVIEW",
    href: "/battles",
    title: "Joke-Off",
    subtitle: "Comedy battles — enter via Battles",
    icon: "😂",
    accentColor: "#FF9500",
    weight: 55,
  },
  {
    id: "dance-off",
    lane: "DANCE_OFF",
    contentType: "LIVE_PREVIEW",
    href: "/battles/create",
    title: "Dance-Off",
    subtitle: "Create or join a dance-off",
    icon: "💃",
    accentColor: "#00FFFF",
    weight: 55,
  },
  {
    id: "live-lobby",
    lane: "STARTING_SOON",
    contentType: "LIVE_PREVIEW",
    href: "/live/lobby",
    title: "Live Lobby",
    subtitle: "Rooms starting soon & live now",
    icon: "🎪",
    accentColor: "#00FFFF",
    weight: 90,
  },
  {
    id: "battles-lobby-wall",
    lane: "LIVE_EXPERIENCE",
    contentType: "LIVE_PREVIEW",
    href: "/battles/lobby-wall",
    title: "Battles Live Wall",
    subtitle: "Every battle happening now",
    icon: "🧱",
    accentColor: "#FF2DAA",
    weight: 85,
  },
  {
    id: "cypher-lobby-wall",
    lane: "LIVE_EXPERIENCE",
    contentType: "LIVE_PREVIEW",
    href: "/cypher/lobby-wall",
    title: "Cypher Live Wall",
    subtitle: "Every cypher happening now",
    icon: "🧱",
    accentColor: "#00FFFF",
    weight: 80,
  },
] as const;

export interface ResolvedAutoDirectorPreview {
  id: string;
  lane: AutoDirectorLane;
  contentType: Extract<MonitorContentType, "EXPERIENCE" | "LIVE_PREVIEW">;
  contentId: string;
  entryRoute: string;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  /** Combined lane + source weight for pickNextContent */
  priority: number;
}

function laneWeight(lane: AutoDirectorLane): number {
  return AUTO_DIRECTOR_LANE_WEIGHTS.find((w) => w.lane === lane)?.weight ?? 1;
}

/**
 * Resolve registry rows to clickable previews with real entryRoutes.
 * Drops rows that cannot resolve a route (never invents fake destinations).
 */
export function resolveAutoDirectorPreviews(): ResolvedAutoDirectorPreview[] {
  const out: ResolvedAutoDirectorPreview[] = [];

  for (const src of AUTO_DIRECTOR_CONTENT_SOURCES) {
    let entryRoute: string | undefined;
    let contentId = src.id;

    if (src.experienceId) {
      const exp = getExperienceById(src.experienceId);
      if (exp?.entryRoute?.startsWith("/")) {
        entryRoute = exp.entryRoute;
        contentId = exp.id;
      }
    }
    if (!entryRoute && src.href?.startsWith("/")) {
      entryRoute = src.href;
    }
    if (!entryRoute) continue;

    out.push({
      id: src.id,
      lane: src.lane,
      contentType: src.contentType,
      contentId,
      entryRoute,
      title: src.title,
      subtitle: src.subtitle,
      icon: src.icon,
      accentColor: src.accentColor,
      priority: laneWeight(src.lane) + src.weight,
    });
  }

  return out;
}

export function getAutoDirectorDefaultCadenceMs(): number {
  const weights = AUTO_DIRECTOR_LANE_WEIGHTS;
  if (weights.length === 0) return 30_000;
  const sum = weights.reduce((acc, w) => acc + w.rotationCadenceMsHint, 0);
  return Math.round(sum / weights.length);
}

export function assertAutoDirectorRegistryIntegrity(): void {
  const previews = resolveAutoDirectorPreviews();
  if (previews.length === 0) {
    throw new Error("AutoDirectorRegistry: no resolvable discovery previews");
  }
  for (const p of previews) {
    if (!p.entryRoute.startsWith("/")) {
      throw new Error(`AutoDirectorRegistry: invalid entryRoute for ${p.id}`);
    }
  }
}
