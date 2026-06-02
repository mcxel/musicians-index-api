/**
 * HeroRegistry — TMI Platform Hero Characters
 * BerntoutGlobal LLC
 *
 * The official roster of TMI named characters.
 * These are the identities that define the platform's visual world.
 *
 * Each hero has:
 *   - A platform role (host, performer, fan, brand)
 *   - A signature move (used in animations + XP celebrations)
 *   - An evolution track (Rookie → Icon)
 *   - Venue priority (heroes appear in front rows, not back of crowd)
 *   - Rarity (determines spawn frequency in audience scenes)
 *
 * P10A: Data registry only — no 3D models yet.
 * P11: High-fidelity 3D rigs injected.
 * P12: Face-scan overlay, motion capture, full World population.
 */

export type HeroRole =
  | "host"          // MC, show host, game show host
  | "performer"     // Live performer, rapper, singer, beatmaker
  | "fan"           // Fan avatar — attends shows, tips, votes
  | "mascot"        // Platform mascot / brand character
  | "duo"           // 2-character unit (e.g. Redbeard & Specs)
  | "group";        // Multi-character group (e.g. Luxe Trio)

export type HeroRarity =
  | "iconic"        // Always visible, platform face
  | "legendary"     // Rare spawn, XP milestone reward
  | "rare"          // Occasional presence
  | "uncommon"      // Regular fan/audience member
  | "standard";     // Default crowd filler

export type EvolutionTier =
  | "Rookie"        // 0–999 XP
  | "Rising"        // 1,000–4,999 XP
  | "Established"   // 5,000–14,999 XP
  | "Star"          // 15,000–39,999 XP
  | "Legend"        // 40,000–99,999 XP
  | "Icon";         // 100,000+ XP — the top

export interface HeroCharacter {
  id:              string;
  displayName:     string;
  shortName:       string;
  role:            HeroRole;
  rarity:          HeroRarity;
  accentColor:     string;        // primary color in UI + AudienceScene glow
  secondaryColor:  string;
  emoji:           string;        // fallback representation
  signatureMove:   string;        // animation name in dance/celebrate flows
  description:     string;        // lore / bio
  xpTrack:         EvolutionXPTrack;
  venuePriority:   number;        // 1 = front row, 10 = back crowd
  bodyType:        "slim" | "athletic" | "average" | "heavy" | "duo" | "trio";
  ageGroup:        "youth" | "young_adult" | "adult" | "senior";
  homeVenue:       string;        // preferred venue slug
  linkedEmail?:    string;        // platform account binding (optional)
  isAvailable:     boolean;       // set false if character is in development
}

export interface EvolutionXPTrack {
  rookie:      number;  // XP floor for Rookie    (always 0)
  rising:      number;  // XP to reach Rising
  established: number;  // XP to reach Established
  star:        number;  // XP to reach Star
  legend:      number;  // XP to reach Legend
  icon:        number;  // XP to reach Icon
}

export const STANDARD_XP_TRACK: EvolutionXPTrack = {
  rookie:      0,
  rising:      1_000,
  established: 5_000,
  star:        15_000,
  legend:      40_000,
  icon:        100_000,
};

// ── TMI Hero Roster ──────────────────────────────────────────────────────────

export const HERO_REGISTRY: HeroCharacter[] = [
  {
    id:            "bebo",
    displayName:   "Bebo",
    shortName:     "Bebo",
    role:          "mascot",
    rarity:        "iconic",
    accentColor:   "#00FFFF",
    secondaryColor:"#FF2DAA",
    emoji:         "🤖",
    signatureMove: "Robot-Lock",
    description:   "TMI's original mascot. A futuristic robot with a love for hip-hop and precision. Bebo hosts warm-ups, guides new users, and anchors the platform's main stage.",
    xpTrack:       STANDARD_XP_TRACK,
    venuePriority: 1,
    bodyType:      "athletic",
    ageGroup:      "young_adult",
    homeVenue:     "world-concert",
    isAvailable:   true,
  },
  {
    id:            "julius",
    displayName:   "Julius",
    shortName:     "Julius",
    role:          "host",
    rarity:        "iconic",
    accentColor:   "#FFD700",
    secondaryColor:"#FF6B35",
    emoji:         "🎙️",
    signatureMove: "Break-Spin",
    description:   "The voice of TMI. Julius is the platform MC — he hosts battles, announces champions, opens shows, and keeps the energy electric. Born entertainer.",
    xpTrack:       STANDARD_XP_TRACK,
    venuePriority: 1,
    bodyType:      "average",
    ageGroup:      "adult",
    homeVenue:     "battle-arena",
    isAvailable:   true,
  },
  {
    id:            "tiana-tg",
    displayName:   "Tiana TG",
    shortName:     "Tiana",
    role:          "performer",
    rarity:        "legendary",
    accentColor:   "#FF2DAA",
    secondaryColor:"#AA2DFF",
    emoji:         "🎤",
    signatureMove: "Crown-Dip",
    description:   "Multi-genre performer and fan favorite. Tiana TG bridges R&B, gospel, and hip-hop. Known for her effortless stage presence and iconic crown moment.",
    xpTrack:       { ...STANDARD_XP_TRACK, icon: 80_000 },
    venuePriority: 2,
    bodyType:      "slim",
    ageGroup:      "young_adult",
    homeVenue:     "cypher-theater",
    isAvailable:   true,
  },
  {
    id:            "record-ralph",
    displayName:   "Record Ralph",
    shortName:     "R. Ralph",
    role:          "performer",
    rarity:        "rare",
    accentColor:   "#AA2DFF",
    secondaryColor:"#00FFFF",
    emoji:         "💿",
    signatureMove: "Vinyl-Scratch-Wave",
    description:   "The beat architect. Record Ralph is a DJ-producer whose signature spinning record animation plays whenever a new track drops. Master of transitions.",
    xpTrack:       STANDARD_XP_TRACK,
    venuePriority: 3,
    bodyType:      "heavy",
    ageGroup:      "adult",
    homeVenue:     "monday-stage",
    isAvailable:   true,
  },
  {
    id:            "redbeard-and-specs",
    displayName:   "Redbeard & Specs",
    shortName:     "R&S",
    role:          "duo",
    rarity:        "rare",
    accentColor:   "#FF6B35",
    secondaryColor:"#FFD700",
    emoji:         "🧔🤓",
    signatureMove: "Duo-High-Five-Bounce",
    description:   "The comedy duo that keeps the Dirty Dozens arena alive. Redbeard brings the hype; Specs brings the bars. Together they run the game-show circuit.",
    xpTrack:       STANDARD_XP_TRACK,
    venuePriority: 2,
    bodyType:      "duo",
    ageGroup:      "adult",
    homeVenue:     "dirty-dozens",
    isAvailable:   true,
  },
  {
    id:            "luxe-trio",
    displayName:   "Luxe Trio",
    shortName:     "Luxe",
    role:          "group",
    rarity:        "legendary",
    accentColor:   "#FFD700",
    secondaryColor:"#FF2DAA",
    emoji:         "✨👑✨",
    signatureMove: "Trio-Formation-Glide",
    description:   "Three performers. One vision. The Luxe Trio is TMI's premium VIP presence — they appear in Diamond-tier rooms, headline the World Concert, and always arrive in formation.",
    xpTrack:       { ...STANDARD_XP_TRACK, icon: 150_000 },
    venuePriority: 1,
    bodyType:      "trio",
    ageGroup:      "young_adult",
    homeVenue:     "world-concert",
    isAvailable:   true,
  },
];

// ── Utility functions ─────────────────────────────────────────────────────────

export function getHeroById(id: string): HeroCharacter | undefined {
  return HERO_REGISTRY.find(h => h.id === id);
}

export function getHeroByVenue(venueSlug: string): HeroCharacter[] {
  return HERO_REGISTRY.filter(h => h.homeVenue === venueSlug && h.isAvailable);
}

export function getFrontRowHeroes(): HeroCharacter[] {
  return HERO_REGISTRY
    .filter(h => h.isAvailable && h.venuePriority <= 2)
    .sort((a, b) => a.venuePriority - b.venuePriority);
}

export function getIconicHeroes(): HeroCharacter[] {
  return HERO_REGISTRY.filter(h => h.rarity === "iconic" && h.isAvailable);
}

export function resolveEvolutionTier(xp: number): EvolutionTier {
  if (xp >= STANDARD_XP_TRACK.icon)        return "Icon";
  if (xp >= STANDARD_XP_TRACK.legend)      return "Legend";
  if (xp >= STANDARD_XP_TRACK.star)        return "Star";
  if (xp >= STANDARD_XP_TRACK.established) return "Established";
  if (xp >= STANDARD_XP_TRACK.rising)      return "Rising";
  return "Rookie";
}

export function getXpToNextTier(xp: number): { tier: EvolutionTier; needed: number; percent: number } {
  const thresholds: [number, EvolutionTier][] = [
    [STANDARD_XP_TRACK.rising,      "Rising"],
    [STANDARD_XP_TRACK.established, "Established"],
    [STANDARD_XP_TRACK.star,        "Star"],
    [STANDARD_XP_TRACK.legend,      "Legend"],
    [STANDARD_XP_TRACK.icon,        "Icon"],
  ];
  for (const [threshold, tier] of thresholds) {
    if (xp < threshold) {
      const prev = thresholds[thresholds.indexOf([threshold, tier]) - 1]?.[0] ?? 0;
      const range = threshold - prev;
      const progress = xp - prev;
      return { tier, needed: threshold - xp, percent: Math.min(100, Math.floor((progress / range) * 100)) };
    }
  }
  return { tier: "Icon", needed: 0, percent: 100 };
}
