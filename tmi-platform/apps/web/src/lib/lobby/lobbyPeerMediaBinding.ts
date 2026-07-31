/**
 * Phase B — Lobby peer media binding (shared Fan Lobby + Playlist Lounge).
 *
 * Presence is authoritative (FanLobbyPresence). Media tracks bind TO userId —
 * never invent a parallel presence store from Daily/WebRTC.
 */

export type AvatarHeadMediaMode = "FULL" | "COMPACT" | "HIDDEN";

/** Bound media for one presence userId (from Daily or local getUserMedia). */
export interface LobbyPeerMediaTracks {
  userId: string;
  /** Daily session_id when from SFU; null for local-only fallback. */
  mediaParticipantId: string | null;
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  /** True when we have a live video track (not presence.cameraEnabled alone). */
  hasVideoTrack: boolean;
}

export interface LobbyPeerMediaSnapshot {
  /** Daily session available and joined. */
  sessionReady: boolean;
  /** Honest reason when peers cannot connect (Rule 20). */
  unavailableReason: string | null;
  /** Tracks keyed by canonical FanLobbyPresence.userId. */
  byUserId: ReadonlyMap<string, LobbyPeerMediaTracks>;
}

/** Deterministic Daily room name for a social lobby roomId. */
export function lobbyDailyRoomName(roomId: string): string {
  const slug = roomId
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `tmi-social-${slug || "lobby"}`;
}

/**
 * Encode presence userId into Daily user_name as fallback when token user_id
 * is stripped. Display name stays human-readable before the delimiter.
 */
export function encodeLobbyMediaUserName(displayName: string, userId: string): string {
  const safe = displayName.replace(/\|/g, " ").trim() || "Fan";
  return `${safe}|uid:${userId}`;
}

export function parseLobbyMediaUserId(
  userIdField: string | undefined | null,
  userName: string | undefined | null,
): string | null {
  if (userIdField && userIdField.trim()) return userIdField.trim();
  if (!userName) return null;
  const m = userName.match(/\|uid:([^\s|]+)\s*$/);
  return m?.[1] ?? null;
}

/** 2D % floor distance between two avatar positions. */
export function lobbyFloorDistancePct(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  return Math.hypot(ax - bx, ay - by);
}

/**
 * Distance LOD for head panels (2D percent space).
 * Self → FULL (unless local hide). Near remotes → FULL. Far remotes → COMPACT.
 */
export function resolveAvatarHeadMediaMode(opts: {
  isSelf: boolean;
  distancePct: number;
  /** Local-only preference — does not mutate FanLobbyPresence. */
  localHidePanel?: boolean;
}): AvatarHeadMediaMode {
  if (opts.localHidePanel && opts.isSelf) return "HIDDEN";
  if (opts.isSelf) return "FULL";
  if (opts.distancePct <= 30) return "FULL";
  return "COMPACT";
}

const HIDE_PANEL_KEY = "tmi-lobby-hide-head-panel";

export function getLocalHideHeadPanel(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(HIDE_PANEL_KEY) === "1";
}

export function setLocalHideHeadPanel(hide: boolean): void {
  if (typeof window === "undefined") return;
  if (hide) window.localStorage.setItem(HIDE_PANEL_KEY, "1");
  else window.localStorage.removeItem(HIDE_PANEL_KEY);
}
