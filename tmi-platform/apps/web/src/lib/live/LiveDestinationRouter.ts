/**
 * LiveDestinationRouter — role × privacy → live destination.
 *
 * Instant Go Live (Marcel product lock):
 *   Performer Public  → empty stage immediately (no wizard)
 *   Performer Private → rehearsal / studio (or private-room flag)
 *   Fan Public        → Fan Avatar Lobby (Rule 26 — not concert stage)
 *   Fan Private       → friend lounge if present, else fan-lobby private flag
 *
 * Does not fabricate viewers. Lobby-wall placement reuses LiveRoutingEngine
 * when the destination is a public performer stage.
 */

import { routeLivePlacement, type RoutedLivePlacement } from "@/lib/live/LiveRoutingEngine";
import { fanAvatarLobbyEntryHref, SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID } from "@/lib/live/canonicalWorldViewport";

export type LivePrivacy = "public" | "friends" | "invite" | "private";

export type LiveDestinationRole =
  | "FAN"
  | "PERFORMER"
  | "BAND"
  | "ARTIST"
  | "ADMIN"
  | "SUPERADMIN"
  | "VENUE"
  | "PROMOTER"
  | "SPONSOR"
  | "ADVERTISER";

export interface LiveDestinationInput {
  role: string;
  privacy: LivePrivacy;
  /** Optional ExperienceRegistry id override (concert, dance-party, etc.) */
  preferredExperience?: string;
}

export interface LiveDestinationFlags {
  /** Performer lands on empty venue first paint — never wait on audience data */
  emptyStage: boolean;
  /** Fan Avatar Lobby path (Rule 26) */
  fanLobby: boolean;
  /** Soft private-room flag when no dedicated private route exists */
  privateRoom: boolean;
  /** Friends / invite-only visibility for registry listing */
  restrictedAudience: boolean;
}

export interface LiveDestination {
  experienceId: string;
  /** Absolute path or path template with {roomId} */
  route: string;
  label: string;
  category: string;
  flags: LiveDestinationFlags;
  /** Lobby wall placement when public performer broadcast is listed */
  lobbyPlacement: RoutedLivePlacement | null;
  /**
   * Tier entitlement metadata only — do not fake AI director UI.
   * Gold/Diamond director features are FUTURE.
   */
  entitlements: {
    freeBasics: string[];
    goldDirector: string[];
    diamondDirector: string[];
  };
}

const STORAGE_PRIVACY_KEY = "tmi.live.privacy";
const STORAGE_EXPERIENCE_KEY = "tmi.live.preferredExperience";

const FREE_BASICS = [
  "welcome",
  "wave",
  "audience_count_real",
  "camera_angle_stub",
  "arrival_toasts",
  "host_mode_toggle",
];

/** Registry metadata only — not wired as fake features this pass */
const GOLD_DIRECTOR = [
  "auto_camera_pack",
  "mini_event_quick_create",
  "sponsor_lower_third",
];

const DIAMOND_DIRECTOR = [
  "ai_broadcast_director",
  "multi_cam_switcher",
  "cinematic_replay",
];

function normalizeRole(role: string): LiveDestinationRole {
  const r = (role || "FAN").trim().toUpperCase();
  if (r === "ARTIST") return "PERFORMER";
  if (
    r === "FAN" ||
    r === "PERFORMER" ||
    r === "BAND" ||
    r === "ADMIN" ||
    r === "SUPERADMIN" ||
    r === "VENUE" ||
    r === "PROMOTER" ||
    r === "SPONSOR" ||
    r === "ADVERTISER"
  ) {
    return r;
  }
  return "FAN";
}

function isPerformerLike(role: LiveDestinationRole): boolean {
  return (
    role === "PERFORMER" ||
    role === "BAND" ||
    role === "ADMIN" ||
    role === "SUPERADMIN" ||
    role === "VENUE"
  );
}

function experienceCategory(preferred?: string): string {
  const p = (preferred ?? "live").toLowerCase();
  if (p === "battle" || p === "cypher" || p === "challenge" || p === "concert") return p;
  if (p === "world-concert") return "concert";
  if (p === "dance-party" || p === "world-dance-party") return "dance-party";
  if (p === "release-party" || p === "mini-concert" || p === "world-premiere") return "release-party";
  if (p === "fan-lobby") return "fan-lobby";
  if (p === "lounge" || p === "vip-lounge") return "lounge";
  return "live";
}

/**
 * Resolve where GO LIVE should land for this role × privacy.
 * Route may include `{roomId}` for performer stage rooms that mint an id at launch.
 */
export function resolveLiveDestination(input: LiveDestinationInput): LiveDestination {
  const role = normalizeRole(input.role);
  const privacy = input.privacy;
  const preferred = input.preferredExperience;
  const restricted = privacy === "friends" || privacy === "invite" || privacy === "private";
  const entitlements = {
    freeBasics: FREE_BASICS,
    goldDirector: GOLD_DIRECTOR,
    diamondDirector: DIAMOND_DIRECTOR,
  };

  // ── Fan / Performer Live Stage Path — mint live stage room for all GO LIVE launches ──
  const isExplicitGoLive = !preferred || preferred === "live" || preferred === "concert" || preferred === "world-concert";
  if (!isPerformerLike(role) && !isExplicitGoLive) {
    if (privacy === "private" || privacy === "friends") {
      // Friend lounge exists at vip-lounge; fall back flag if treated as private fan lobby
      return {
        experienceId: "vip-lounge",
        route: `/rooms/vip-lounge?privacy=${privacy}&from=launch-dock`,
        label: "Friend Lounge",
        category: "lounge",
        flags: {
          emptyStage: false,
          fanLobby: true,
          privateRoom: true,
          restrictedAudience: true,
        },
        lobbyPlacement: null,
        entitlements,
      };
    }
    return {
      experienceId: "fan-lobby",
      route: fanAvatarLobbyEntryHref(SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID, { from: "launch-dock", privacy }),
      label: "Fan Avatar Lobby",
      category: "fan-lobby",
      flags: {
        emptyStage: false,
        fanLobby: true,
        privateRoom: privacy === "invite",
        restrictedAudience: privacy === "invite",
      },
      lobbyPlacement: null,
      entitlements,
    };
  }

  // ── Performer private / invite → rehearsal studio ─────────────────────────
  if (privacy === "private" || privacy === "invite") {
    return {
      experienceId: "rehearsal",
      route: `/rooms/rehearsal?privacy=${privacy}&mode=performer&from=launch-dock`,
      label: privacy === "private" ? "Private Rehearsal" : "Invite-Only Studio",
      category: "lounge",
      flags: {
        emptyStage: true,
        fanLobby: false,
        privateRoom: true,
        restrictedAudience: true,
      },
      lobbyPlacement: null,
      entitlements,
    };
  }

  // ── Performer friends → private room flag on stage (listed off public wall) ─
  if (privacy === "friends") {
    const category = experienceCategory(preferred);
    const placement = routeLivePlacement({ category, eventType: `LIVE_${category.toUpperCase().replace(/-/g, "_")}` });
    return {
      experienceId: preferred || "performer-live",
      route: `/live/rooms/{roomId}?mode=performer&auto=true&privacy=friends&category=${category}&from=launch-dock`,
      label: "Friends Stage",
      category,
      flags: {
        emptyStage: true,
        fanLobby: false,
        privateRoom: true,
        restrictedAudience: true,
      },
      lobbyPlacement: placement,
      entitlements,
    };
  }

  // ── Performer public → empty stage immediately ────────────────────────────
  const category = experienceCategory(preferred);
  const placement = routeLivePlacement({
    category,
    eventType: `LIVE_${category.toUpperCase().replace(/-/g, "_")}`,
  });

  return {
    experienceId: preferred || "performer-live",
    route: `/live/rooms/{roomId}?mode=performer&auto=true&privacy=public&category=${category}&from=launch-dock`,
    label: "Live Stage",
    category,
    flags: {
      emptyStage: true,
      fanLobby: false,
      privateRoom: false,
      restrictedAudience: false,
    },
    lobbyPlacement: placement,
    entitlements,
  };
}

/** Fill `{roomId}` in a destination route template. */
export function materializeLiveRoute(destination: LiveDestination, roomId: string): string {
  return destination.route.replace(/\{roomId\}/g, encodeURIComponent(roomId));
}

export function loadPersistedLivePrivacy(): LivePrivacy {
  if (typeof window === "undefined") return "public";
  try {
    const v = window.localStorage.getItem(STORAGE_PRIVACY_KEY);
    if (v === "public" || v === "friends" || v === "invite" || v === "private") return v;
  } catch {
    /* ignore */
  }
  return "public";
}

export function persistLivePrivacy(privacy: LivePrivacy): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PRIVACY_KEY, privacy);
  } catch {
    /* ignore */
  }
}

export function loadPersistedPreferredExperience(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(STORAGE_EXPERIENCE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function persistPreferredExperience(experienceId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_EXPERIENCE_KEY, experienceId);
  } catch {
    /* ignore */
  }
}
