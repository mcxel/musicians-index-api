// CharacterEvolutionEngine — XP progression, tier unlocks, dance learning, cross-character growth.
// Characters start as Rookie and can ascend to Icon through platform activity.

export type EvolutionTier =
  | 0 // Rookie
  | 1 // Rising
  | 2 // Featured
  | 3 // Pro
  | 4 // Elite
  | 5 // Legend
  | 6; // Icon

export const TIER_NAMES: Record<EvolutionTier, string> = {
  0: "Rookie",
  1: "Rising",
  2: "Featured",
  3: "Pro",
  4: "Elite",
  5: "Legend",
  6: "Icon",
};

export const TIER_COLORS: Record<EvolutionTier, string> = {
  0: "#94a3b8",
  1: "#00FF88",
  2: "#00FFFF",
  3: "#AA2DFF",
  4: "#FFD700",
  5: "#FF2DAA",
  6: "#FFFFFF",
};

export const TIER_XP_THRESHOLDS: Record<EvolutionTier, number> = {
  0: 0,
  1: 500,
  2: 1500,
  3: 3500,
  4: 7000,
  5: 12000,
  6: 20000,
};

// ─── Dance Moves ───────────────────────────────────────────────────────────────

export type DanceMoveCategory =
  | "signature"    // character-specific
  | "groove"       // general floor moves
  | "battle"       // 1v1 battle choreography
  | "crowd"        // crowd interaction
  | "world-party"  // World Dance Party sync moves
  | "evolution"    // unlocked via tier progression
  | "ai-learned";  // AI-generated / cross-character learned

export interface DanceMove {
  id: string;
  name: string;
  category: DanceMoveCategory;
  description: string;
  cssAnimation: string;    // keyframe name for CSS animation
  durationMs: number;
  loopable: boolean;
  unlockedAtTier: EvolutionTier;
  energyCost: number;      // 1-10 scale for stamina simulation
  icon: string;
}

export const DANCE_MOVES: DanceMove[] = [
  // Groove — free, all tiers
  { id: "two-step",        name: "Two Step",         category: "groove",       description: "Classic side-to-side bounce",            cssAnimation: "dmTwoStep",       durationMs: 800,  loopable: true,  unlockedAtTier: 0, energyCost: 2,  icon: "🦶" },
  { id: "head-bob",        name: "Head Bob",         category: "groove",       description: "Rhythmic head nodding",                  cssAnimation: "dmHeadBob",       durationMs: 600,  loopable: true,  unlockedAtTier: 0, energyCost: 1,  icon: "🎵" },
  { id: "shoulder-roll",   name: "Shoulder Roll",    category: "groove",       description: "Rolling shoulders to the beat",          cssAnimation: "dmShoulderRoll",  durationMs: 1000, loopable: true,  unlockedAtTier: 0, energyCost: 2,  icon: "🌀" },
  { id: "bounce",          name: "Bounce",           category: "groove",       description: "Full body vertical bounce",              cssAnimation: "dmBounce",        durationMs: 500,  loopable: true,  unlockedAtTier: 0, energyCost: 3,  icon: "⬆️" },
  { id: "wave",            name: "Wave",             category: "groove",       description: "Body wave from head to toe",             cssAnimation: "dmBodyWave",      durationMs: 1200, loopable: true,  unlockedAtTier: 1, energyCost: 4,  icon: "🌊" },
  { id: "dab",             name: "Dab",              category: "groove",       description: "Clean dab hit",                          cssAnimation: "dmDab",           durationMs: 700,  loopable: false, unlockedAtTier: 0, energyCost: 2,  icon: "💨" },
  { id: "running-man",     name: "Running Man",      category: "groove",       description: "Retro running man",                      cssAnimation: "dmRunningMan",    durationMs: 900,  loopable: true,  unlockedAtTier: 1, energyCost: 5,  icon: "🏃" },
  { id: "cabbage-patch",   name: "Cabbage Patch",    category: "groove",       description: "Circular arm rotation groove",           cssAnimation: "dmCabbagePatch",  durationMs: 1100, loopable: true,  unlockedAtTier: 1, energyCost: 4,  icon: "🥬" },
  // Battle moves — competitive
  { id: "freeze",          name: "Freeze",           category: "battle",       description: "Hard stop mid-move hold",                cssAnimation: "dmFreeze",        durationMs: 1500, loopable: false, unlockedAtTier: 2, energyCost: 7,  icon: "🧊" },
  { id: "toprock",         name: "Top Rock",         category: "battle",       description: "Breakdance top-rock entry",              cssAnimation: "dmToprock",       durationMs: 1400, loopable: true,  unlockedAtTier: 2, energyCost: 6,  icon: "🔥" },
  { id: "windmill",        name: "Windmill",         category: "battle",       description: "Spinning floor windmill",                cssAnimation: "dmWindmill",      durationMs: 2000, loopable: true,  unlockedAtTier: 3, energyCost: 9,  icon: "🌀" },
  { id: "power-move",      name: "Power Move",       category: "battle",       description: "Full momentum power rotation",           cssAnimation: "dmPowerMove",     durationMs: 2500, loopable: false, unlockedAtTier: 4, energyCost: 10, icon: "⚡" },
  // Crowd interaction
  { id: "point-to-crowd",  name: "Point to Crowd",   category: "crowd",        description: "Point finger at audience",               cssAnimation: "dmPointCrowd",    durationMs: 600,  loopable: false, unlockedAtTier: 0, energyCost: 1,  icon: "👉" },
  { id: "hype-up",         name: "Hype Up",          category: "crowd",        description: "Arms raising crowd energy",              cssAnimation: "dmHypeUp",        durationMs: 1000, loopable: true,  unlockedAtTier: 1, energyCost: 3,  icon: "🙌" },
  { id: "mic-drop",        name: "Mic Drop",         category: "crowd",        description: "Iconic mic drop",                        cssAnimation: "dmMicDrop",       durationMs: 1200, loopable: false, unlockedAtTier: 2, energyCost: 2,  icon: "🎤" },
  // World Dance Party
  { id: "sync-pulse",      name: "Sync Pulse",       category: "world-party",  description: "Platform-wide synchronized pulse",       cssAnimation: "dmSyncPulse",     durationMs: 800,  loopable: true,  unlockedAtTier: 1, energyCost: 2,  icon: "💫" },
  { id: "chain-groove",    name: "Chain Groove",     category: "world-party",  description: "Pass-the-groove chain to next avatar",   cssAnimation: "dmChainGroove",   durationMs: 1600, loopable: false, unlockedAtTier: 2, energyCost: 4,  icon: "🔗" },
  { id: "global-sync",     name: "Global Sync",      category: "world-party",  description: "Full platform synchronized dance drop",  cssAnimation: "dmGlobalSync",    durationMs: 3000, loopable: false, unlockedAtTier: 4, energyCost: 8,  icon: "🌍" },
  // Evolution unlocks
  { id: "clone-split",     name: "Clone Split",      category: "evolution",    description: "Character splits into 3 copies",         cssAnimation: "dmCloneSplit",    durationMs: 2000, loopable: false, unlockedAtTier: 5, energyCost: 8,  icon: "✨" },
  { id: "ascension",       name: "Icon Ascension",   category: "evolution",    description: "Full Icon tier reveal transform",        cssAnimation: "dmAscension",     durationMs: 4000, loopable: false, unlockedAtTier: 6, energyCost: 10, icon: "🌟" },
  // AI-learned (generated over time)
  { id: "ai-remix-1",      name: "AI Remix Vol.1",   category: "ai-learned",   description: "AI-choreographed hybrid groove",         cssAnimation: "dmAiRemix1",      durationMs: 2200, loopable: true,  unlockedAtTier: 3, energyCost: 5,  icon: "🤖" },
  { id: "cross-char-steal",name: "Cross-Learn",      category: "ai-learned",   description: "Move borrowed from another character",   cssAnimation: "dmCrossLearn",    durationMs: 1800, loopable: true,  unlockedAtTier: 4, energyCost: 6,  icon: "🎓" },
];

// ─── Tier Unlocks ──────────────────────────────────────────────────────────────

export interface TierUnlock {
  tier: EvolutionTier;
  label: string;
  unlocks: string[];
  danceMoveIds: string[];
  outfitIds: string[];
  accessoryIds: string[];
  specialAbility?: string;
}

export const TIER_UNLOCKS: TierUnlock[] = [
  {
    tier: 0,
    label: "Rookie — You're on the stage",
    unlocks: ["Basic outfit customization", "Head bob & two-step", "Point to crowd"],
    danceMoveIds: ["two-step", "head-bob", "shoulder-roll", "bounce", "dab", "point-to-crowd"],
    outfitIds: ["tmi-hoodie", "cypher-jacket", "streetwear", "stage-vest", "arena-jersey", "producer-puffer", "chill-fit"],
    accessoryIds: ["snapback", "fitted-cap", "beanie", "gold-chain", "earrings", "bracelet", "rings", "jordans", "backpack"],
  },
  {
    tier: 1,
    label: "Rising — They're starting to notice",
    unlocks: ["Body wave unlock", "Hype Up crowd move", "Studio Headphones", "TMI Watch", "Stage Boots"],
    danceMoveIds: ["wave", "running-man", "cabbage-patch", "hype-up", "sync-pulse"],
    outfitIds: ["tmi-track", "executive"],
    accessoryIds: ["headphones", "watch", "boots"],
  },
  {
    tier: 2,
    label: "Featured — Front page material",
    unlocks: ["Battle moves activate", "Mic Drop", "Chain Groove", "Mic Glove", "Performer Fit", "Retro Bomber"],
    danceMoveIds: ["freeze", "toprock", "mic-drop", "chain-groove"],
    outfitIds: ["performer-fit", "retro-bomber"],
    accessoryIds: ["ear-cuffs", "mic-glove"],
    specialAbility: "Battle mode — enter 1v1 dance battles in arenas",
  },
  {
    tier: 3,
    label: "Pro — You ARE the culture",
    unlocks: ["Windmill breakdance", "AI Remix Vol.1", "Diamond Chain", "LED Kicks", "Gala Look"],
    danceMoveIds: ["windmill", "ai-remix-1"],
    outfitIds: ["gala-look"],
    accessoryIds: ["diamond-chain", "led-kicks"],
    specialAbility: "AI choreography — generate custom moves based on beat analysis",
  },
  {
    tier: 4,
    label: "Elite — The platform bends around you",
    unlocks: ["Power Move", "Cross-Learn", "Global Sync", "Crown Drip", "Icon Wings preview"],
    danceMoveIds: ["power-move", "cross-char-steal", "global-sync"],
    outfitIds: ["crown-drip"],
    accessoryIds: [],
    specialAbility: "World Dance Party host — trigger global sync events from your room",
  },
  {
    tier: 5,
    label: "Legend — They play your music after you leave",
    unlocks: ["Clone Split move", "Hologram Suit", "Crown accessory"],
    danceMoveIds: ["clone-split"],
    outfitIds: ["hologram-suit"],
    accessoryIds: ["crown"],
    specialAbility: "Clone Split — project 3 simultaneous avatar copies in arena",
  },
  {
    tier: 6,
    label: "Icon — You are the standard",
    unlocks: ["Icon Ascension", "Icon Armor", "Icon Wings", "Permanent homepage feature"],
    danceMoveIds: ["ascension"],
    outfitIds: ["icon-armor"],
    accessoryIds: ["wings"],
    specialAbility: "Icon Ascension — full platform reveal animation, permanent front page slot",
  },
];

// ─── XP Events ─────────────────────────────────────────────────────────────────

export type XPEventType =
  | "article-published"
  | "battle-win"
  | "battle-participated"
  | "tip-received"
  | "fan-vote-earned"
  | "assignment-completed"
  | "live-session"
  | "world-dance-party"
  | "badge-earned"
  | "streak-7day"
  | "streak-30day"
  | "face-scan-linked"
  | "outfit-purchased"
  | "crowd-hype-triggered";

export const XP_VALUES: Record<XPEventType, number> = {
  "article-published":     150,
  "battle-win":            300,
  "battle-participated":   80,
  "tip-received":          5,
  "fan-vote-earned":       2,
  "assignment-completed":  250,
  "live-session":          50,
  "world-dance-party":     120,
  "badge-earned":          100,
  "streak-7day":           200,
  "streak-30day":          750,
  "face-scan-linked":      500,
  "outfit-purchased":      25,
  "crowd-hype-triggered":  40,
};

// ─── Character Evolution Store ──────────────────────────────────────────────────

export interface CharacterEvolutionState {
  characterId: string;
  xp: number;
  tier: EvolutionTier;
  unlockedMoveIds: string[];
  learnedFromCharacters: string[];
  activityLog: { event: XPEventType; xpEarned: number; ts: string }[];
  lastEvolutionAt?: string;
}

const evolutionStore = new Map<string, CharacterEvolutionState>();

export function getOrCreateEvolution(characterId: string): CharacterEvolutionState {
  if (!evolutionStore.has(characterId)) {
    const initial: CharacterEvolutionState = {
      characterId,
      xp: 0,
      tier: 0,
      unlockedMoveIds: TIER_UNLOCKS[0].danceMoveIds,
      learnedFromCharacters: [],
      activityLog: [],
    };
    evolutionStore.set(characterId, initial);
  }
  return evolutionStore.get(characterId)!;
}

export function awardXP(characterId: string, event: XPEventType): CharacterEvolutionState {
  const state = getOrCreateEvolution(characterId);
  const earned = XP_VALUES[event];
  const newXP = state.xp + earned;

  // Recalculate tier
  let tier: EvolutionTier = 0;
  for (let t = 6; t >= 0; t--) {
    if (newXP >= TIER_THRESHOLDS[t as EvolutionTier]) {
      tier = t as EvolutionTier;
      break;
    }
  }

  // Accumulate unlocked moves across all tiers up to current
  const unlockedMoveIds = TIER_UNLOCKS
    .filter((u) => u.tier <= tier)
    .flatMap((u) => u.danceMoveIds);

  const wasEvolved = tier > state.tier;
  const updated: CharacterEvolutionState = {
    ...state,
    xp: newXP,
    tier,
    unlockedMoveIds: [...new Set(unlockedMoveIds)],
    activityLog: [
      ...state.activityLog,
      { event, xpEarned: earned, ts: new Date().toISOString() },
    ],
    lastEvolutionAt: wasEvolved ? new Date().toISOString() : state.lastEvolutionAt,
  };
  evolutionStore.set(characterId, updated);
  return updated;
}

/** Cross-character learning — a character can absorb a move from another */
export function crossLearnMove(
  studentId: string,
  teacherId: string,
  moveId: string,
): boolean {
  const student = getOrCreateEvolution(studentId);
  const teacher = getOrCreateEvolution(teacherId);
  if (!teacher.unlockedMoveIds.includes(moveId)) return false;
  if (student.unlockedMoveIds.includes(moveId)) return false;
  const updated: CharacterEvolutionState = {
    ...student,
    unlockedMoveIds: [...student.unlockedMoveIds, moveId],
    learnedFromCharacters: [...new Set([...student.learnedFromCharacters, teacherId])],
  };
  evolutionStore.set(studentId, updated);
  return true;
}

export function getUnlockedMoves(characterId: string): DanceMove[] {
  const state = getOrCreateEvolution(characterId);
  return DANCE_MOVES.filter((m) => state.unlockedMoveIds.includes(m.id));
}

export function getTierProgress(characterId: string): {
  tier: EvolutionTier;
  tierName: string;
  tierColor: string;
  xp: number;
  xpToNext: number | null;
  pct: number;
} {
  const state = getOrCreateEvolution(characterId);
  const tier = state.tier;
  const nextTierXP = tier < 6 ? TIER_THRESHOLDS[(tier + 1) as EvolutionTier] : null;
  const currentTierXP = TIER_THRESHOLDS[tier];
  const xpInTier = state.xp - currentTierXP;
  const tierRange = nextTierXP ? nextTierXP - currentTierXP : 1;
  const pct = nextTierXP ? Math.min(100, Math.round((xpInTier / tierRange) * 100)) : 100;
  return {
    tier,
    tierName: TIER_NAMES[tier],
    tierColor: TIER_COLORS[tier],
    xp: state.xp,
    xpToNext: nextTierXP ? nextTierXP - state.xp : null,
    pct,
  };
}

// alias used internally
const TIER_THRESHOLDS = TIER_XP_THRESHOLDS;
