// AvatarBodyTypeEngine — all body dimensions, age groups, skin tones, and proportions.
// This is the canonical data source for every character built on the platform.

// ─── Age Groups ────────────────────────────────────────────────────────────────

export type AgeGroup =
  | "toddler"      // 2–4
  | "child"        // 5–11
  | "preteen"      // 12–14
  | "teen"         // 15–17
  | "young-adult"  // 18–25
  | "adult"        // 26–35
  | "middle-age"   // 36–50
  | "mature"       // 51–64
  | "senior";      // 65+

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  toddler:      "Toddler (2–4)",
  child:        "Child (5–11)",
  preteen:      "Preteen (12–14)",
  teen:         "Teen (15–17)",
  "young-adult":"Young Adult (18–25)",
  adult:        "Adult (26–35)",
  "middle-age": "Middle Age (36–50)",
  mature:       "Mature (51–64)",
  senior:       "Senior (65+)",
};

// ─── Height Tiers ──────────────────────────────────────────────────────────────

export type HeightTier = "very-short" | "short" | "average" | "tall" | "very-tall";

export const HEIGHT_SCALE: Record<HeightTier, number> = {
  "very-short": 0.68,
  short:        0.84,
  average:      1.0,
  tall:         1.14,
  "very-tall":  1.28,
};

export const HEIGHT_LABELS: Record<HeightTier, string> = {
  "very-short": "Very Short",
  short:        "Short",
  average:      "Average",
  tall:         "Tall",
  "very-tall":  "Very Tall",
};

// ─── Body Build ────────────────────────────────────────────────────────────────

export type BodyBuild = "slim" | "lean" | "athletic" | "average" | "stocky" | "heavy" | "large";

export const BUILD_WIDTH_SCALE: Record<BodyBuild, number> = {
  slim:    0.72,
  lean:    0.85,
  athletic:0.96,
  average: 1.0,
  stocky:  1.12,
  heavy:   1.28,
  large:   1.45,
};

export const BUILD_LABELS: Record<BodyBuild, string> = {
  slim:     "Slim",
  lean:     "Lean",
  athletic: "Athletic",
  average:  "Average",
  stocky:   "Stocky",
  heavy:    "Heavy",
  large:    "Large",
};

// ─── Skin Tones ────────────────────────────────────────────────────────────────

export interface SkinTone {
  id: string;
  label: string;
  hex: string;
  shadowHex: string;
  highlightHex: string;
}

export const SKIN_TONES: SkinTone[] = [
  { id: "porcelain",   label: "Porcelain",   hex: "#FDDBB4", shadowHex: "#E8C09A", highlightHex: "#FFF0DD" },
  { id: "ivory",       label: "Ivory",       hex: "#F1C27D", shadowHex: "#D4A862", highlightHex: "#FFD89A" },
  { id: "sand",        label: "Sand",        hex: "#E0AC69", shadowHex: "#C49050", highlightHex: "#F0C080" },
  { id: "warm-olive",  label: "Warm Olive",  hex: "#D4A574", shadowHex: "#B8895A", highlightHex: "#E8B888" },
  { id: "caramel",     label: "Caramel",     hex: "#C68642", shadowHex: "#A8702E", highlightHex: "#D89858" },
  { id: "tawny",       label: "Tawny",       hex: "#AA6C39", shadowHex: "#8E5825", highlightHex: "#C0804E" },
  { id: "RUBY",      label: "RUBY",      hex: "#8D5524", shadowHex: "#724010", highlightHex: "#A06A38" },
  { id: "sienna",      label: "Sienna",      hex: "#6B3A1F", shadowHex: "#50280C", highlightHex: "#804E32" },
  { id: "espresso",    label: "Espresso",    hex: "#5C3317", shadowHex: "#401F04", highlightHex: "#70472A" },
  { id: "ebony",       label: "Ebony",       hex: "#3B1F0A", shadowHex: "#200D00", highlightHex: "#4E3018" },
  { id: "cool-fair",   label: "Cool Fair",   hex: "#F8D5C0", shadowHex: "#E0B8A0", highlightHex: "#FFF0E8" },
  { id: "rosy",        label: "Rosy",        hex: "#EEC4A8", shadowHex: "#D4A880", highlightHex: "#FDD8C0" },
];

// ─── Face Shapes ───────────────────────────────────────────────────────────────

export type FaceShape = "oval" | "round" | "square" | "heart" | "diamond" | "oblong";

export const FACE_SHAPE_LABELS: Record<FaceShape, string> = {
  oval:    "Oval",
  round:   "Round",
  square:  "Square",
  heart:   "Heart",
  diamond: "Diamond",
  oblong:  "Oblong",
};

// ─── Body Proportions by Age ───────────────────────────────────────────────────

export interface BodyProportions {
  headRatio: number;      // head size relative to body (toddlers have bigger heads)
  legLengthRatio: number; // legs vs torso
  shoulderWidth: number;  // shoulder width multiplier
  hipWidth: number;       // hip width multiplier
  neckLength: number;     // neck length
  limbThickness: number;  // arm/leg thickness
}

export const AGE_PROPORTIONS: Record<AgeGroup, BodyProportions> = {
  toddler:      { headRatio: 0.28, legLengthRatio: 0.72, shoulderWidth: 0.70, hipWidth: 0.68, neckLength: 0.40, limbThickness: 1.20 },
  child:        { headRatio: 0.24, legLengthRatio: 0.82, shoulderWidth: 0.78, hipWidth: 0.76, neckLength: 0.55, limbThickness: 1.10 },
  preteen:      { headRatio: 0.21, legLengthRatio: 0.90, shoulderWidth: 0.86, hipWidth: 0.84, neckLength: 0.68, limbThickness: 1.02 },
  teen:         { headRatio: 0.19, legLengthRatio: 0.96, shoulderWidth: 0.92, hipWidth: 0.90, neckLength: 0.80, limbThickness: 0.96 },
  "young-adult":{ headRatio: 0.17, legLengthRatio: 1.00, shoulderWidth: 1.00, hipWidth: 0.96, neckLength: 1.00, limbThickness: 1.00 },
  adult:        { headRatio: 0.17, legLengthRatio: 1.00, shoulderWidth: 1.04, hipWidth: 1.00, neckLength: 1.00, limbThickness: 1.02 },
  "middle-age": { headRatio: 0.17, legLengthRatio: 0.98, shoulderWidth: 1.06, hipWidth: 1.08, neckLength: 0.97, limbThickness: 1.06 },
  mature:       { headRatio: 0.17, legLengthRatio: 0.95, shoulderWidth: 1.02, hipWidth: 1.06, neckLength: 0.92, limbThickness: 1.04 },
  senior:       { headRatio: 0.18, legLengthRatio: 0.90, shoulderWidth: 0.96, hipWidth: 1.04, neckLength: 0.86, limbThickness: 0.98 },
};

// ─── Outfit System ─────────────────────────────────────────────────────────────

export type OutfitCategory = "street" | "stage" | "formal" | "athletic" | "casual" | "fantasy" | "vintage";

export interface OutfitPreset {
  id: string;
  label: string;
  category: OutfitCategory;
  primaryColor: string;
  accentColor: string;
  icon: string;
  unlockedAtTier?: number; // 0 = free, 1-6 = requires evolution tier
}

export const OUTFIT_PRESETS: OutfitPreset[] = [
  // Street
  { id: "tmi-hoodie",      label: "TMI Studio Hoodie",    category: "street",   primaryColor: "#1a1a2e", accentColor: "#00FFFF", icon: "🧥", unlockedAtTier: 0 },
  { id: "cypher-jacket",   label: "Cypher Glow Jacket",   category: "street",   primaryColor: "#0d0d1a", accentColor: "#FF2DAA", icon: "🧥", unlockedAtTier: 0 },
  { id: "streetwear",      label: "Street Drip",          category: "street",   primaryColor: "#1c1c28", accentColor: "#AA2DFF", icon: "👕", unlockedAtTier: 0 },
  { id: "tmi-track",       label: "TMI Track Suit",       category: "athletic", primaryColor: "#050510", accentColor: "#FFD700", icon: "🏃", unlockedAtTier: 1 },
  // Stage
  { id: "stage-vest",      label: "Stage Vest Dock",      category: "stage",   primaryColor: "#1a0a30", accentColor: "#FFD700", icon: "🎭", unlockedAtTier: 0 },
  { id: "arena-jersey",    label: "Arena Jersey",         category: "stage",   primaryColor: "#0a1a30", accentColor: "#FF4444", icon: "🏆", unlockedAtTier: 0 },
  { id: "performer-fit",   label: "Performer Fit",        category: "stage",   primaryColor: "#1a0820", accentColor: "#FF2DAA", icon: "🎤", unlockedAtTier: 2 },
  { id: "crown-drip",      label: "Crown Drip",           category: "stage",   primaryColor: "#1a1200", accentColor: "#FFD700", icon: "👑", unlockedAtTier: 4 },
  // Formal
  { id: "executive",       label: "Executive Suit",       category: "formal",  primaryColor: "#0a0a14", accentColor: "#00FFFF", icon: "👔", unlockedAtTier: 1 },
  { id: "gala-look",       label: "Gala Look",            category: "formal",  primaryColor: "#0d0015", accentColor: "#AA2DFF", icon: "🎩", unlockedAtTier: 3 },
  // Producer/casual
  { id: "producer-puffer", label: "Producer Puffer",      category: "casual",  primaryColor: "#0a200a", accentColor: "#00FF88", icon: "🎵", unlockedAtTier: 0 },
  { id: "chill-fit",       label: "Chill Fit",            category: "casual",  primaryColor: "#141428", accentColor: "#94a3b8", icon: "😎", unlockedAtTier: 0 },
  // Fantasy / Legend tier
  { id: "hologram-suit",   label: "Hologram Suit",        category: "fantasy", primaryColor: "rgba(0,255,255,0.1)", accentColor: "#00FFFF", icon: "✨", unlockedAtTier: 5 },
  { id: "icon-armor",      label: "Icon Armor",           category: "fantasy", primaryColor: "#1a0a00", accentColor: "#FFD700", icon: "⚡", unlockedAtTier: 6 },
  // Vintage
  { id: "retro-bomber",    label: "Retro Bomber",         category: "vintage", primaryColor: "#1a1000", accentColor: "#FF8C00", icon: "🕶️", unlockedAtTier: 2 },
];

// ─── Accessory System ──────────────────────────────────────────────────────────

export interface Accessory {
  id: string;
  label: string;
  slot: "head" | "neck" | "ears" | "wrists" | "hands" | "feet" | "back";
  icon: string;
  unlockedAtTier: number;
}

export const ACCESSORIES: Accessory[] = [
  { id: "snapback",     label: "TMI Snapback",     slot: "head",   icon: "🧢", unlockedAtTier: 0 },
  { id: "fitted-cap",   label: "Fitted Cap",       slot: "head",   icon: "🧢", unlockedAtTier: 0 },
  { id: "beanie",       label: "Beanie",           slot: "head",   icon: "🎿", unlockedAtTier: 0 },
  { id: "crown",        label: "Crown",            slot: "head",   icon: "👑", unlockedAtTier: 5 },
  { id: "headphones",   label: "Studio Headphones",slot: "head",   icon: "🎧", unlockedAtTier: 1 },
  { id: "gold-chain",   label: "Gold Chain",       slot: "neck",   icon: "⛓️", unlockedAtTier: 0 },
  { id: "diamond-chain",label: "Diamond Chain",    slot: "neck",   icon: "💎", unlockedAtTier: 3 },
  { id: "earrings",     label: "Earrings",         slot: "ears",   icon: "💍", unlockedAtTier: 0 },
  { id: "ear-cuffs",    label: "Ear Cuffs",        slot: "ears",   icon: "🔮", unlockedAtTier: 2 },
  { id: "watch",        label: "TMI Watch",        slot: "wrists", icon: "⌚", unlockedAtTier: 1 },
  { id: "bracelet",     label: "Bracelet Stack",   slot: "wrists", icon: "📿", unlockedAtTier: 0 },
  { id: "rings",        label: "Rings",            slot: "hands",  icon: "💍", unlockedAtTier: 0 },
  { id: "mic-glove",    label: "Mic Glove",        slot: "hands",  icon: "🎤", unlockedAtTier: 2 },
  { id: "jordans",      label: "Jordans",          slot: "feet",   icon: "👟", unlockedAtTier: 0 },
  { id: "led-kicks",    label: "LED Kicks",        slot: "feet",   icon: "✨", unlockedAtTier: 3 },
  { id: "boots",        label: "Stage Boots",      slot: "feet",   icon: "👢", unlockedAtTier: 1 },
  { id: "wings",        label: "Icon Wings",       slot: "back",   icon: "🪽",  unlockedAtTier: 6 },
  { id: "backpack",     label: "Producer Pack",    slot: "back",   icon: "🎒", unlockedAtTier: 0 },
];

// ─── Full Avatar Spec ──────────────────────────────────────────────────────────

export interface AvatarSpec {
  id: string;
  userId?: string;
  displayName: string;
  ageGroup: AgeGroup;
  heightTier: HeightTier;
  bodyBuild: BodyBuild;
  faceShape: FaceShape;
  skinToneId: string;
  outfitId: string;
  accessories: string[]; // accessory ids
  faceScanLinked: boolean;
  evolutionTier: number; // 0-6
  createdAt: string;
}

export function buildDefaultSpec(overrides: Partial<AvatarSpec> = {}): AvatarSpec {
  return {
    id: `avatar-${Date.now()}`,
    displayName: "New Avatar",
    ageGroup: "young-adult",
    heightTier: "average",
    bodyBuild: "average",
    faceShape: "oval",
    skinToneId: "caramel",
    outfitId: "tmi-hoodie",
    accessories: [],
    faceScanLinked: false,
    evolutionTier: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function getProportions(spec: AvatarSpec): BodyProportions {
  const base = AGE_PROPORTIONS[spec.ageGroup];
  const buildMod = BUILD_WIDTH_SCALE[spec.bodyBuild];
  return {
    ...base,
    shoulderWidth: base.shoulderWidth * buildMod,
    hipWidth: base.hipWidth * buildMod,
    limbThickness: base.limbThickness * buildMod,
  };
}

export function getSkinTone(id: string): SkinTone {
  return SKIN_TONES.find((s) => s.id === id) ?? SKIN_TONES[4];
}

export function getHeightMultiplier(spec: AvatarSpec): number {
  return HEIGHT_SCALE[spec.heightTier];
}

/** All valid combinations — total unique avatar builds possible */
export function countCombinations(): number {
  return (
    Object.keys(AGE_GROUP_LABELS).length *
    Object.keys(HEIGHT_SCALE).length *
    Object.keys(BUILD_WIDTH_SCALE).length *
    SKIN_TONES.length *
    Object.keys(FACE_SHAPE_LABELS).length *
    OUTFIT_PRESETS.length
  );
}
