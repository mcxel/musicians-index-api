/**
 * EventVenueEnvironment — indoor | outdoor mode for event Venue Runtime (Rule 21).
 * One runtime; mode flag only. No IndoorVenueV2.
 *
 * Marcel locks:
 * - Lounges + Lobbies: EXEMPT (no indoor/outdoor split).
 * - Monday Night Stage: ALWAYS indoor unless specialYearlyOutdoor.
 * - Official game shows (Deal or Feud 1000, Circle & Squares, Name That Tune, …): ALWAYS indoor.
 * - Battles, Cyphers, Challenges, Concerts, Releases, WDP, Slow Jams, Minis, Gauntlets, Live: both.
 */

import {
  getVenueSkin,
  listVenueSkins,
  type VenueSkin,
} from "@/lib/venue/venueSkinEngine";

export type VenueEnvironmentKind = "indoor" | "outdoor";

/** Event kinds that participate in venue environment resolution. */
export type EventVenueKind =
  | "battle"
  | "challenge"
  | "cypher"
  | "gauntlet"
  | "concert"
  | "world-release"
  | "mini-concert"
  | "mini-release"
  | "world-dance-party"
  | "mini-dance-party"
  | "slow-jams"
  | "mini-slow-jam"
  | "live-show"
  | "monday-night-stage"
  | "deal-or-feud"
  | "circle-squares"
  | "name-that-tune"
  | "dirty-dozens"
  | "game-show"
  | "lounge"
  | "fan-lobby"
  | "performer-lobby";

export type VenueEnvironmentPolicy =
  | "split" /** indoor + outdoor selectable */
  | "indoor_only" /** always indoor; outdoor only via special yearly flag where allowed */
  | "exempt"; /** lounges / lobbies — no split UI */

export interface EventVenueEnvironmentResolution {
  kind: EventVenueKind;
  policy: VenueEnvironmentPolicy;
  environment: VenueEnvironmentKind | null;
  /** False when outdoor picker must be hidden. */
  outdoorAllowed: boolean;
  skinId: string | null;
  skin: VenueSkin | null;
  assetAvailable: boolean;
  label: string;
  venueIndex: 0 | 1 | 2 | 3 | 4 | 5;
  ambientEnergy: number;
  copyTone: "hype" | "chill" | "neutral";
}

/** Official Deal or Feud 1000 + Circle & Squares + Name That Tune (+ other official games). */
export const OFFICIAL_INDOOR_ONLY_GAME_KINDS = [
  "deal-or-feud",
  "circle-squares",
  "name-that-tune",
  "dirty-dozens",
  "game-show",
] as const satisfies readonly EventVenueKind[];

const EXEMPT_KINDS = new Set<EventVenueKind>(["lounge", "fan-lobby", "performer-lobby"]);

const INDOOR_ONLY_KINDS = new Set<EventVenueKind>([
  "monday-night-stage",
  ...OFFICIAL_INDOOR_ONLY_GAME_KINDS,
]);

/** Default skins per kind × environment (existing venueSkinEngine ids). */
const DEFAULT_SKINS: Partial<
  Record<EventVenueKind, { indoor: string; outdoor: string }>
> = {
  battle: { indoor: "underground-battle", outdoor: "festival" },
  challenge: { indoor: "warehouse", outdoor: "festival" },
  cypher: { indoor: "street-corner", outdoor: "beach" },
  gauntlet: { indoor: "underground-battle", outdoor: "festival" },
  concert: { indoor: "concert-hall", outdoor: "festival" },
  "world-release": { indoor: "concert-hall", outdoor: "festival" },
  "mini-concert": { indoor: "red-theater", outdoor: "beach" },
  "mini-release": { indoor: "red-theater", outdoor: "beach" },
  "world-dance-party": { indoor: "neon-club", outdoor: "festival" },
  "mini-dance-party": { indoor: "neon-club", outdoor: "festival" },
  "slow-jams": { indoor: "luxury-lounge", outdoor: "under-the-stars" },
  "mini-slow-jam": { indoor: "luxury-lounge", outdoor: "under-the-stars" },
  "live-show": { indoor: "tv-studio", outdoor: "festival" },
  "monday-night-stage": { indoor: "red-theater", outdoor: "festival" },
  "deal-or-feud": { indoor: "tv-studio", outdoor: "tv-studio" },
  "circle-squares": { indoor: "tv-studio", outdoor: "tv-studio" },
  "name-that-tune": { indoor: "tv-studio", outdoor: "tv-studio" },
  "dirty-dozens": { indoor: "tv-studio", outdoor: "tv-studio" },
  "game-show": { indoor: "tv-studio", outdoor: "tv-studio" },
};

const DEFAULT_ENV: Partial<Record<EventVenueKind, VenueEnvironmentKind>> = {
  "world-dance-party": "outdoor",
  "mini-dance-party": "outdoor",
  "slow-jams": "outdoor",
  "mini-slow-jam": "outdoor",
  battle: "indoor",
  challenge: "outdoor",
  cypher: "indoor",
  gauntlet: "indoor",
  concert: "indoor",
  "world-release": "indoor",
  "mini-concert": "indoor",
  "mini-release": "indoor",
  "live-show": "indoor",
  "monday-night-stage": "indoor",
  "deal-or-feud": "indoor",
  "circle-squares": "indoor",
  "name-that-tune": "indoor",
  "dirty-dozens": "indoor",
  "game-show": "indoor",
};

export function getVenueEnvironmentPolicy(kind: EventVenueKind): VenueEnvironmentPolicy {
  if (EXEMPT_KINDS.has(kind)) return "exempt";
  if (INDOOR_ONLY_KINDS.has(kind)) return "indoor_only";
  return "split";
}

/** Hide outdoor in create/runtime UI unless special yearly for Monday Night Stage. */
export function isOutdoorSelectable(
  kind: EventVenueKind,
  opts?: { specialYearlyOutdoor?: boolean },
): boolean {
  const policy = getVenueEnvironmentPolicy(kind);
  if (policy === "exempt") return false;
  if (policy === "split") return true;
  if (kind === "monday-night-stage" && opts?.specialYearlyOutdoor === true) return true;
  return false;
}

export function normalizeEventVenueKind(
  raw: string | null | undefined,
): EventVenueKind | null {
  if (!raw) return null;
  const s = raw.toLowerCase().replace(/_/g, "-").trim();
  if (s.includes("monday") && s.includes("stage")) return "monday-night-stage";
  if (s.includes("deal-or-feud") || s.includes("dealorsfeud") || s === "deal-or-feud-1000") {
    return "deal-or-feud";
  }
  if (s.includes("circle") && s.includes("square")) return "circle-squares";
  if (s.includes("name-that-tune") || s.includes("name that tune")) return "name-that-tune";
  if (s.includes("dirty") && s.includes("dozen")) return "dirty-dozens";
  if (s.includes("game-show") || s.includes("dealers-choice")) return "game-show";
  if (s.includes("slow-jam")) return s.includes("mini") ? "mini-slow-jam" : "slow-jams";
  if (s.includes("world-dance") || s === "dance-party") {
    return s.includes("mini") ? "mini-dance-party" : "world-dance-party";
  }
  if (s.includes("mini-dance")) return "mini-dance-party";
  if (s.includes("world-release")) return "world-release";
  if (s.includes("mini-release")) return "mini-release";
  if (s.includes("mini-concert")) return "mini-concert";
  if (s.includes("concert") || s.includes("live-online")) return "concert";
  if (s.includes("gauntlet")) return "gauntlet";
  if (s.includes("battle")) return "battle";
  if (s.includes("cypher") || s.includes("cipher")) return "cypher";
  if (s.includes("challenge")) return "challenge";
  if (s.includes("fan-lobby") || s.includes("fan_lobby")) return "fan-lobby";
  if (s.includes("performer-lobby")) return "performer-lobby";
  if (s.includes("lounge") || s.includes("vip")) return "lounge";
  if (s.includes("live")) return "live-show";
  return null;
}

function skinLooksAvailable(skin: VenueSkin): boolean {
  return Boolean(skin.backgroundImage && skin.backgroundImage.length > 4);
}

function venueIndexFor(env: VenueEnvironmentKind, kind: EventVenueKind): 0 | 1 | 2 | 3 | 4 | 5 {
  if (env === "outdoor") return 3;
  if (kind === "world-dance-party" || kind === "mini-dance-party") return 1;
  if (kind === "slow-jams" || kind === "mini-slow-jam") return 2;
  if (kind === "monday-night-stage" || kind.includes("feud") || kind.includes("tune") || kind.includes("square")) {
    return 0;
  }
  return 1;
}

export function resolveEventVenueEnvironment(input: {
  kind: EventVenueKind | string;
  environment?: VenueEnvironmentKind | null;
  skinId?: string | null;
  specialYearlyOutdoor?: boolean;
}): EventVenueEnvironmentResolution {
  const kind =
    typeof input.kind === "string"
      ? normalizeEventVenueKind(input.kind) ?? (input.kind as EventVenueKind)
      : input.kind;
  const policy = getVenueEnvironmentPolicy(kind);

  if (policy === "exempt") {
    return {
      kind,
      policy,
      environment: null,
      outdoorAllowed: false,
      skinId: null,
      skin: null,
      assetAvailable: false,
      label: "Lounge / lobby — no indoor/outdoor split",
      venueIndex: 0,
      ambientEnergy: 0.4,
      copyTone: "neutral",
    };
  }

  const outdoorAllowed = isOutdoorSelectable(kind, {
    specialYearlyOutdoor: input.specialYearlyOutdoor,
  });

  let environment: VenueEnvironmentKind =
    input.environment ?? DEFAULT_ENV[kind] ?? "indoor";
  if (!outdoorAllowed) {
    environment = "indoor";
  }

  const defaults = DEFAULT_SKINS[kind] ?? { indoor: "neon-club", outdoor: "festival" };
  const preferredId =
    input.skinId?.trim() ||
    (environment === "outdoor" ? defaults.outdoor : defaults.indoor);
  const skin = getVenueSkin(preferredId);
  const assetAvailable = skinLooksAvailable(skin);
  const chill = kind === "slow-jams" || kind === "mini-slow-jam";

  return {
    kind,
    policy,
    environment,
    outdoorAllowed,
    skinId: preferredId,
    skin,
    assetAvailable,
    label:
      environment === "outdoor"
        ? chill
          ? "Under the Stars · outdoor night"
          : "Outdoor amphitheater / festival"
        : chill
          ? "Indoor lounge · soft glow"
          : kind === "deal-or-feud"
            ? "Deal or Feud 1000 · studio floor"
            : "Indoor stage / club",
    venueIndex: venueIndexFor(environment, kind),
    ambientEnergy: chill ? 0.28 : environment === "outdoor" ? 0.8 : 0.65,
    copyTone: chill ? "chill" : "hype",
  };
}

/** Skins offered when outdoor/indoor picker is shown (existing catalog only). */
export function listSkinsForEventEnvironment(
  kind: EventVenueKind,
  environment: VenueEnvironmentKind,
): VenueSkin[] {
  if (getVenueEnvironmentPolicy(kind) === "exempt") return [];
  if (!isOutdoorSelectable(kind) && environment === "outdoor") return [];
  const all = listVenueSkins();
  if (environment === "outdoor") {
    return all.filter(
      (s) =>
        s.tags.includes("outdoor") ||
        s.tags.includes("festival") ||
        s.tags.includes("chill") ||
        s.id === "under-the-stars" ||
        s.id === "festival" ||
        s.id === "beach",
    );
  }
  return all.filter(
    (s) =>
      s.tags.includes("club") ||
      s.tags.includes("theater") ||
      s.tags.includes("studio") ||
      s.tags.includes("vip") ||
      s.tags.includes("battle") ||
      s.id === "neon-club" ||
      s.id === "luxury-lounge" ||
      s.id === "tv-studio" ||
      s.id === "red-theater",
  );
}
