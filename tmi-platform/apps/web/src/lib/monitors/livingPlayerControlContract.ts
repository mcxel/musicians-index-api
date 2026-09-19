/**
 * LivingPlayerControlContract — shared Living OS monitor control grammar.
 * Same physical language for every eligible interactive TMI player.
 * Role + capability + destination decide which commands are available.
 * MAX_INTERNAL_VIEWS_PER_MONITOR = 8 (never 16 inside one monitor).
 */

import {
  resolveRoleMediaWorkspace,
  type MediaWorkspaceRole,
} from "@/lib/monitors/RoleMediaWorkspaceAuthority";

export const MAX_INTERNAL_VIEWS_PER_MONITOR = 8 as const;
export const UNIVERSAL_VIEW_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type LivingViewCount = (typeof UNIVERSAL_VIEW_COUNTS)[number];

export type LivingPlayerCommand =
  | "WATCH"
  | "FOCUS"
  | "LAYOUT"
  | "VIEW"
  | "STATION"
  | "ROOM"
  | "PREV"
  | "NEXT"
  | "PICK"
  | "SOURCE"
  | "MIX"
  | "SWITCH"
  | "INFO"
  | "PIN"
  | "FULL"
  | "INSPECT"
  | "DETACH"
  | "SAVE_LAYOUT"
  | "RESET";

export type LivingPlayerStationFamily =
  | "LIVE_LOBBY_WALL"
  | "PERFORMER_LIVE"
  | "LOUNGES"
  | "BATTLES"
  | "CHALLENGES"
  | "CYPHERS"
  | "GAME_SHOWS"
  | "MONDAY_NIGHT_STAGE"
  | "WORLD_DANCE_PARTY"
  | "FAN_LOBBIES"
  | "PLAYLIST"
  | "TMI_TV"
  | "MAGAZINE_TV"
  | "CALLS"
  | "WORLDS"
  | "AUTOMATED_BOT_ROOMS"
  | "MY_LIVE_SESSION"
  | "REHEARSAL"
  | "EDITORIAL"
  | "CAMPAIGN_PREVIEW"
  | "SPONSOR_PREVIEW"
  | "VENUE_PROGRAM"
  | "EVENT_PROGRAM";

const CORE_COMMANDS: LivingPlayerCommand[] = [
  "WATCH",
  "FOCUS",
  "LAYOUT",
  "VIEW",
  "STATION",
  "ROOM",
  "PREV",
  "NEXT",
  "PICK",
  "SOURCE",
  "MIX",
  "SWITCH",
  "INFO",
  "PIN",
  "FULL",
];

const ADMIN_EXTRA: LivingPlayerCommand[] = ["INSPECT", "DETACH", "SAVE_LAYOUT", "RESET"];
const DESKTOP_EXTRA: LivingPlayerCommand[] = ["DETACH", "SAVE_LAYOUT", "RESET"];

export type LivingPlayerCapabilityProfile = {
  role: MediaWorkspaceRole;
  livingOsControlBed: true;
  maxInternalViewsPerMonitor: 8;
  monitorInstanceCount: 1 | 2;
  commands: LivingPlayerCommand[];
  stations: LivingPlayerStationFamily[];
  companionInfoFamilies: string[];
  privilegedOps: boolean;
};

const FAN_STATIONS: LivingPlayerStationFamily[] = [
  "LIVE_LOBBY_WALL",
  "LOUNGES",
  "BATTLES",
  "CHALLENGES",
  "CYPHERS",
  "GAME_SHOWS",
  "WORLD_DANCE_PARTY",
  "FAN_LOBBIES",
  "PLAYLIST",
  "TMI_TV",
  "MAGAZINE_TV",
  "CALLS",
  "WORLDS",
];

const PERFORMER_STATIONS: LivingPlayerStationFamily[] = [
  ...FAN_STATIONS,
  "MY_LIVE_SESSION",
  "REHEARSAL",
  "PERFORMER_LIVE",
];

const ADMIN_STATIONS: LivingPlayerStationFamily[] = [
  ...PERFORMER_STATIONS,
  "AUTOMATED_BOT_ROOMS",
  "MONDAY_NIGHT_STAGE",
];

export function resolveLivingPlayerCapabilities(
  role: string,
  opts?: { desktop?: boolean },
): LivingPlayerCapabilityProfile {
  const workspace = resolveRoleMediaWorkspace(role);
  const r = workspace.role;
  const desktop = opts?.desktop !== false;

  let stations: LivingPlayerStationFamily[] = FAN_STATIONS;
  let companionInfoFamilies = ["room", "audience", "queue", "now_playing", "reactions"];
  let commands = [...CORE_COMMANDS];
  let privilegedOps = false;

  if (r === "PERFORMER" || r === "BAND" || r === "GROUP") {
    stations = PERFORMER_STATIONS;
    companionInfoFamilies = [
      "room",
      "audience",
      "queue",
      "program",
      "show_state",
      "performance",
    ];
  } else if (r === "ADMIN" || r === "OBSERVATORY") {
    stations = ADMIN_STATIONS;
    companionInfoFamilies = [
      "analytics",
      "revenue",
      "audience",
      "rooms",
      "lobby_wall",
      "bots",
      "rankings",
      "presentation",
      "webrtc",
      "commerce",
      "submissions",
      "alerts",
      "legal",
      "health",
    ];
    commands = [...CORE_COMMANDS, ...ADMIN_EXTRA];
    privilegedOps = true;
  } else if (r === "WRITER" || r === "INTERVIEWER") {
    stations = ["EDITORIAL", "CALLS", "PLAYLIST", "TMI_TV", "MAGAZINE_TV"];
    companionInfoFamilies = ["editorial", "program", "call"];
  } else if (r === "ADVERTISER") {
    stations = ["CAMPAIGN_PREVIEW", "TMI_TV", "PLAYLIST"];
    companionInfoFamilies = ["campaign", "placement", "program"];
  } else if (r === "SPONSOR") {
    stations = ["SPONSOR_PREVIEW", "TMI_TV", "PLAYLIST"];
    companionInfoFamilies = ["sponsorship", "placement", "program"];
  } else if (r === "VENUE") {
    stations = ["VENUE_PROGRAM", "LIVE_LOBBY_WALL", "WORLDS"];
    companionInfoFamilies = ["venue", "program", "jumbotron", "room"];
  } else if (r === "PROMOTER") {
    stations = ["EVENT_PROGRAM", "LIVE_LOBBY_WALL", "VENUE_PROGRAM"];
    companionInfoFamilies = ["event", "venue", "program", "audience"];
  }

  if (desktop && !privilegedOps) {
    commands = [...commands, ...DESKTOP_EXTRA.filter((c) => !commands.includes(c))];
  }

  return {
    role: r,
    livingOsControlBed: true,
    maxInternalViewsPerMonitor: MAX_INTERNAL_VIEWS_PER_MONITOR,
    monitorInstanceCount: workspace.monitorInstanceCount,
    commands,
    stations,
    companionInfoFamilies,
    privilegedOps,
  };
}

export function clampLivingViewCount(n: number): LivingViewCount {
  const c = Math.max(1, Math.min(MAX_INTERNAL_VIEWS_PER_MONITOR, Math.round(n)));
  return c as LivingViewCount;
}

export function livingPlayerRoleMatrix(): LivingPlayerCapabilityProfile[] {
  const roles: MediaWorkspaceRole[] = [
    "FAN",
    "PERFORMER",
    "WRITER",
    "ADVERTISER",
    "SPONSOR",
    "VENUE",
    "PROMOTER",
    "ADMIN",
  ];
  return roles.map((role) => resolveLivingPlayerCapabilities(role));
}
