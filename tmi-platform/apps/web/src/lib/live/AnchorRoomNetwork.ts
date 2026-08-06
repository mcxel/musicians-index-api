/**
 * Elastic 24/7 Anchor Room Network — permanent Live Lobby Wall rooms.
 *
 * Locked model (Marcel): 12 anchors always on the wall (even at 0 humans).
 * Overflow rooms spawn only from real capacity signals; anchors never shut down.
 * Support agents never inflate human viewers / votes / rankings / revenue (Rule 20).
 *
 * Assembles onto LiveRoomEngine + DiscoveryPublisher — not a parallel venue runtime.
 */

import {
  ensureLiveRoom,
  getLiveRoom,
  type LiveRoom,
  type LiveRoomType,
} from "@/lib/live/LiveRoomEngine";
import { getLivePresenceSnapshot } from "@/lib/live/LivePresenceEngine";
import { getVenueSupportState } from "@/lib/venues/VenueSupportPresenceEngine";
import {
  publishLiveRoom,
  type PublishLiveRoomInput,
} from "@/lib/discovery/DiscoveryPublisher";
import type { LiveDiscoveryCategory, LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import type { LiveRoomRecord } from "@/lib/broadcast/BroadcastQueueRegistry";
import {
  getCapacityForFamily,
  type AnchorRoomFamily,
  type AnchorRoomCapacity,
} from "@/lib/live/AnchorRoomCapacityMatrix";

export type { AnchorRoomFamily } from "@/lib/live/AnchorRoomCapacityMatrix";

// ── Observatory control knobs (read path — not a full admin redesign) ─────────

export const ANCHOR_NETWORK_CONTROLS = {
  /** Soft capacity before overflow consideration (humans only). */
  overflowHumanThreshold: 40,
  /** Soft queue depth before overflow consideration (humans only). */
  overflowQueueThreshold: 8,
  /** Idle featured-category rotation window (ms). */
  idleCategoryRotateMs: 15 * 60 * 1000,
  /** Anchors always listed on Live Lobby Wall. */
  anchorsAlwaysOnWall: true,
  /** Overflow spawn requires real LivePresence capacity — not RoomPopulationEngine seeds. */
  overflowRequiresRealPresence: true,
  /** Day-one capacity matrix source */
  capacityMatrix: "lib/live/AnchorRoomCapacityMatrix.ts",
} as const;

export type AnchorNetworkControlSnapshot = typeof ANCHOR_NETWORK_CONTROLS & {
  anchorCount: number;
  overflowWired: boolean;
  overflowNote: string;
};

export function getAnchorNetworkControlSnapshot(): AnchorNetworkControlSnapshot {
  return {
    ...ANCHOR_NETWORK_CONTROLS,
    anchorCount: ANCHOR_ROOM_DEFS.length,
    overflowWired: false,
    overflowNote:
      "Overflow spawn stubbed until honest human occupancy + queue signals exceed knobs via LivePresenceEngine (RoomPopulationEngine seed counts are never used).",
  };
}

// ── Families ─────────────────────────────────────────────────────────────────

export type AnchorCategorySlot =
  | "rap"
  | "rnb"
  | "rock"
  | "country"
  | "gospel"
  | "edm"
  | "comedy"
  | "dance"
  | "guitar"
  | "producer"
  | "open_genre"
  | "spoken_word"
  | "hip_hop";

export interface AnchorRoomDef {
  roomId: string;
  title: string;
  family: AnchorRoomFamily;
  liveRoomType: LiveRoomType;
  discoveryCategory: LiveDiscoveryCategory;
  streamCategory: string;
  accentColor: string;
  /** Categories that rotate while IDLE (battle / challenge / cypher). */
  rotationPool?: readonly AnchorCategorySlot[];
  /** Cypher open-call target when idle. */
  openCallNeeds?: number;
  openCallRole?: string;
}

export const ANCHOR_ROOM_DEFS: readonly AnchorRoomDef[] = [
  {
    roomId: "anchor-global-fan-lobby",
    title: "Global Fan Avatar Lobby",
    family: "fan_lobby",
    liveRoomType: "venue",
    discoveryCategory: "fan_lobbies",
    streamCategory: "fan_lobby",
    accentColor: "#00FFFF",
  },
  {
    roomId: "anchor-chill-fan-lobby",
    title: "Chill Fan Avatar Lobby",
    family: "fan_lobby",
    liveRoomType: "venue",
    discoveryCategory: "fan_lobbies",
    streamCategory: "fan_lobby",
    accentColor: "#38bdf8",
  },
  {
    roomId: "anchor-thunder-dome-battle",
    title: "Thunder Dome Battle",
    family: "battle",
    liveRoomType: "battle",
    discoveryCategory: "battles",
    streamCategory: "battle",
    accentColor: "#FF2DAA",
    rotationPool: ["rap", "guitar", "dance", "comedy", "rnb", "rock", "producer"],
  },
  {
    roomId: "anchor-open-genre-battle",
    title: "Open Genre Battle Arena",
    family: "battle",
    liveRoomType: "battle",
    discoveryCategory: "battles",
    streamCategory: "battle",
    accentColor: "#FF6B35",
    rotationPool: ["open_genre", "rap", "rnb", "country", "gospel", "edm", "comedy"],
  },
  {
    roomId: "anchor-freestyle-cypher",
    title: "Freestyle Cypher",
    family: "cypher",
    liveRoomType: "cypher",
    discoveryCategory: "cyphers",
    streamCategory: "cypher",
    accentColor: "#AA2DFF",
    openCallNeeds: 3,
    openCallRole: "MCs",
  },
  {
    roomId: "anchor-rotating-genre-cypher",
    title: "Rotating Genre Cypher",
    family: "cypher",
    liveRoomType: "cypher",
    discoveryCategory: "cyphers",
    streamCategory: "cypher",
    accentColor: "#c084fc",
    rotationPool: ["hip_hop", "rnb", "open_genre", "spoken_word"],
    openCallNeeds: 4,
    openCallRole: "voices",
  },
  {
    roomId: "anchor-song-challenge-lab",
    title: "Song Challenge Lab",
    family: "song_challenge",
    liveRoomType: "contest",
    discoveryCategory: "challenges",
    streamCategory: "challenge",
    accentColor: "#FFD700",
    rotationPool: ["rap", "rnb", "rock", "country", "gospel", "edm", "open_genre"],
  },
  {
    roomId: "anchor-rotating-creative-challenge",
    title: "Rotating Creative Challenge",
    family: "creative_challenge",
    liveRoomType: "contest",
    discoveryCategory: "challenges",
    streamCategory: "challenge",
    accentColor: "#FFAB00",
    rotationPool: ["comedy", "dance", "producer", "spoken_word", "open_genre"],
  },
  {
    roomId: "anchor-playlist-listening-lounge",
    title: "Playlist Listening Lounge",
    family: "playlist_lounge",
    liveRoomType: "venue",
    discoveryCategory: "listening",
    streamCategory: "listening",
    accentColor: "#00FF88",
  },
  {
    roomId: "anchor-chill-conversation-lounge",
    title: "Chill Conversation Lounge",
    family: "conversation_lounge",
    liveRoomType: "venue",
    discoveryCategory: "lounges",
    streamCategory: "lounge",
    accentColor: "#7a5cff",
  },
  {
    roomId: "anchor-world-dance-room",
    title: "World Dance Room",
    family: "dance",
    liveRoomType: "event",
    discoveryCategory: "dance",
    streamCategory: "dance",
    accentColor: "#FF1493",
  },
  {
    roomId: "anchor-deal-or-feud-variety",
    title: "Deal or Feud / Variety Room",
    family: "variety",
    liveRoomType: "contest",
    discoveryCategory: "games",
    streamCategory: "game",
    accentColor: "#FFD700",
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  rap: "Rap",
  rnb: "R&B",
  rock: "Rock",
  country: "Country",
  gospel: "Gospel",
  edm: "EDM",
  comedy: "Comedy",
  dance: "Dance",
  guitar: "Guitar",
  producer: "Producer",
  open_genre: "Open Genre",
  spoken_word: "Spoken Word",
  hip_hop: "Hip-Hop",
};

// ── Runtime state (idle rotation + lock) ──────────────────────────────────────

export interface AnchorRuntimeState {
  roomId: string;
  featuredCategory: AnchorCategorySlot | null;
  categoryLocked: boolean;
  lockedAtMs: number | null;
  lastRotatedAtMs: number;
  /** Honest human queue depth when a real queue publisher wires in — else 0. */
  humanQueueCount: number;
  /** Optional now-playing label from a real playlist publisher only. */
  nowPlayingLabel: string | null;
}

const runtime = new Map<string, AnchorRuntimeState>();

function defaultCategory(def: AnchorRoomDef): AnchorCategorySlot | null {
  return def.rotationPool?.[0] ?? null;
}

function getOrInitRuntime(def: AnchorRoomDef): AnchorRuntimeState {
  let state = runtime.get(def.roomId);
  if (!state) {
    state = {
      roomId: def.roomId,
      featuredCategory: defaultCategory(def),
      categoryLocked: false,
      lockedAtMs: null,
      lastRotatedAtMs: Date.now(),
      humanQueueCount: 0,
      nowPlayingLabel: null,
    };
    runtime.set(def.roomId, state);
  }
  return state;
}

/** Lock featured category when queue/joins are forming (honest human queue > 0). */
export function lockAnchorCategory(roomId: string): void {
  const def = ANCHOR_ROOM_DEFS.find((d) => d.roomId === roomId);
  if (!def) return;
  const state = getOrInitRuntime(def);
  state.categoryLocked = true;
  state.lockedAtMs = Date.now();
}

export function unlockAnchorCategory(roomId: string): void {
  const def = ANCHOR_ROOM_DEFS.find((d) => d.roomId === roomId);
  if (!def) return;
  const state = getOrInitRuntime(def);
  state.categoryLocked = false;
  state.lockedAtMs = null;
}

/** Set honest human queue depth (never invent). Locks category when > 0. */
export function setAnchorHumanQueue(roomId: string, humanQueueCount: number): void {
  const def = ANCHOR_ROOM_DEFS.find((d) => d.roomId === roomId);
  if (!def) return;
  const state = getOrInitRuntime(def);
  state.humanQueueCount = Math.max(0, Math.round(humanQueueCount));
  if (state.humanQueueCount > 0) {
    state.categoryLocked = true;
    state.lockedAtMs = state.lockedAtMs ?? Date.now();
  } else if (state.categoryLocked && state.humanQueueCount === 0) {
    state.categoryLocked = false;
    state.lockedAtMs = null;
  }
}

/** Wire a real now-playing label from playlist engines only — never fabricate track names. */
export function setAnchorNowPlaying(roomId: string, label: string | null): void {
  const def = ANCHOR_ROOM_DEFS.find((d) => d.roomId === roomId);
  if (!def || def.family !== "playlist_lounge") return;
  const state = getOrInitRuntime(def);
  const trimmed = (label ?? "").trim();
  state.nowPlayingLabel = trimmed.length > 0 ? trimmed : null;
}

function maybeRotateIdle(def: AnchorRoomDef, state: AnchorRuntimeState, now: number): void {
  if (!def.rotationPool?.length) return;
  if (state.categoryLocked || state.humanQueueCount > 0) return;
  if (now - state.lastRotatedAtMs < ANCHOR_NETWORK_CONTROLS.idleCategoryRotateMs) return;
  const pool = def.rotationPool;
  const idx = Math.max(0, pool.indexOf(state.featuredCategory as AnchorCategorySlot));
  state.featuredCategory = pool[(idx + 1) % pool.length] ?? pool[0];
  state.lastRotatedAtMs = now;
}

export function getAnchorRuntimeState(roomId: string): AnchorRuntimeState | undefined {
  const def = ANCHOR_ROOM_DEFS.find((d) => d.roomId === roomId);
  if (!def) return undefined;
  const state = getOrInitRuntime(def);
  maybeRotateIdle(def, state, Date.now());
  return { ...state };
}

export function isAnchorRoomId(roomId: string): boolean {
  return ANCHOR_ROOM_DEFS.some((d) => d.roomId === roomId);
}

// ── Family-distinct card copy (honest — never fake humans / challenger names) ─

function categoryLabel(slot: AnchorCategorySlot | null | undefined): string {
  if (!slot) return "Open";
  return CATEGORY_LABEL[slot] ?? slot.replace(/_/g, " ");
}

export function buildAnchorStatusLine(
  def: AnchorRoomDef,
  state: AnchorRuntimeState,
  humanViewers: number,
  humanParticipants: number,
): string {
  const humans = `👤 ${humanViewers} human${humanViewers === 1 ? "" : "s"}`;
  const cat = categoryLabel(state.featuredCategory);

  switch (def.family) {
    case "battle": {
      if (state.categoryLocked || state.humanQueueCount > 0) {
        return `LOCKED: ${cat} · Performer vs performer · Queue ${state.humanQueueCount} · ${humans}`;
      }
      return `Featured: ${cat} · Performer vs performer · Open · ${humans}`;
    }
    case "song_challenge": {
      if (state.categoryLocked || state.humanQueueCount > 0) {
        return `LOCKED: ${cat} · Work vs work · Needs 2 songs · ${humans}`;
      }
      return `Challenge Your Song · ${cat} · Needs 2 songs · ${humans}`;
    }
    case "creative_challenge": {
      if (state.categoryLocked || state.humanQueueCount > 0) {
        return `LOCKED: ${cat} · Creative matchup · ${humans}`;
      }
      return `Rotating: ${cat} · Open challenge · ${humans}`;
    }
    case "cypher": {
      const need = def.openCallNeeds ?? 3;
      const role = def.openCallRole ?? "MCs";
      const joined = Math.min(humanParticipants, need);
      const remaining = Math.max(0, need - joined);
      if (remaining > 0) {
        return `Needs ${remaining} ${role} · Open call · ${humans}`;
      }
      return `Roster full · Cypher live · ${humans}`;
    }
    case "playlist_lounge": {
      if (state.nowPlayingLabel) {
        return `Now Playing: ${state.nowPlayingLabel} · ${humans}`;
      }
      return `Always open · Waiting for the next track · ${humans}`;
    }
    case "conversation_lounge":
      return `Open 24/7 · Voice & video · Ambient · ${humans}`;
    case "fan_lobby":
      return `Avatar lobby · Always open · ${humans} · cap ${getCapacityForFamily(def.family).humanViewersMax}`;
    case "dance":
      return `World Dance · Floor open · ${humans} · cap ${getCapacityForFamily(def.family).humanViewersMax}`;
    case "variety":
      return `Deal or Feud / Variety · Platform room · ${humans} · cap ${getCapacityForFamily(def.family).humanViewersMax}`;
    default:
      return humans;
  }
}

// ── Honest occupancy (humans ≠ support) ──────────────────────────────────────

export interface AnchorOccupancy {
  humanViewers: number;
  humanParticipants: number;
  supportAgents: number;
}

export function getAnchorOccupancy(roomId: string): AnchorOccupancy {
  const presence = getLivePresenceSnapshot(roomId);
  // LivePresenceEngine tracks real joins only — never BotCrowdFill as humans.
  const humanViewers = Math.max(0, presence.fanCount);
  const humanParticipants = Math.max(0, presence.performerCount + presence.hostCount);
  let supportAgents = 0;
  try {
    supportAgents = Math.max(0, getVenueSupportState(roomId)?.agents.length ?? 0);
  } catch {
    supportAgents = 0;
  }
  return { humanViewers, humanParticipants, supportAgents };
}

// ── Seed + publish ───────────────────────────────────────────────────────────

const PLATFORM_HOST_ID = "tmi-platform-anchor";

export function ensureAnchorRoomsSeeded(): LiveRoom[] {
  const rooms: LiveRoom[] = [];
  for (const def of ANCHOR_ROOM_DEFS) {
    getOrInitRuntime(def);
    const cap = getCapacityForFamily(def.family);
    const room = ensureLiveRoom({
      roomId: def.roomId,
      roomType: def.liveRoomType,
      title: def.title,
      hostUserId: PLATFORM_HOST_ID,
      description: `Permanent 24/7 anchor — ${def.family}`,
      genre: def.rotationPool?.[0],
      tags: ["anchor", def.family, "always-on"],
      forceLive: true,
      configOverrides: {
        maxCapacity: cap.humanViewersMax + cap.humanParticipantsMax,
      },
    });
    rooms.push(room);
  }
  return rooms;
}

export function toLiveRoomRecord(def: AnchorRoomDef): LiveRoomRecord {
  const room = getLiveRoom(def.roomId);
  const cap = getCapacityForFamily(def.family);
  return {
    roomId: def.roomId,
    roomType:
      def.liveRoomType === "battle"
        ? "battle"
        : def.liveRoomType === "cypher"
          ? "cypher"
          : def.liveRoomType === "contest"
            ? "contest"
            : def.liveRoomType === "event"
              ? "event"
              : "venue",
    title: def.title,
    status: room?.status === "live" || room?.status === "open" ? "live" : room?.status ?? "open",
    genre: getOrInitRuntime(def).featuredCategory ?? undefined,
    isAnchor: true,
    anchorFamily: def.family,
    humanParticipantsMax: cap.humanParticipantsMax,
    humanViewersMax: cap.humanViewersMax,
    humanQueueMax: cap.humanQueueMax,
    supportAgentsMax: cap.supportAgentsMax,
    vrVisibleSeats: cap.vrVisibleSeats,
    vrMetaphor: cap.vrMetaphor,
  };
}

export function listAnchorLiveRoomRecords(): LiveRoomRecord[] {
  ensureAnchorRoomsSeeded();
  return ANCHOR_ROOM_DEFS.map(toLiveRoomRecord);
}

function toPublishInput(def: AnchorRoomDef): PublishLiveRoomInput {
  const state = getOrInitRuntime(def);
  maybeRotateIdle(def, state, Date.now());
  const occ = getAnchorOccupancy(def.roomId);
  const statusLine = buildAnchorStatusLine(
    def,
    state,
    occ.humanViewers,
    occ.humanParticipants,
  );

  return {
    roomId: def.roomId,
    title: def.title,
    hostName: statusLine,
    hostUserId: PLATFORM_HOST_ID,
    countryCode: "ZZ",
    category: def.streamCategory,
    visibility: "public",
    humanViewerCount: occ.humanViewers,
    accentColor: def.accentColor,
    joinRoute: `/live/rooms/${encodeURIComponent(def.roomId)}?from=anchor-network`,
    joinGate: "none",
    experienceId: `anchor:${def.family}`,
    startedAt: getLiveRoom(def.roomId)?.createdAtMs ?? Date.now(),
    listed: true,
    statusLine,
    isAnchor: true,
    anchorFamily: def.family,
    featuredCategory: state.featuredCategory ?? undefined,
    categoryLocked: state.categoryLocked,
  };
}

/** Build discovery records for all 12 anchors (honest 0 humans when empty). */
export function getAnchorDiscoveryRecords(): LiveDiscoveryRecord[] {
  ensureAnchorRoomsSeeded();
  const out: LiveDiscoveryRecord[] = [];
  for (const def of ANCHOR_ROOM_DEFS) {
    const input = toPublishInput(def);
    const published = publishLiveRoom(input);
    if (published) out.push(published);
  }
  return out;
}

/**
 * Overflow spawn — NOT wired to fake RoomPopulationEngine seeds.
 * Returns null until real human occupancy/queue exceeds observatory knobs
 * AND a real shard allocator exists. Currently never mints rooms (Rule 20).
 */
export function maybeSpawnOverflowRoom(anchorRoomId: string): LiveRoom | null {
  if (!isAnchorRoomId(anchorRoomId)) return null;
  if (!ANCHOR_NETWORK_CONTROLS.overflowRequiresRealPresence) return null;

  const occ = getAnchorOccupancy(anchorRoomId);
  const state = getAnchorRuntimeState(anchorRoomId);
  const queue = state?.humanQueueCount ?? 0;
  const def = ANCHOR_ROOM_DEFS.find((d) => d.roomId === anchorRoomId);
  const cap = def ? getCapacityForFamily(def.family) : null;
  const viewerThresh = cap?.humanViewersMax ?? ANCHOR_NETWORK_CONTROLS.overflowHumanThreshold;
  const queueThresh = cap?.humanQueueMax ?? ANCHOR_NETWORK_CONTROLS.overflowQueueThreshold;
  const overCapacity =
    occ.humanViewers >= viewerThresh ||
    queue >= queueThresh;

  if (!overCapacity) return null;

  // Real signal present — still deferred: WebRTC scale-out / shard allocator not assembled.
  return null;
}

export function listOverflowCandidates(): Array<{
  anchorRoomId: string;
  humanViewers: number;
  humanQueueCount: number;
  wouldSpawn: boolean;
  reason: string;
}> {
  return ANCHOR_ROOM_DEFS.map((def) => {
    const occ = getAnchorOccupancy(def.roomId);
    const queue = getOrInitRuntime(def).humanQueueCount;
    const cap = getCapacityForFamily(def.family);
    const would =
      occ.humanViewers >= cap.humanViewersMax ||
      queue >= cap.humanQueueMax;
    return {
      anchorRoomId: def.roomId,
      humanViewers: occ.humanViewers,
      humanQueueCount: queue,
      wouldSpawn: would,
      reason: would
        ? "Capacity threshold met — overflow allocator not yet wired (no fake room minted)"
        : "Below overflow knobs — anchor only",
    };
  });
}



/** Observatory / admin read path — full capacity matrix for all anchor families. */
export function listAnchorCapacityMatrix(): AnchorRoomCapacity[] {
  return ANCHOR_ROOM_DEFS.map((d) => getCapacityForFamily(d.family));
}

export function getAnchorCapacity(roomId: string): AnchorRoomCapacity | null {
  const def = ANCHOR_ROOM_DEFS.find((d) => d.roomId === roomId);
  return def ? getCapacityForFamily(def.family) : null;
}
