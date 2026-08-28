/**
 * Canonical World Viewport Law — ONE room, multiple monitor windows.
 *
 * Viewing coverage target: 360° horizontal × 180° vertical (full sphere / 4π steradians).
 * This is NOT a flat turn-left panorama — the room remains a physical 3D world
 * (floor, gravity, collision, FREE_ROAM). UniversalVenueRenderer + AudienceScene
 * are honest capsule/plane geometry until a real spatial runtime ships — never faked
 * as photoreal square footage.
 *
 * Fan Avatar Lobby is the fan-facing ENTRY LAYER of this same world — not a
 * second destination or a second room registry. Performer FOH and fan avatars
 * share one roomId / curtain / stage / seats / live session (Rule 26 isolation).
 *
 * Engineering controls only — not legal advice.
 */

export type CanonicalViewportRole = "foh" | "boh";

export type HubMonitorSlot = "A" | "B";

/** Which UVR mode drives AudienceScene for each hub monitor slot. */
export type HubUvrMode = "performer" | "audience";

/**
 * Named zones of the ONE canonical venue. Same roomId / full-sphere world /
 * curtain+stage+seating+session. Movement through the world — not `/some-other-fake-room`.
 *
 * Graph (fan front door → house → show → backstage, plus hallway side rooms):
 *   FAN_AVATAR_LOBBY → AUDITORIUM / BOH / LOUNGE_SIDE_ROOM
 *   LOUNGE_SIDE_ROOM ↔ FAN_AVATAR_LOBBY / AUDITORIUM  (video hangout, NO AVATARS)
 *   AUDITORIUM / BOH → CURTAIN → STAGE / FOH → BACKSTAGE
 *   AUDITORIUM → [all specialized event rooms] (different room, same system)
 *   Specialized rooms → AUDITORIUM (return path through main house)
 */
export const CANONICAL_WORLD_ZONE = {
  FAN_AVATAR_LOBBY: "FAN_AVATAR_LOBBY",
  AUDITORIUM: "AUDITORIUM",
  BOH: "BOH",
  FOH: "FOH",
  STAGE: "STAGE",
  CURTAIN: "CURTAIN",
  BACKSTAGE: "BACKSTAGE",
  /** Connected hallway side-room. No avatars; real WebRTC video only. */
  LOUNGE_SIDE_ROOM: "LOUNGE_SIDE_ROOM",
  /** Performer rehearsal/backroom — NO avatars; free-roam WebRTC panels only. */
  PERFORMER_LOBBY: "PERFORMER_LOBBY",
  // Specialized event rooms — different room, same canonical system.
  // Each inherits: roomId, presence, seating, stage, HUD, WebRTC, Monitor A/B, fullscreen.
  /** Song/dance/joke/gibberish/scat/instrument/DJ/producer battle formats. */
  BATTLE_ARENA: "BATTLE_ARENA",
  /** Song challenges, dance-offs, comedy, talent challenges. */
  CHALLENGE_ROOM: "CHALLENGE_ROOM",
  /** Cipher / mic-rotation rooms. */
  CIPHER_ROOM: "CIPHER_ROOM",
  /** Dealer's Choice, 1000, Circle of Squares, Name That Tune. */
  GAME_SHOW_ROOM: "GAME_SHOW_ROOM",
  /** Finals / bracket championship rooms. */
  CHAMPIONSHIP_ARENA: "CHAMPIONSHIP_ARENA",
  /** General contest rooms. */
  CONTEST_ROOM: "CONTEST_ROOM",
  /** Dirty Dozens, Monday Night Stage, Monthly Idol (bot-operated flagship events). */
  RECURRING_EVENT_STAGE: "RECURRING_EVENT_STAGE",
} as const;

export type CanonicalWorldZone = (typeof CANONICAL_WORLD_ZONE)[keyof typeof CANONICAL_WORLD_ZONE];

export const CANONICAL_WORLD_ZONES: readonly CanonicalWorldZone[] = [
  CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY,
  CANONICAL_WORLD_ZONE.AUDITORIUM,
  CANONICAL_WORLD_ZONE.BOH,
  CANONICAL_WORLD_ZONE.FOH,
  CANONICAL_WORLD_ZONE.STAGE,
  CANONICAL_WORLD_ZONE.CURTAIN,
  CANONICAL_WORLD_ZONE.BACKSTAGE,
  CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM,
  CANONICAL_WORLD_ZONE.PERFORMER_LOBBY,
  CANONICAL_WORLD_ZONE.BATTLE_ARENA,
  CANONICAL_WORLD_ZONE.CHALLENGE_ROOM,
  CANONICAL_WORLD_ZONE.CIPHER_ROOM,
  CANONICAL_WORLD_ZONE.GAME_SHOW_ROOM,
  CANONICAL_WORLD_ZONE.CHAMPIONSHIP_ARENA,
  CANONICAL_WORLD_ZONE.CONTEST_ROOM,
  CANONICAL_WORLD_ZONE.RECURRING_EVENT_STAGE,
] as const;

/**
 * Locked graph — Fan Avatar Lobby is the fan front door, not a separate mill.
 * Lounges are hallway side rooms of the same world — not `/some-other-fake-room`.
 * Specialized event rooms are accessed through AUDITORIUM; they return to AUDITORIUM.
 */
export const CANONICAL_WORLD_ZONE_GRAPH = {
  FAN_AVATAR_LOBBY: ["AUDITORIUM", "BOH", "LOUNGE_SIDE_ROOM"],
  AUDITORIUM: [
    "CURTAIN", "BOH", "LOUNGE_SIDE_ROOM", "FAN_AVATAR_LOBBY",
    "BATTLE_ARENA", "CHALLENGE_ROOM", "CIPHER_ROOM",
    "GAME_SHOW_ROOM", "CHAMPIONSHIP_ARENA", "CONTEST_ROOM", "RECURRING_EVENT_STAGE",
  ],
  BOH: ["AUDITORIUM", "CURTAIN"],
  CURTAIN: ["STAGE", "FOH"],
  STAGE: ["FOH", "BACKSTAGE", "CURTAIN"],
  FOH: ["STAGE", "CURTAIN"],
  BACKSTAGE: ["STAGE"],
  LOUNGE_SIDE_ROOM: ["FAN_AVATAR_LOBBY", "AUDITORIUM", "PERFORMER_LOBBY"],
  PERFORMER_LOBBY: ["AUDITORIUM", "BACKSTAGE", "LOUNGE_SIDE_ROOM"],
  BATTLE_ARENA: ["AUDITORIUM"],
  CHALLENGE_ROOM: ["AUDITORIUM"],
  CIPHER_ROOM: ["AUDITORIUM"],
  GAME_SHOW_ROOM: ["AUDITORIUM"],
  CHAMPIONSHIP_ARENA: ["AUDITORIUM"],
  CONTEST_ROOM: ["AUDITORIUM"],
  RECURRING_EVENT_STAGE: ["AUDITORIUM"],
} as const satisfies Record<CanonicalWorldZone, readonly CanonicalWorldZone[]>;

// ---------------------------------------------------------------------------
// MASTER VENUE TOPOLOGY — locked 2026-08-18
// "Different room does not mean different system."
// ---------------------------------------------------------------------------

/**
 * All named experience room types that live inside the master venue complex.
 * Each type maps to a CanonicalWorldZone and inherits the full canonical stack.
 */
export const EXPERIENCE_ROOM_TYPE = {
  // Game Shows
  DEALERS_CHOICE:       "DEALERS_CHOICE",
  ONE_THOUSAND:         "ONE_THOUSAND",
  CIRCLE_OF_SQUARES:    "CIRCLE_OF_SQUARES",
  NAME_THAT_TUNE:       "NAME_THAT_TUNE",
  // Bot-operated flagship recurring events (Rule 21 — Official Automated Events)
  DIRTY_DOZENS:         "DIRTY_DOZENS",
  MONDAY_NIGHT_STAGE:   "MONDAY_NIGHT_STAGE",
  MONTHLY_IDOL:         "MONTHLY_IDOL",
  // Battle formats
  SONG_BATTLE:          "SONG_BATTLE",
  SONG_CHALLENGE:       "SONG_CHALLENGE",
  DANCE_OFF:            "DANCE_OFF",
  JOKE_OFF:             "JOKE_OFF",
  GIBBERISH_BATTLE:     "GIBBERISH_BATTLE",
  SCAT_JAZZ_BATTLE:     "SCAT_JAZZ_BATTLE",
  INSTRUMENT_BATTLE:    "INSTRUMENT_BATTLE",
  DJ_BATTLE:            "DJ_BATTLE",
  PRODUCER_BATTLE:      "PRODUCER_BATTLE",
  // Cipher / championships / contests
  CIPHER:               "CIPHER",
  CHAMPIONSHIP:         "CHAMPIONSHIP",
  CHALLENGE:            "CHALLENGE",
  CONTEST:              "CONTEST",
} as const;

export type ExperienceRoomType = (typeof EXPERIENCE_ROOM_TYPE)[keyof typeof EXPERIENCE_ROOM_TYPE];

/** Maps each experience room type to its canonical zone inside the master venue complex. */
export const EXPERIENCE_ROOM_ZONE: Record<ExperienceRoomType, CanonicalWorldZone> = {
  DEALERS_CHOICE:    CANONICAL_WORLD_ZONE.GAME_SHOW_ROOM,
  ONE_THOUSAND:      CANONICAL_WORLD_ZONE.GAME_SHOW_ROOM,
  CIRCLE_OF_SQUARES: CANONICAL_WORLD_ZONE.GAME_SHOW_ROOM,
  NAME_THAT_TUNE:    CANONICAL_WORLD_ZONE.GAME_SHOW_ROOM,
  DIRTY_DOZENS:      CANONICAL_WORLD_ZONE.RECURRING_EVENT_STAGE,
  MONDAY_NIGHT_STAGE: CANONICAL_WORLD_ZONE.RECURRING_EVENT_STAGE,
  MONTHLY_IDOL:      CANONICAL_WORLD_ZONE.RECURRING_EVENT_STAGE,
  SONG_BATTLE:       CANONICAL_WORLD_ZONE.BATTLE_ARENA,
  SONG_CHALLENGE:    CANONICAL_WORLD_ZONE.CHALLENGE_ROOM,
  DANCE_OFF:         CANONICAL_WORLD_ZONE.BATTLE_ARENA,
  JOKE_OFF:          CANONICAL_WORLD_ZONE.BATTLE_ARENA,
  GIBBERISH_BATTLE:  CANONICAL_WORLD_ZONE.BATTLE_ARENA,
  SCAT_JAZZ_BATTLE:  CANONICAL_WORLD_ZONE.BATTLE_ARENA,
  INSTRUMENT_BATTLE: CANONICAL_WORLD_ZONE.BATTLE_ARENA,
  DJ_BATTLE:         CANONICAL_WORLD_ZONE.BATTLE_ARENA,
  PRODUCER_BATTLE:   CANONICAL_WORLD_ZONE.BATTLE_ARENA,
  CIPHER:            CANONICAL_WORLD_ZONE.CIPHER_ROOM,
  CHAMPIONSHIP:      CANONICAL_WORLD_ZONE.CHAMPIONSHIP_ARENA,
  CHALLENGE:         CANONICAL_WORLD_ZONE.CHALLENGE_ROOM,
  CONTEST:           CANONICAL_WORLD_ZONE.CONTEST_ROOM,
} as const;

/**
 * Master Venue Topology Law — locked 2026-08-18.
 *
 * ONE master venue complex. Every competition, show, battle, game, championship,
 * and recurring event gets its own dedicated room inside the same complex.
 * The room changes; the underlying system does not.
 */
export const MASTER_VENUE_TOPOLOGY_LAW = {
  oneVenueComplex: true,
  differentRoomNotDifferentSystem: true,
  mediaPlayerIsTheWindow: true,
  law: "One master venue, many specialized rooms, one media-player viewing system. Every future TMI competition or event added must obey this same architecture.",
  monitorA: "Active room primary view — FOH / stage / game board / battle stage — same viewport law regardless of room type",
  monitorB: "Alternate room view — audience / judge panel / bracket / house view — same canonical BOH law",
  fullscreen: "media-player viewport → fullscreen → same room → same renderer → same session. No duplicate room, no second runtime.",
  /** What the canonical platform provides to every room — never reimplemented per experience. */
  platformOwns: [
    "room identity",
    "session / presence",
    "monitoring",
    "media players (Monitor A + Monitor B)",
    "fullscreen",
    "routing",
    "live state",
    "privacy",
    "WebRTC",
    "world / viewports",
    "HUD shell",
    "audience seating",
    "stage state",
    "timers",
  ] as const,
  /** What each experience room contributes — only what makes that room special. */
  experienceContributes: {
    BATTLE:         ["rounds", "scoring", "challenger logic"],
    CIPHER:         ["performer order", "mic rotation", "timer"],
    MONTHLY_IDOL:   ["judges", "voting", "elimination"],
    ONE_THOUSAND:   ["game rules", "board", "scoring"],
    NAME_THAT_TUNE: ["audio challenge", "guesses", "timer"],
    CHAMPIONSHIP:   ["bracket", "advancement", "finals"],
    SONG_CHALLENGE: ["full-song performance", "audience remains for full challenge"],
    DANCE_OFF:      ["dance floor / stage config", "rounds", "judges / audience reaction"],
    JOKE_OFF:       ["comedy mic / stage", "turns", "timing", "scoring"],
    GIBBERISH_BATTLE: ["gibberish / improv rules", "battle clock", "judging / scoring"],
    SCAT_JAZZ_BATTLE: ["scat performance order", "music / backing support", "rounds", "judging"],
  } as const,
  /** Audience law for all performance-style rooms (battles, challenges, song challenges). */
  audienceLaw: "Real contestants. Real room/session. Real stage. Real seating. Real audience enters and sits in assigned/open seats. Real reactions/emotes. Empty seats stay empty — no synthetic crowd.",
} as const;

/**
 * 24/7 system-operated Fan Avatar Lobby (AnchorRoomNetwork).
 * Honest empty when no humans and no performer GO LIVE — never fake occupancy.
 */
export const SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID = "anchor-global-fan-lobby";

/** 24/7 playlist / conversation lounge mill — same world family, hallway side room. */
export const SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID = "lounge-playlist";

/** System-operated performer rehearsal/backroom lobby — video panels, no avatars. */
export const SYSTEM_OPERATED_PERFORMER_LOBBY_ROOM_ID = "performer-lobby-global";

/**
 * Alias hangout URLs → canonical live-room mill. Not a second world.
 * `/rooms/playlist-lounge` joins `lounge-playlist` (UniversalVenueRenderer + Lounge HUD).
 * `/rooms/vip-lounge` still uses StageLoader — OPEN, not folded.
 */
export const LOUNGE_SIDE_ROOM_ROUTE_MAP = {
  "/rooms/playlist-lounge": {
    aliasRoomId: "playlist-lounge",
    millRoomId: SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
    millRoute: "/live/rooms/lounge-playlist",
    zone: CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM,
  },
} as const;

const SYSTEM_FAN_LOBBY_ALIASES = new Set([
  SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID,
  "fan-lobby",
  "fan-lobby-global",
  "anchor-fan-lobby-global",
]);

const LOUNGE_ROOM_ID_ALIASES: Record<string, string> = {
  "playlist-lounge": SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
};

const SYSTEM_LOUNGE_ALIASES = new Set([
  SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
  "playlist-lounge",
  "lounge-conversation",
  "anchor-lounge-playlist",
  "anchor-lounge-conversation",
]);

export interface ResolvedHubMonitorViewport {
  slot: HubMonitorSlot;
  /** FOH = front-of-house / stage. BOH = back-of-house / auditorium. */
  role: CanonicalViewportRole;
  /** Named zone this monitor window looks into. */
  zone: CanonicalWorldZone;
  /** Monitor A = local camera feed (not UVR). Monitor B = UVR window. */
  usesUvr: boolean;
  uvrMode: HubUvrMode | null;
  /** AudienceScene canvas perspective inside the same canonical room. */
  audienceSceneView: "performer" | "fan";
  label: string;
  shortLabel: string;
}

/** Gate 3 physical photoreal mesh — remains OPEN. Do not mark PASS. */
export type CanonicalWorldGate3Status = "OPEN";

export const CANONICAL_WORLD_VIEW_LAW = {
  oneWorld: true,
  /** Horizontal × vertical coverage target — spatial world, not equirectangular photo. */
  coverageSteradians: "360° × 180° (4π)",
  fanEntry:
    "FAN_AVATAR_LOBBY — fan-facing ENTRY LAYER of the one canonical venue, not a separate destination",
  monitorA: "FOH · performer/stage viewport · local camera after CAM ON / GO LIVE",
  monitorB: "BOH · house/audience viewport · same roomId via UniversalVenueRenderer",
  fullscreen: "Same DOM node / viewport instance expands — no second venue mill",
  hud: "Drawers on Venue HUD — not floating shell pages or duplicate RoomEnvironmentLayer",
  geometryHonesty:
    "Unlabeled plane/capsule UVR venue is still not photoreal square footage. No photoreal GLB claimed.",
  gate3PhysicalWorld: "OPEN" as CanonicalWorldGate3Status,
  photorealMesh: false,
  /** Hard rule — lounges are video hangouts. Avatars stay in FAN_AVATAR_LOBBY / auditorium. */
  loungeAllowsAvatars: false,
  loungeMonitorA: "Conversation / selected participant / self cam after explicit CAM ON — never getUserMedia on load",
  loungeMonitorB: "Lounge room / group view — same UVR mill, no avatar seating",
} as const;

/**
 * TMI FULL-SPHERE WORLD RUNTIME — 10 canonical laws (locked 2026-08-18).
 *
 * Coverage: 360° horizontal × 180° vertical = full sphere = 4π steradians ≈ 41,253 sq deg.
 * This is NOT "turn left/right 360°" — it is full spherical spatial coverage.
 */
export const FULL_SPHERE_WORLD_RUNTIME = {
  1: "All certified rooms use true volumetric 3D (floor, gravity, collision, free-roam).",
  2: "Viewing coverage supports 360° horizontal × 180° vertical (full sphere / 4π steradians).",
  3: "FAN_AVATAR_LOBBY, AUDITORIUM, BOH, FOH, STAGE, CURTAIN, BACKSTAGE, LOUNGE_SIDE_ROOM are parts of ONE world — not separate pages.",
  4: "Performer profile connects to FOH / STAGE — stage perspective, facing the audience. Real video isolated from fan avatars (Rule 26).",
  5: "Fan profile enters via FAN_AVATAR_LOBBY → AUDITORIUM / BOH — auditorium perspective, looking toward the stage.",
  6: "Media players are viewports into that world. Fullscreen enlarges the same viewport — no second renderer.",
  7: "Pop-up HUD panels control the world; they are not separate rooms.",
  8: "ONE world, multiple viewport windows. Monitor A = FOH camera (lounge: conversation/self cam). Monitor B = BOH house view (lounge: group/room view).",
  9: "Remove flat prototype rooms and panorama-only fallbacks from certified live paths.",
  10: "Preserve free-roam movement and physical collision in the canonical room runtime.",
  11: "LOUNGE_SIDE_ROOM shares canonical session/routing/monitor law but never initializes the avatar renderer. Connected topology is NOT shared presentation mode.",
  12: "All specialized event rooms (BATTLE_ARENA, CHALLENGE_ROOM, CIPHER_ROOM, GAME_SHOW_ROOM, CHAMPIONSHIP_ARENA, CONTEST_ROOM, RECURRING_EVENT_STAGE) are rooms inside the same master venue complex. Different room does not mean different system.",
  coverageSteradians: "360° × 180° / 4π",
  worldParts: [
    "FAN_AVATAR_LOBBY",
    "AUDITORIUM",
    "BOH",
    "FOH",
    "STAGE",
    "CURTAIN",
    "BACKSTAGE",
    "LOUNGE_SIDE_ROOM",
    "PERFORMER_LOBBY",
    "BATTLE_ARENA",
    "CHALLENGE_ROOM",
    "CIPHER_ROOM",
    "GAME_SHOW_ROOM",
    "CHAMPIONSHIP_ARENA",
    "CONTEST_ROOM",
    "RECURRING_EVENT_STAGE",
  ],
  gate3PhysicalWorld: "OPEN" as CanonicalWorldGate3Status,
  photorealMesh: false,
} as const;

/**
 * Lounge side-room law — same world/session governance, video hangout mode.
 * Connected like a hallway side-room. Does not invent LoungeV2 or a `/lounge` mill.
 */
export const LOUNGE_RUNTIME_LAW = {
  isConnectedSideRoom: true,
  sameSessionGoverned: true,
  sameMonitorViewportLaw: true,
  loungeAllowsAvatars: false,
  /**
   * Hard architectural rule: connected topology does NOT mean shared presentation mode.
   * A lounge shares the canonical session/routing/monitor law with the main venue,
   * but must NEVER initialize or inherit the 3D avatar renderer.
   * Avatars belong to FAN_AVATAR_LOBBY / auditorium only.
   */
  connectedTopologyNotSharedPresentation: true,
  avatarRendererForbidden: true,
  /** Explicit list of what is never rendered in a lounge. */
  avatarForbidden: [
    "avatar-models",
    "avatar-seating",
    "avatar-gameplay",
    "fan-avatar-substitution",
    "AudienceScene",
    "AvatarActionWheel",
    "PropLoader",
    "BotCrowdFill",
  ],
  videoFirst: true,
  // Free-roam physical lounge environment
  freeRoam: true,
  physicalEnvironment: [
    "floor detection",
    "free roam",
    "wall collision",
    "prop collision",
    "video-panel collision",
    "personal-space awareness",
    "environment props",
    "furniture",
    "playlist objects",
    "advertising boards",
    "sponsor displays",
  ],
  // Movable participant video panels — WebRTC stream survives repositioning
  panelMobility: "Video panels move with participants; repositioning the panel never restarts the WebRTC stream.",
  panelForms: [
    "TV", "phone", "tablet", "floating display",
    "playlist/player object", "wall screen", "retro television",
    "glass display", "environment-specific screen",
  ],
  proximityBehavior: {
    closer: "panels scale larger; conversation audio becomes more present",
    farther: "panels scale smaller; recede",
    leave:  "panel removed; WebRTC subscription released",
  },
  // Canonical ad placement — existing SponsorRegistry / Rule 12 only.
  // Humans remain for law, contracts, safety, and disputes. No fake ad-ML mill.
  adInventory: "In-world chassis (TV, mirror, video panel, glass display) plus named wall/board anchors.",
  adAutomation: "Routine fill via getAdSlotForZone / SponsorRegistry Rule 12 (paid → house/platform → advertise CTA). Direct sponsor/house preferred on 3D interactive surfaces. AdSense never flush against PLAY/BUY/WATCH.",
  adPlacementSignals: [
    "named lounge ad chassis",
    "SponsorRegistry zone key",
    "Rule 12 fallback chain",
  ],
  monitorA: "Selected participant / conversation feed / self cam after explicit CAM ON",
  monitorB: "Lounge room / group view (same mill, lounge zone)",
  fullscreen: "Same media-player viewport expands — no second lounge renderer",
  privacy: "No getUserMedia on load — CAM / MIC / GO LIVE laws apply",
  datingGate: "Dating lounges still call canAccessDatingExperience (21+ verified)",
  geometryHonesty:
    "Unlabeled plane/capsule UVR lounge is still not photoreal square footage.",
  gate3PhysicalWorld: "OPEN" as CanonicalWorldGate3Status,
  photorealMesh: false,
  videoPanelsNotAvatars: true,
  chassisSkinDoesNotRestartWebrtc: true,
  adSurfaces: "LoungeAdChassis TV|MIRROR|VIDEO_PANEL|GLASS_DISPLAY via getAdSlotForZone",
  adsenseFlushAgainstPlayBuyWatch: false,
  vipStageLoaderFolded: false,
} as const;

export interface LoungeWorldEntry {
  roomId: string;
  zone: typeof CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM;
  parentZone: CanonicalWorldZone;
  sameSessionAsVenue: boolean;
  loungeAllowsAvatars: false;
  videoFirst: true;
  href: string;
  mill: "UniversalVenueRenderer+TMIInteractiveLoungeHud";
  gate3: CanonicalWorldGate3Status;
}

export function canonicalizeLoungeRoomId(roomId: string): string {
  const slug = roomId.trim().toLowerCase();
  return LOUNGE_ROOM_ID_ALIASES[slug] ?? roomId.trim() ?? SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID;
}

export function isSystemOperatedLounge(roomId: string): boolean {
  return SYSTEM_LOUNGE_ALIASES.has(roomId.trim().toLowerCase());
}

export function isLoungeRoomId(roomId: string): boolean {
  const slug = roomId.trim().toLowerCase();
  if (SYSTEM_LOUNGE_ALIASES.has(slug)) return true;
  if (slug === "lounge" || slug.startsWith("lounge-") || slug.endsWith("-lounge")) return true;
  return false;
}

export function loungeSideRoomEntryHref(roomId: string, opts?: { from?: string }): string {
  const canonicalId = canonicalizeLoungeRoomId(roomId) || SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID;
  const params = new URLSearchParams();
  params.set("zone", CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM);
  params.set("from", opts?.from ?? "fan-avatar-lobby");
  return `/live/rooms/${encodeURIComponent(canonicalId)}?${params.toString()}`;
}

/**
 * Lounge join — same live-room mill (`/live/rooms/[id]`), zone query, no `/lounge` mill.
 * Live session → same roomId hallway. Alias `/rooms/playlist-lounge` → lounge-playlist.
 */
export function resolveLoungeWorldEntry(
  roomId?: string | null,
  opts?: { from?: CanonicalWorldZone | string; publishedRoomId?: string | null },
): LoungeWorldEntry {
  const published = trimRoomId(opts?.publishedRoomId);
  const join = trimRoomId(roomId);
  const alias = join ? canonicalizeLoungeRoomId(join) : null;
  const liveCandidate = published && !isSystemOperatedFanLobby(published) && !isSystemOperatedLounge(published)
    ? published
    : null;
  const id =
    liveCandidate ??
    alias ??
    SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID;
  const fromZone =
    typeof opts?.from === "string" && parseCanonicalWorldZone(opts.from)
      ? parseCanonicalWorldZone(opts.from)!
      : CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY;
  const fromParam = typeof opts?.from === "string" ? opts.from : fromZone;
  return {
    roomId: id,
    zone: CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM,
    parentZone: fromZone,
    sameSessionAsVenue: Boolean(liveCandidate),
    loungeAllowsAvatars: false,
    videoFirst: true,
    href: loungeSideRoomEntryHref(id, { from: fromParam }),
    mill: "UniversalVenueRenderer+TMIInteractiveLoungeHud",
    gate3: "OPEN",
  };
}

export function isLoungeZone(zone?: string | null): boolean {
  const v = (zone ?? "").trim().toUpperCase();
  return v === CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM || v === "LOUNGE";
}

export function isPerformerLobbyZone(zone?: string | null): boolean {
  const v = (zone ?? "").trim().toUpperCase();
  return v === CANONICAL_WORLD_ZONE.PERFORMER_LOBBY || v === "PERFORMER_LOBBY";
}

/** Avatars allowed in FAN_AVATAR_LOBBY / auditorium family. Never in lounges or performer lobbies. */
export function zoneAllowsAvatars(zone?: CanonicalWorldZone | string | null): boolean {
  if (isLoungeZone(zone) || isPerformerLobbyZone(zone)) return false;
  return true;
}

export function performerLobbyEntryHref(
  roomId: string,
  opts?: { from?: string; mode?: string; privacy?: string },
): string {
  const params = new URLSearchParams();
  params.set("zone", CANONICAL_WORLD_ZONE.PERFORMER_LOBBY);
  params.set("experienceClass", "PERFORMER_LOBBY");
  params.set("mode", opts?.mode ?? "performer-lobby");
  params.set("from", opts?.from ?? "performer-lobby-wall");
  if (opts?.privacy) params.set("privacy", opts.privacy);
  return `/live/rooms/${encodeURIComponent(roomId)}?${params.toString()}`;
}

export interface PerformerLobbyWorldEntry {
  roomId: string;
  zone: typeof CANONICAL_WORLD_ZONE.PERFORMER_LOBBY;
  loungeAllowsAvatars: false;
  videoFirst: true;
  href: string;
  mill: "UniversalVenueRenderer+PerformerVideoPresenceFloor";
  gate3: CanonicalWorldGate3Status;
}

export function resolvePerformerLobbyWorldEntry(
  roomId?: string | null,
  opts?: { from?: string; privacy?: string },
): PerformerLobbyWorldEntry {
  const id = trimRoomId(roomId) ?? SYSTEM_OPERATED_PERFORMER_LOBBY_ROOM_ID;
  return {
    roomId: id,
    zone: CANONICAL_WORLD_ZONE.PERFORMER_LOBBY,
    loungeAllowsAvatars: false,
    videoFirst: true,
    href: performerLobbyEntryHref(id, opts),
    mill: "UniversalVenueRenderer+PerformerVideoPresenceFloor",
    gate3: "OPEN",
  };
}

export interface ResolvedFanWorldEntry {
  roomId: string;
  zone: CanonicalWorldZone;
  perspective: "fan";
  /** True when joining a performer-published GO LIVE / InstantJoin roomId. */
  liveSessionPresent: boolean;
  /** True when hanging in the 24/7 system lobby with no published performer session. */
  emptyLobby: boolean;
  /** Same roomId / curtain / stage / seats as performer FOH when a session is live. */
  sameWorldAsPerformer: boolean;
  href: string;
  gate3: CanonicalWorldGate3Status;
}

export interface ResolvedPerformerWorldEntry {
  roomId: string;
  zone: CanonicalWorldZone;
  perspective: "performer";
  href: string;
  gate3: CanonicalWorldGate3Status;
}

function trimRoomId(id?: string | null): string | null {
  const t = (id ?? "").trim();
  return t.length > 0 ? t : null;
}

export function isSystemOperatedFanLobby(roomId: string): boolean {
  return SYSTEM_FAN_LOBBY_ALIASES.has(roomId.trim());
}

export function parseCanonicalWorldZone(value?: string | null): CanonicalWorldZone | null {
  const v = (value ?? "").trim().toUpperCase();
  if (v === "LOUNGE") return CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM;
  if (v === "PERFORMER_LOBBY") return CANONICAL_WORLD_ZONE.PERFORMER_LOBBY;
  return (CANONICAL_WORLD_ZONES as readonly string[]).includes(v)
    ? (v as CanonicalWorldZone)
    : null;
}

/** Extract a roomId from existing join routes (`/live/rooms/X`, `?roomId=X`). */
export function roomIdFromJoinRoute(route?: string | null): string | null {
  const raw = (route ?? "").trim();
  if (!raw) return null;
  try {
    const url = raw.startsWith("http")
      ? new URL(raw)
      : new URL(raw, "https://themusiciansindex.local");
    const q = url.searchParams.get("roomId") ?? url.searchParams.get("room");
    if (q && q.trim()) return decodeURIComponent(q.trim());
    const live = url.pathname.match(/\/live\/rooms\/([^/]+)/i);
    if (live?.[1]) return canonicalizeLoungeRoomId(decodeURIComponent(live[1]));
    const rooms = url.pathname.match(/\/rooms\/([^/]+)/i);
    if (rooms?.[1] && rooms[1] !== "fan-lobby") {
      return canonicalizeLoungeRoomId(decodeURIComponent(rooms[1]));
    }
  } catch {
    return null;
  }
  return null;
}

export function fanAvatarLobbyEntryHref(
  roomId: string,
  opts?: { from?: string; privacy?: string },
): string {
  const params = new URLSearchParams();
  params.set("roomId", roomId);
  params.set("zone", CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY);
  if (opts?.from) params.set("from", opts.from);
  if (opts?.privacy) params.set("privacy", opts.privacy);
  return `/live/rooms/${encodeURIComponent(roomId)}?${params.toString()}`;
}

export function auditoriumEntryHref(roomId: string, opts?: { from?: string }): string {
  const params = new URLSearchParams();
  params.set("zone", CANONICAL_WORLD_ZONE.AUDITORIUM);
  params.set("from", opts?.from ?? "fan-avatar-lobby");
  return `/live/rooms/${encodeURIComponent(roomId)}?${params.toString()}`;
}

export function performerStageHref(roomId: string, opts?: { from?: string }): string {
  const params = new URLSearchParams();
  params.set("mode", "performer");
  params.set("zone", CANONICAL_WORLD_ZONE.STAGE);
  if (opts?.from) params.set("from", opts.from);
  return `/live/rooms/${encodeURIComponent(roomId)}?${params.toString()}`;
}

/**
 * Fan enter-venue / join-room → SAME canonical roomId as performer STAGE / GO LIVE
 * when a live session exists. Otherwise the 24/7 system-operated lobby (honest empty).
 */
export function resolveFanWorldEntry(input?: {
  joinRoomId?: string | null;
  publishedRoomId?: string | null;
  from?: string;
}): ResolvedFanWorldEntry {
  const join = trimRoomId(input?.joinRoomId);
  const published = trimRoomId(input?.publishedRoomId);
  const candidate = join ?? published;
  const liveSessionPresent = Boolean(candidate && !isSystemOperatedFanLobby(candidate));
  const roomId = liveSessionPresent
    ? candidate!
    : SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID;

  return {
    roomId,
    zone: CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY,
    perspective: "fan",
    liveSessionPresent,
    emptyLobby: !liveSessionPresent,
    sameWorldAsPerformer: liveSessionPresent,
    href: fanAvatarLobbyEntryHref(roomId, { from: input?.from }),
    gate3: "OPEN",
  };
}

export function resolvePerformerWorldEntry(
  roomId: string,
  opts?: { from?: string },
): ResolvedPerformerWorldEntry {
  const id = trimRoomId(roomId) ?? SYSTEM_OPERATED_FAN_LOBBY_ROOM_ID;
  return {
    roomId: id,
    zone: CANONICAL_WORLD_ZONE.STAGE,
    perspective: "performer",
    href: performerStageHref(id, opts),
    gate3: "OPEN",
  };
}

export function entryZoneForRole(role: "fan" | "performer"): CanonicalWorldZone {
  return role === "performer"
    ? CANONICAL_WORLD_ZONE.STAGE
    : CANONICAL_WORLD_ZONE.FAN_AVATAR_LOBBY;
}

export function perspectiveForZone(zone: CanonicalWorldZone): "fan" | "performer" {
  if (
    zone === CANONICAL_WORLD_ZONE.FOH ||
    zone === CANONICAL_WORLD_ZONE.STAGE ||
    zone === CANONICAL_WORLD_ZONE.BACKSTAGE
  ) {
    return "performer";
  }
  return "fan";
}

/**
 * Returns the AudienceScene `view` prop for a given role.
 * Performer = FOH (sees audience from stage). Fan = BOH (sees stage from seats).
 */
export function perspectiveForRole(role: "performer" | "fan"): "performer" | "fan" {
  return role;
}

/**
 * Select FOH vs BOH camera/view for Command Center dual monitors.
 * Monitor A never mounts UVR — performer camera only.
 * Monitor B mounts UVR in audience/BOH mode for the same roomId.
 * Lounge experience uses resolveLoungeMonitorViewport instead.
 */
export function resolvePerformerLobbyMonitorViewport(slot: HubMonitorSlot): ResolvedHubMonitorViewport {
  if (slot === "A") {
    return {
      slot: "A",
      role: "foh",
      zone: CANONICAL_WORLD_ZONE.PERFORMER_LOBBY,
      usesUvr: false,
      uvrMode: null,
      audienceSceneView: "performer",
      label: "MONITOR A · PERFORMER LOBBY · SELECTED PANEL / SELF CAM",
      shortLabel: "PANEL",
    };
  }
  return {
    slot: "B",
    role: "boh",
    zone: CANONICAL_WORLD_ZONE.PERFORMER_LOBBY,
    usesUvr: true,
    uvrMode: "performer",
    audienceSceneView: "performer",
    label: "MONITOR B · PERFORMER LOBBY · FREE-ROAM PANELS",
    shortLabel: "LOBBY",
  };
}

export function resolveHubMonitorViewport(
  slot: HubMonitorSlot,
  opts?: { zone?: CanonicalWorldZone | string | null },
): ResolvedHubMonitorViewport {
  if (isPerformerLobbyZone(opts?.zone)) {
    return resolvePerformerLobbyMonitorViewport(slot);
  }
  if (isLoungeZone(opts?.zone)) {
    return resolveLoungeMonitorViewport(slot);
  }
  if (slot === "A") {
    return {
      slot: "A",
      role: "foh",
      zone: CANONICAL_WORLD_ZONE.FOH,
      usesUvr: false,
      uvrMode: null,
      audienceSceneView: "performer",
      label: "MONITOR A · FOH · STAGE CAMERA",
      shortLabel: "FOH",
    };
  }

  return {
    slot: "B",
    role: "boh",
    zone: CANONICAL_WORLD_ZONE.BOH,
    usesUvr: true,
    uvrMode: "audience",
    audienceSceneView: "fan",
    label: "MONITOR B · BOH · HOUSE VIEW",
    shortLabel: "BOH",
  };
}

/**
 * Lounge Monitor A/B — same viewport law as hub, different feeds.
 * A = conversation / self cam after explicit CAM. B = group/room view. No avatars.
 */
export function resolveLoungeMonitorViewport(slot: HubMonitorSlot): ResolvedHubMonitorViewport {
  if (slot === "A") {
    return {
      slot: "A",
      role: "foh",
      zone: CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM,
      usesUvr: false,
      uvrMode: null,
      audienceSceneView: "fan",
      label: "MONITOR A · LOUNGE · CONVERSATION / SELF CAM",
      shortLabel: "TALK",
    };
  }
  return {
    slot: "B",
    role: "boh",
    zone: CANONICAL_WORLD_ZONE.LOUNGE_SIDE_ROOM,
    usesUvr: true,
    uvrMode: "audience",
    audienceSceneView: "fan",
    label: "MONITOR B · LOUNGE · GROUP / ROOM VIEW",
    shortLabel: "ROOM",
  };
}

import type { WorldScenePlan } from "@/lib/world/WorldScenePlan";
import { worldScenePlanToRenderProps } from "@/lib/world/WorldScenePlan";

/** Map resolved viewport → UniversalVenueRenderer props (Monitor B only). */
export function hubMonitorUvrProps(
  slot: HubMonitorSlot,
  roomId: string,
  opts?: {
    instantEmptyStage?: boolean;
    forceStadiumFill?: boolean;
    zone?: CanonicalWorldZone | string | null;
    /** When set, World Director scene plan overrides venue defaults for Monitor B. */
    scenePlan?: WorldScenePlan | null;
  },
) {
  const vp = resolveHubMonitorViewport(slot, {
    zone: opts?.scenePlan?.canonicalZone ?? opts?.zone,
  });
  if (!vp.usesUvr || !vp.uvrMode) {
    return null;
  }
  const lounge = isLoungeZone(vp.zone) || isLoungeRoomId(roomId);
  const performerLobby = isPerformerLobbyZone(vp.zone);
  const videoPanelZone = lounge || performerLobby;

  if (opts?.scenePlan) {
    const fromPlan = worldScenePlanToRenderProps(opts.scenePlan);
    return {
      roomId,
      mode: vp.uvrMode,
      venueIndex: fromPlan.venueIndex,
      hubVenueOnly: true,
      hubViewportRole: vp.role,
      canonicalZone: fromPlan.canonicalZone,
      instantEmptyStage: fromPlan.instantEmptyStage,
      forceStadiumFill: videoPanelZone ? false : fromPlan.forceStadiumFill,
      suppressAvatars: videoPanelZone || fromPlan.suppressAvatars,
      isPreview: fromPlan.isPreview,
      forcedOccupancyRatio: fromPlan.forcedOccupancyRatio,
      previewCapacity: fromPlan.previewCapacity,
      viewMode: fromPlan.viewMode,
      spatialMap: fromPlan.spatialMap,
    };
  }

  return {
    roomId,
    mode: vp.uvrMode,
    venueIndex: 1 as const,
    hubVenueOnly: true,
    hubViewportRole: vp.role,
    canonicalZone: vp.zone,
    instantEmptyStage: opts?.instantEmptyStage ?? true,
    forceStadiumFill: videoPanelZone ? false : (opts?.forceStadiumFill ?? false),
    suppressAvatars: videoPanelZone || !zoneAllowsAvatars(vp.zone),
  };
}
