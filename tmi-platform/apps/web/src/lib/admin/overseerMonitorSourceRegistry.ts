/**
 * Canonical Overseer monitor source types + live discovery index.
 * Monitors subscribe to GlobalLiveSessionRegistry — no separate fake admin feed.
 */

import type { LiveSession, StreamCategory } from "@/lib/broadcast/globalLiveSessionStore";
import { getActiveSessions, onSessionsChanged } from "@/lib/broadcast/GlobalLiveSessionRegistry";

export type OverseerSourceType =
  | "LIVE_SESSION"
  | "ROOM_RUNTIME"
  | "LIVE_LOBBY_WALL"
  | "PERFORMER_FEED"
  | "VENUE_CAMERA"
  | "SYSTEM_ROOM"
  | "BOARD_ROOM"
  | "SCREEN_SHARE"
  | "PRESENTATION"
  | "ADMIN_DATA_SURFACE";

export type OverseerSourceCategory =
  | "LIVE NOW"
  | "PERFORMERS"
  | "BATTLES"
  | "CYPHERS"
  | "CHALLENGES"
  | "BOT ROOMS"
  | "LOBBY WALL"
  | "BOARD ROOM"
  | "ADMIN CAST";

export type OverseerMonitorSource = {
  id: string;
  label: string;
  type: OverseerSourceType;
  category: OverseerSourceCategory;
  accent: string;
  roomId?: string;
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
  viewerCount?: number;
  isLive: boolean;
  /** ADMIN_DATA_SURFACE must be manually cast — never auto-assigned */
  manualOnly?: boolean;
  detail?: string;
};

const BOT_HOST_SOURCES: OverseerMonitorSource[] = [
  {
    id: "bot-julius",
    label: "Julius · Host",
    type: "SYSTEM_ROOM",
    category: "BOT ROOMS",
    accent: "#FFD700",
    roomId: "host-julius",
    isLive: false,
    detail: "Official host bot room — assign to watch when live.",
  },
  {
    id: "bot-record-ralph",
    label: "Record Ralph · DJ",
    type: "SYSTEM_ROOM",
    category: "BOT ROOMS",
    accent: "#00FFFF",
    roomId: "world-dance-party",
    isLive: false,
    detail: "World Dance Party bot host — registry-linked.",
  },
];

function categoryForSession(session: LiveSession): OverseerSourceCategory {
  if (session.category === "battle") return "BATTLES";
  if (session.category === "cypher") return "CYPHERS";
  if (session.category === "challenge") return "CHALLENGES";
  if (session.category === "lounge") return "LOBBY WALL";
  return "PERFORMERS";
}

function typeForSession(session: LiveSession): OverseerSourceType {
  if (session.category === "lounge") return "LIVE_LOBBY_WALL";
  return "LIVE_SESSION";
}

export function liveSessionToSource(session: LiveSession): OverseerMonitorSource {
  return {
    id: `live:${session.roomId}`,
    label: session.title || session.displayName || session.roomId,
    type: typeForSession(session),
    category: categoryForSession(session),
    accent: session.accentColor || "#00FFFF",
    roomId: session.roomId,
    previewUrl: session.previewUrl,
    thumbnailUrl: session.thumbnailUrl,
    viewerCount: session.viewerCount,
    isLive: session.stageState === "live",
    detail: `${session.category.toUpperCase()} · ${session.displayName}`,
  };
}

export function buildLiveDiscoveryIndex(sessions: LiveSession[] = getActiveSessions()): OverseerMonitorSource[] {
  const live = sessions.filter((s) => s.stageState === "live").map(liveSessionToSource);
  const bots = BOT_HOST_SOURCES.map((b) => {
    const match = sessions.find((s) => s.roomId === b.roomId && s.stageState === "live");
    if (!match) return b;
    return { ...liveSessionToSource(match), id: b.id, label: b.label, category: "BOT ROOMS" as const };
  });
  return [...live, ...bots];
}

export function groupSourcesByCategory(
  sources: OverseerMonitorSource[],
): Record<OverseerSourceCategory, OverseerMonitorSource[]> {
  const groups: Record<OverseerSourceCategory, OverseerMonitorSource[]> = {
    "LIVE NOW": [],
    PERFORMERS: [],
    BATTLES: [],
    CYPHERS: [],
    CHALLENGES: [],
    "BOT ROOMS": [],
    "LOBBY WALL": [],
    "BOARD ROOM": [],
    "ADMIN CAST": [],
  };
  for (const src of sources) {
    if (src.category === "PERFORMERS" || src.category === "BATTLES" || src.category === "CYPHERS" || src.category === "CHALLENGES") {
      groups["LIVE NOW"].push(src);
    }
    groups[src.category].push(src);
  }
  return groups;
}

/** Manual admin surfaces — CAST TO MONITOR only, never auto-routed */
export function boardRoomSources(): OverseerMonitorSource[] {
  return [
    {
      id: "board-room",
      label: "Board Room",
      type: "BOARD_ROOM",
      category: "BOARD ROOM",
      accent: "#AA2DFF",
      isLive: false,
      manualOnly: true,
      detail: "WebRTC board room — explicit cast only.",
    },
  ];
}

export function adminDataSurfaceSources(): OverseerMonitorSource[] {
  return [
    {
      id: "admin:revenue-snapshot",
      label: "Revenue Snapshot",
      type: "ADMIN_DATA_SURFACE",
      category: "ADMIN CAST",
      accent: "#FFD700",
      isLive: false,
      manualOnly: true,
      detail: "Explicit cast — revenue panel mirror.",
    },
    {
      id: "admin:bot-ops",
      label: "Bot Ops Deck",
      type: "ADMIN_DATA_SURFACE",
      category: "ADMIN CAST",
      accent: "#FF2DAA",
      isLive: false,
      manualOnly: true,
      detail: "Explicit cast — bot roster telemetry.",
    },
  ];
}

export function allPickerSources(sessions?: LiveSession[]): OverseerMonitorSource[] {
  return [...buildLiveDiscoveryIndex(sessions), ...boardRoomSources(), ...adminDataSurfaceSources()];
}

export function getSourceById(
  sourceId: string | null,
  sessions?: LiveSession[],
): OverseerMonitorSource | null {
  if (!sourceId) return null;
  return allPickerSources(sessions).find((s) => s.id === sourceId) ?? null;
}

export function subscribeLiveDiscovery(onChange: (sources: OverseerMonitorSource[]) => void): () => void {
  const emit = () => onChange(allPickerSources());
  emit();
  return onSessionsChanged(() => emit());
}

export function filterSessionsByCategory(
  sessions: LiveSession[],
  category: StreamCategory,
): LiveSession[] {
  return sessions.filter((s) => s.category === category && s.stageState === "live");
}
