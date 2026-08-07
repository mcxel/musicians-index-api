/**
 * Locked points spend categories — wire to existing engines only.
 * Anti pay-to-win: never judged-outcome votes, never purchased rank/chart.
 *
 * Categories:
 * - participation — battle/cypher/challenge/gauntlet entry / ready-up
 * - cosmetics — emotes/accessories (avatars Fan-only Rule 26)
 * - venue_upgrade — venue skins (performer store)
 * - playlist_skin — PlaylistArtifactEngine SKIN_REGISTRY points path
 * - yopho — YoPho backgrounds / canvas skins (Fan + Performer)
 * - booster — exposure/participation boosts only (Rule 20/25)
 * - scene / background / menu — shared cosmetic surfaces
 */

import {
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import { CHALLENGE_ENTRY_FEE_POINTS } from "@/lib/competition/BattleChallengeEconomyEngine";
import { VENUE_SKINS } from "@/lib/venue/venueSkinEngine";
import { getSkinPriceCents } from "@/lib/venue/VenueSkinCommerce";
import { YOPHO_SKIN_CATALOG } from "@/lib/yopho/YoPhoSkinRegistry";
import { YOPHO_SCENE_PACKS } from "@/lib/yopho/YoPhoScenePack";

export type PointsSpendCategory =
  | "participation"
  | "cosmetics"
  | "venue_upgrade"
  | "playlist_skin"
  | "yopho"
  | "booster"
  | "scene"
  | "background"
  | "menu";

export type PointsSpendRole = "FAN" | "PERFORMER" | "SHARED";

export type PointsSpendOffer = {
  id: string;
  category: PointsSpendCategory;
  label: string;
  pointsCost: number;
  /** Who may purchase / own */
  role: PointsSpendRole;
  /** Deep link into existing store / room surface */
  href: string;
  engine: string;
  note?: string;
};

/** Event participation costs — access/entry only, never outcome purchase. */
export const PARTICIPATION_POINT_COSTS = {
  battle_free: 0,
  battle_standard: 15,
  battle_premium: 30,
  battle_elite: 75,
  challenge_entry: CHALLENGE_ENTRY_FEE_POINTS,
  cypher_entry: 10,
  gauntlet_entry: 25,
  ready_up: 5,
  /** Display/visibility boost in queue — NOT a judged vote weight. */
  participation_boost: 20,
} as const;

export type ParticipationCostKey = keyof typeof PARTICIPATION_POINT_COSTS;

export function participationCost(key: ParticipationCostKey | string): number {
  if (key in PARTICIPATION_POINT_COSTS) {
    return PARTICIPATION_POINT_COSTS[key as ParticipationCostKey];
  }
  return 0;
}

/** Exposure boosters — never rank/chart position (Rule 20/25). */
export const BOOSTER_POINT_OFFERS: PointsSpendOffer[] = [
  {
    id: "boost_discovery_24h",
    category: "booster",
    label: "Discovery Exposure Boost (24h)",
    pointsCost: 150,
    role: "PERFORMER",
    href: "/store/creator#boosters",
    engine: "ArtistBoost / Opportunity Dock",
    note: "Extra discovery exposure only — never buys chart rank.",
  },
  {
    id: "boost_participation_queue",
    category: "booster",
    label: "Participation Queue Boost",
    pointsCost: PARTICIPATION_POINT_COSTS.participation_boost,
    role: "SHARED",
    href: "/battles",
    engine: "BattleChallengeEconomyEngine",
    note: "Ready-up / queue visibility — not a judged vote.",
  },
];

function playlistSkinOffers(): PointsSpendOffer[] {
  const offers: PointsSpendOffer[] = [];
  for (const [id, entry] of Object.entries(MEDIA_PLAYER_CHASSIS_REGISTRY)) {
    if (entry.unlockMethod !== "points") continue;
    const cost = entry.pricePoints ?? entry.pointsCost ?? 0;
    if (cost <= 0) continue;
    offers.push({
      id: `playlist_skin_${id}`,
      category: "playlist_skin",
      label: entry.label ?? id,
      pointsCost: cost,
      role: "SHARED",
      href: "/store/media-players",
      engine: "PlaylistArtifactEngine / MediaPlayerOwnershipService",
      note: "Playlist / media-player chassis skin",
    });
  }
  return offers;
}

function venueSkinOffers(): PointsSpendOffer[] {
  return Object.keys(VENUE_SKINS).map((skinId) => {
    // Map USD cents → points at ~1¢ ≈ 1 pt impulse scale (honest catalog cost).
    const cents = getSkinPriceCents(skinId);
    return {
      id: `venue_skin_${skinId}`,
      category: "venue_upgrade" as const,
      label: skinId.replace(/-/g, " "),
      pointsCost: Math.max(100, cents),
      role: "PERFORMER" as const,
      href: "/store/venue-skins",
      engine: "VenueSkinCommerce",
      note: "Performer venue skin / stage upgrade",
    };
  });
}

/** Fan cosmetics — avatar ownership UI stays Fan-only (Rule 26). */
export const FAN_COSMETIC_OFFERS: PointsSpendOffer[] = [
  {
    id: "cosmetic_emote_pack_basic",
    category: "cosmetics",
    label: "Emote Pack — Basic",
    pointsCost: 120,
    role: "FAN",
    href: "/store/fan#cosmetics",
    engine: "FanStoreEngine / Inventory",
  },
  {
    id: "cosmetic_accessory_glow",
    category: "cosmetics",
    label: "Accessory — Neon Glow",
    pointsCost: 200,
    role: "FAN",
    href: "/store/fan#cosmetics",
    engine: "Avatar Inventory (Fan-only)",
  },
  {
    id: "scene_lobby_neon",
    category: "scene",
    label: "Scene — Neon Lobby",
    pointsCost: 250,
    role: "FAN",
    href: "/store/lobbies",
    engine: "Lobby skins",
  },
  {
    id: "background_vice_night",
    category: "background",
    label: "Background — Vice Night",
    pointsCost: 180,
    role: "SHARED",
    href: "/store/flex",
    engine: "FlexStoreLedger",
  },
  {
    id: "menu_chrome_frame",
    category: "menu",
    label: "Menu Frame — Chrome",
    pointsCost: 150,
    role: "SHARED",
    href: "/store/flex",
    engine: "FlexStoreLedger",
  },
];

export const PARTICIPATION_OFFERS: PointsSpendOffer[] = [
  {
    id: "part_battle_standard",
    category: "participation",
    label: "Battle Entry — Standard",
    pointsCost: PARTICIPATION_POINT_COSTS.battle_standard,
    role: "SHARED",
    href: "/battles",
    engine: "battles/enter + Wallet.fanCredits",
    note: "Entry fee only — never buys the win.",
  },
  {
    id: "part_challenge",
    category: "participation",
    label: "Challenge Entry",
    pointsCost: PARTICIPATION_POINT_COSTS.challenge_entry,
    role: "SHARED",
    href: "/challenges",
    engine: "BattleChallengeEconomyEngine",
  },
  {
    id: "part_cypher",
    category: "participation",
    label: "Cypher Entry",
    pointsCost: PARTICIPATION_POINT_COSTS.cypher_entry,
    role: "SHARED",
    href: "/cypher",
    engine: "Cypher entry hook",
  },
  {
    id: "part_gauntlet",
    category: "participation",
    label: "Gauntlet Entry",
    pointsCost: PARTICIPATION_POINT_COSTS.gauntlet_entry,
    role: "SHARED",
    href: "/gauntlet",
    engine: "Gauntlet entry hook",
  },
  {
    id: "part_ready_up",
    category: "participation",
    label: "Ready Up",
    pointsCost: PARTICIPATION_POINT_COSTS.ready_up,
    role: "SHARED",
    href: "/battles",
    engine: "participationSpend",
  },
];

/** YoPho canvas skins + scene backgrounds — Fan AND Performer (Rule 15/26 matrices). */
function yophoOffers(): PointsSpendOffer[] {
  const skins: PointsSpendOffer[] = YOPHO_SKIN_CATALOG.filter(
    (s) => !s.isFreeStarter && s.priceUsd > 0,
  ).map((skin) => ({
    id: `yopho_skin_${skin.id}`,
    category: "yopho" as const,
    label: `YoPho Skin — ${skin.name.replace(/\s*\(\$0\.99\)\s*$/i, "").trim()}`,
    // $0.99 skins → 99 pts impulse (matches CoD micro pack psychology)
    pointsCost: Math.max(99, Math.round(skin.priceUsd * 100)),
    role: "SHARED" as const,
    href: "/fan/canvas",
    engine: "YoPhoSkinRegistry",
    note: "Canvas background / room skin — Fan + Performer",
  }));

  const scenes: PointsSpendOffer[] = YOPHO_SCENE_PACKS.filter(
    (s) => s.id !== "none" && s.category !== "solid",
  ).map((scene) => ({
    id: `yopho_scene_${scene.id}`,
    category: "yopho" as const,
    label: `YoPho BG — ${scene.label}`,
    pointsCost: 75,
    role: "SHARED" as const,
    href: "/performer/canvas",
    engine: "YoPhoScenePack",
    note: scene.tagline,
  }));

  return [...skins, ...scenes];
}

export function listPointsSpendOffers(role?: "FAN" | "PERFORMER" | "ALL"): PointsSpendOffer[] {
  const all = [
    ...PARTICIPATION_OFFERS,
    ...BOOSTER_POINT_OFFERS,
    ...playlistSkinOffers(),
    ...venueSkinOffers(),
    ...yophoOffers(),
    ...FAN_COSMETIC_OFFERS,
  ];
  if (!role || role === "ALL") return all;
  return all.filter((o) => o.role === "SHARED" || o.role === role);
}

/** Chassis id helper for spend API playlist_skin path. */
export function chassisIdFromSpendOfferId(offerId: string): MediaPlayerChassisId | null {
  if (!offerId.startsWith("playlist_skin_")) return null;
  const id = offerId.replace("playlist_skin_", "");
  return id in MEDIA_PLAYER_CHASSIS_REGISTRY ? (id as MediaPlayerChassisId) : null;
}

export function yophoSkinIdFromOfferId(offerId: string): string | null {
  if (!offerId.startsWith("yopho_skin_")) return null;
  const id = offerId.replace("yopho_skin_", "");
  return YOPHO_SKIN_CATALOG.some((s) => s.id === id) ? id : null;
}

export function yophoSceneIdFromOfferId(offerId: string): string | null {
  if (!offerId.startsWith("yopho_scene_")) return null;
  const id = offerId.replace("yopho_scene_", "");
  return YOPHO_SCENE_PACKS.some((s) => s.id === id) ? id : null;
}
