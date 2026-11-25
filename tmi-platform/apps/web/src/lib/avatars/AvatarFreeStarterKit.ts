/**
 * AvatarFreeStarterKit — browser-safe free starter ID lists.
 * No Prisma / merchandising / ownership. Economy policy composes on top.
 */

export const FREE_STARTER_KIT_IDS = [
  // hair (subset — full free hair still via pointsCost===0)
  "hair_fade_short",
  "hair_afro",
  "hair_locs",
  "hair_braids",
  "hair_straight_classic",
  "hair_bob_classic",
  // tops / outer
  "street_fit",
  "tee_basic_black",
  "tee_basic_white",
  "tee_basic_cyan",
  "hoodie_street_midnight_obsidian",
  // bottoms
  "pants_fit_black",
  "pants_fit_denim",
  // shoes
  "kicks_white",
  "kicks_black",
  // head / face
  "street_beanie",
  "beanie_knit_black",
  "glasses_black",
  "backwards_cap",
  // actions / emote / prop — permanent free starters (§11484–§11507)
  "emote_clap",
  "emote_heart",
  "emote_dance",
  "emote_wave",
  "glow_stick",
  // free holdables already priced 0 in catalog
  "mic",
  "lighter",
  "candle",
] as const;

export const FREE_STARTER_ACTIONS = ["emote_clap", "emote_heart"] as const;
export const FREE_STARTER_DANCE = "emote_dance" as const;
export const FREE_STARTER_PROP = "glow_stick" as const;

/** Categories with no finished starter asset in current catalog. */
export const STARTER_ASSET_GAPS = [
  "STARTER_SOCKS",
  "STARTER_SHORTS",
  "STARTER_RINGS",
  "STARTER_EARRINGS",
  "STARTER_BRACELETS",
  "STARTER_WATCHES",
  "STARTER_FREE_BASIC_JEWELRY",
] as const;
