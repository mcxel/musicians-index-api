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

// ─── TMI Global Avatar Identity + Body Diversity Law (Section 7–10) ───────────

/**
 * Continuous Body Diversity Parameters — single canonical 26-bone skeleton.
 *
 * Archetypes remain useful technically as deformation anchors, but users are
 * never constrained to 4-5 crude archetypes. Combinations support:
 * short/tall, slim/heavier/large, athletic/muscular, narrow/broad, large/small belly.
 */
export interface BodyDiversityParameters {
  /** Height multiplier: 0.68 (very short) to 1.32 (very tall). Default 1.0 */
  heightScale: number;
  /** Frame width: narrow (-1.0) to broad (+1.0). Default 0.0 */
  frameWidth: number;
  /** Shoulder breadth: narrow (-1.0) to broad (+1.0). Default 0.0 */
  shoulderWidth: number;
  /** Muscle definition / volume: lean (-1.0) to very muscular (+1.0). Default 0.0 */
  muscleMass: number;
  /** Overall body mass / fullness: very slim (-1.0) to very large (+1.0). Default 0.0 */
  bodyMass: number;
  /** Belly prominence / fullness: flat/tucked (-1.0) to large prominent belly (+1.0). Default 0.0 */
  bellyFullness: number;
  /** Chest / torso depth and fullness: slender (-1.0) to barrel/deep (+1.0). Default 0.0 */
  chestFullness: number;
  /** Waist proportion: tapered/narrow (-1.0) to thick/wide (+1.0). Default 0.0 */
  waistWidth: number;
  /** Hip proportion: narrow (-1.0) to wide/full (+1.0). Default 0.0 */
  hipWidth: number;
  /** Arm thickness / proportion: slender (-1.0) to heavy/muscular (+1.0). Default 0.0 */
  armThickness: number;
  /** Leg thickness / proportion: slender (-1.0) to heavy/sturdy (+1.0). Default 0.0 */
  legThickness: number;
  /** Leg-to-torso relationship: shorter legs/longer torso (-1.0) to longer legs/shorter torso (+1.0). Default 0.0 */
  legToTorsoRatio: number;
  /** Neck proportions: slender/long (-1.0) to thick/stout (+1.0). Default 0.0 */
  neckProportions: number;
}

export const DEFAULT_BODY_DIVERSITY_PARAMETERS: BodyDiversityParameters = {
  heightScale: 1.0,
  frameWidth: 0.0,
  shoulderWidth: 0.0,
  muscleMass: 0.0,
  bodyMass: 0.0,
  bellyFullness: 0.0,
  chestFullness: 0.0,
  waistWidth: 0.0,
  hipWidth: 0.0,
  armThickness: 0.0,
  legThickness: 0.0,
  legToTorsoRatio: 0.0,
  neckProportions: 0.0,
};

export const BODY_DIVERSITY_SAFE_BOUNDS: Record<keyof BodyDiversityParameters, [number, number]> = {
  heightScale: [0.65, 1.35],
  frameWidth: [-0.85, 0.95],
  shoulderWidth: [-0.85, 0.95],
  muscleMass: [-0.80, 0.95],
  bodyMass: [-0.85, 1.00],
  bellyFullness: [-0.80, 1.00],
  chestFullness: [-0.80, 0.95],
  waistWidth: [-0.85, 0.95],
  hipWidth: [-0.85, 0.95],
  armThickness: [-0.80, 0.95],
  legThickness: [-0.80, 0.95],
  legToTorsoRatio: [-0.60, 0.60],
  neckProportions: [-0.70, 0.85],
};

export function clampBodyDiversityParameters(
  raw: Partial<BodyDiversityParameters>,
): BodyDiversityParameters {
  const result: any = {};
  for (const key of Object.keys(BODY_DIVERSITY_SAFE_BOUNDS) as Array<keyof BodyDiversityParameters>) {
    const [min, max] = BODY_DIVERSITY_SAFE_BOUNDS[key];
    const val = raw[key] ?? DEFAULT_BODY_DIVERSITY_PARAMETERS[key];
    result[key] = Math.max(min, Math.min(max, val));
  }
  return result as BodyDiversityParameters;
}

export interface BodyDiversityPreset {
  id: string;
  label: string;
  gender: "female" | "male" | "unisex";
  ageGroup: AgeGroup;
  description: string;
  anchorBuild: BodyBuild;
  anchorHeight: HeightTier;
  parameters: BodyDiversityParameters;
  tags: string[];
}

export const GLOBAL_BODY_DIVERSITY_PRESETS: BodyDiversityPreset[] = [
  // ─── 8 BOYS / MALE BODY PRESETS (Canonical 50/50 Representation) ──────────────
  {
    id: "body-boy-short-heavy-belly",
    label: "Short & Heavy (Prominent Belly)",
    gender: "male",
    ageGroup: "middle-age",
    description: "Compact stature, substantial abdominal fullness, thick waist, sturdy chest and neck.",
    anchorBuild: "heavy",
    anchorHeight: "short",
    parameters: clampBodyDiversityParameters({
      heightScale: 0.84,
      frameWidth: 0.3,
      shoulderWidth: 0.2,
      muscleMass: 0.05,
      bodyMass: 0.6,
      bellyFullness: 0.75,
      chestFullness: 0.4,
      waistWidth: 0.55,
      hipWidth: 0.4,
      armThickness: 0.35,
      legThickness: 0.3,
      legToTorsoRatio: -0.15,
      neckProportions: 0.4,
    }),
    tags: ["boy", "male", "short", "heavy", "large-belly", "sturdy"],
  },
  {
    id: "body-boy-tall-slim-lean",
    label: "Tall & Slim (Lean Linear)",
    gender: "male",
    ageGroup: "teen",
    description: "Elongated vertical frame, slender limb proportions, narrow waist and shoulders.",
    anchorBuild: "slim",
    anchorHeight: "tall",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.18,
      frameWidth: -0.3,
      shoulderWidth: -0.2,
      muscleMass: -0.1,
      bodyMass: -0.4,
      bellyFullness: -0.4,
      chestFullness: -0.25,
      waistWidth: -0.35,
      hipWidth: -0.3,
      armThickness: -0.3,
      legThickness: -0.3,
      legToTorsoRatio: 0.25,
      neckProportions: -0.2,
    }),
    tags: ["boy", "male", "tall", "slim", "lean", "linear"],
  },
  {
    id: "body-boy-short-muscular",
    label: "Short & Muscular (Power Build)",
    gender: "male",
    ageGroup: "adult",
    description: "Compact vertical silhouette, broad dense shoulders, muscular chest and heavy arms.",
    anchorBuild: "athletic",
    anchorHeight: "short",
    parameters: clampBodyDiversityParameters({
      heightScale: 0.86,
      frameWidth: 0.4,
      shoulderWidth: 0.5,
      muscleMass: 0.75,
      bodyMass: 0.25,
      bellyFullness: -0.1,
      chestFullness: 0.6,
      waistWidth: 0.1,
      hipWidth: 0.15,
      armThickness: 0.65,
      legThickness: 0.55,
      legToTorsoRatio: -0.05,
      neckProportions: 0.5,
    }),
    tags: ["boy", "male", "short", "muscular", "buff", "power"],
  },
  {
    id: "body-boy-tall-broad-heavy",
    label: "Tall & Broad (Heavyweight Frame)",
    gender: "male",
    ageGroup: "adult",
    description: "Towering stature, broad chest and shoulder frame, solid abdominal fullness.",
    anchorBuild: "heavy",
    anchorHeight: "tall",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.22,
      frameWidth: 0.5,
      shoulderWidth: 0.55,
      muscleMass: 0.4,
      bodyMass: 0.65,
      bellyFullness: 0.5,
      chestFullness: 0.6,
      waistWidth: 0.45,
      hipWidth: 0.4,
      armThickness: 0.5,
      legThickness: 0.45,
      legToTorsoRatio: 0.1,
      neckProportions: 0.45,
    }),
    tags: ["boy", "male", "tall", "broad", "heavy", "commanding"],
  },
  {
    id: "body-boy-broad-bigbelly",
    label: "Broad Frame, Big Belly & Lean Limbs",
    gender: "male",
    ageGroup: "mature",
    description: "Wide chest and prominent lower belly paired with lighter agile leg structure.",
    anchorBuild: "stocky",
    anchorHeight: "average",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.0,
      frameWidth: 0.4,
      shoulderWidth: 0.35,
      muscleMass: 0.0,
      bodyMass: 0.45,
      bellyFullness: 0.8,
      chestFullness: 0.35,
      waistWidth: 0.6,
      hipWidth: 0.3,
      armThickness: -0.1,
      legThickness: -0.15,
      legToTorsoRatio: -0.1,
      neckProportions: 0.25,
    }),
    tags: ["boy", "male", "broad", "large-belly", "thinner-legs", "individual"],
  },
  {
    id: "body-boy-tall-athletic-buff",
    label: "Tall & Athletic (Championship V-Taper)",
    gender: "male",
    ageGroup: "young-adult",
    description: "High stature, wide V-taper shoulders, defined athletic chest and muscular limbs.",
    anchorBuild: "athletic",
    anchorHeight: "tall",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.16,
      frameWidth: 0.35,
      shoulderWidth: 0.45,
      muscleMass: 0.7,
      bodyMass: 0.2,
      bellyFullness: -0.25,
      chestFullness: 0.55,
      waistWidth: -0.1,
      hipWidth: 0.05,
      armThickness: 0.5,
      legThickness: 0.45,
      legToTorsoRatio: 0.2,
      neckProportions: 0.3,
    }),
    tags: ["boy", "male", "tall", "athletic", "muscular", "v-taper"],
  },
  {
    id: "body-boy-average-stocky",
    label: "Average & Stocky (Deep Torso)",
    gender: "male",
    ageGroup: "adult",
    description: "Balanced middle height, solid barrel chest, thick waist and grounded limb stance.",
    anchorBuild: "stocky",
    anchorHeight: "average",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.0,
      frameWidth: 0.3,
      shoulderWidth: 0.25,
      muscleMass: 0.25,
      bodyMass: 0.35,
      bellyFullness: 0.3,
      chestFullness: 0.5,
      waistWidth: 0.35,
      hipWidth: 0.25,
      armThickness: 0.3,
      legThickness: 0.35,
      legToTorsoRatio: -0.05,
      neckProportions: 0.3,
    }),
    tags: ["boy", "male", "average", "stocky", "deep-chest", "solid"],
  },
  {
    id: "body-boy-compact-strong",
    label: "Compact & Strong (Low Center of Gravity)",
    gender: "male",
    ageGroup: "young-adult",
    description: "Very low center of gravity, dense musculature, stout neck, reliable stance.",
    anchorBuild: "athletic",
    anchorHeight: "very-short",
    parameters: clampBodyDiversityParameters({
      heightScale: 0.76,
      frameWidth: 0.25,
      shoulderWidth: 0.3,
      muscleMass: 0.55,
      bodyMass: 0.2,
      bellyFullness: 0.1,
      chestFullness: 0.4,
      waistWidth: 0.2,
      hipWidth: 0.2,
      armThickness: 0.45,
      legThickness: 0.45,
      legToTorsoRatio: -0.1,
      neckProportions: 0.35,
    }),
    tags: ["boy", "male", "compact", "strong", "short", "dense"],
  },

  // ─── 8 GIRLS / FEMALE BODY PRESETS (Canonical 50/50 Representation) ───────────
  {
    id: "body-girl-curvy-full-frame",
    label: "Curvy Full Frame (Expressive Curves)",
    gender: "female",
    ageGroup: "young-adult",
    description: "Full hip proportions, soft tapered waist, balanced shoulder width, expressive curves.",
    anchorBuild: "large",
    anchorHeight: "average",
    parameters: clampBodyDiversityParameters({
      heightScale: 0.98,
      frameWidth: 0.2,
      shoulderWidth: 0.1,
      muscleMass: 0.0,
      bodyMass: 0.5,
      bellyFullness: 0.35,
      chestFullness: 0.45,
      waistWidth: 0.15,
      hipWidth: 0.65,
      armThickness: 0.25,
      legThickness: 0.4,
      legToTorsoRatio: 0.05,
      neckProportions: 0.1,
    }),
    tags: ["girl", "female", "curvy", "full-frame", "wide-hips", "balanced"],
  },
  {
    id: "body-girl-tall-slender-athletic",
    label: "Tall & Slender (Runway Athletic)",
    gender: "female",
    ageGroup: "young-adult",
    description: "Tall statuesque silhouette, long graceful limbs, defined tone, narrow tapered waist.",
    anchorBuild: "slim",
    anchorHeight: "tall",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.18,
      frameWidth: -0.15,
      shoulderWidth: 0.1,
      muscleMass: 0.2,
      bodyMass: -0.25,
      bellyFullness: -0.4,
      chestFullness: 0.1,
      waistWidth: -0.3,
      hipWidth: 0.2,
      armThickness: -0.2,
      legThickness: -0.15,
      legToTorsoRatio: 0.3,
      neckProportions: -0.25,
    }),
    tags: ["girl", "female", "tall", "slender", "statuesque", "toned"],
  },
  {
    id: "body-girl-short-petite-slim",
    label: "Petite & Slim (Delicate Proportions)",
    gender: "female",
    ageGroup: "teen",
    description: "Delicate compact frame, slender neck and wrists, light agile step.",
    anchorBuild: "slim",
    anchorHeight: "short",
    parameters: clampBodyDiversityParameters({
      heightScale: 0.82,
      frameWidth: -0.35,
      shoulderWidth: -0.3,
      muscleMass: -0.15,
      bodyMass: -0.35,
      bellyFullness: -0.3,
      chestFullness: -0.2,
      waistWidth: -0.35,
      hipWidth: -0.1,
      armThickness: -0.35,
      legThickness: -0.3,
      legToTorsoRatio: 0.05,
      neckProportions: -0.35,
    }),
    tags: ["girl", "female", "petite", "short", "slim", "delicate"],
  },
  {
    id: "body-girl-muscular-athletic",
    label: "Muscular & Athletic (Toned Powerhouse)",
    gender: "female",
    ageGroup: "adult",
    description: "Sculpted shoulders, powerful quads and calves, athletic torso, champion stamina.",
    anchorBuild: "athletic",
    anchorHeight: "average",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.02,
      frameWidth: 0.25,
      shoulderWidth: 0.35,
      muscleMass: 0.7,
      bodyMass: 0.2,
      bellyFullness: -0.3,
      chestFullness: 0.35,
      waistWidth: -0.05,
      hipWidth: 0.35,
      armThickness: 0.5,
      legThickness: 0.55,
      legToTorsoRatio: 0.15,
      neckProportions: 0.15,
    }),
    tags: ["girl", "female", "athletic", "muscular", "toned", "powerful"],
  },
  {
    id: "body-girl-tall-hourglass-curvy",
    label: "Tall Hourglass (Sculpted Curves)",
    gender: "female",
    ageGroup: "adult",
    description: "Tall commanding stature with pronounced hip width, defined waistline, and graceful posture.",
    anchorBuild: "average",
    anchorHeight: "tall",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.15,
      frameWidth: 0.15,
      shoulderWidth: 0.2,
      muscleMass: 0.15,
      bodyMass: 0.3,
      bellyFullness: 0.1,
      chestFullness: 0.45,
      waistWidth: -0.1,
      hipWidth: 0.65,
      armThickness: 0.15,
      legThickness: 0.35,
      legToTorsoRatio: 0.2,
      neckProportions: -0.1,
    }),
    tags: ["girl", "female", "tall", "hourglass", "curvy", "commanding"],
  },
  {
    id: "body-girl-short-full-figure",
    label: "Short & Full-Figured (Soft Silhouette)",
    gender: "female",
    ageGroup: "middle-age",
    description: "Comfortable compact height, soft full frame, gentle midsection curve, generous hips.",
    anchorBuild: "large",
    anchorHeight: "short",
    parameters: clampBodyDiversityParameters({
      heightScale: 0.85,
      frameWidth: 0.25,
      shoulderWidth: 0.15,
      muscleMass: 0.0,
      bodyMass: 0.6,
      bellyFullness: 0.55,
      chestFullness: 0.5,
      waistWidth: 0.4,
      hipWidth: 0.7,
      armThickness: 0.35,
      legThickness: 0.45,
      legToTorsoRatio: -0.1,
      neckProportions: 0.2,
    }),
    tags: ["girl", "female", "short", "full-figured", "plus", "soft"],
  },
  {
    id: "body-girl-average-athletic",
    label: "Average Athletic (Balanced Fit)",
    gender: "female",
    ageGroup: "young-adult",
    description: "Everyday athletic build, natural proportions, light toning, balanced hip and shoulder width.",
    anchorBuild: "athletic",
    anchorHeight: "average",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.0,
      frameWidth: 0.05,
      shoulderWidth: 0.1,
      muscleMass: 0.35,
      bodyMass: 0.05,
      bellyFullness: -0.15,
      chestFullness: 0.2,
      waistWidth: -0.05,
      hipWidth: 0.25,
      armThickness: 0.1,
      legThickness: 0.2,
      legToTorsoRatio: 0.05,
      neckProportions: 0.0,
    }),
    tags: ["girl", "female", "average", "athletic", "balanced", "everyday"],
  },
  {
    id: "body-girl-full-belly-curvy",
    label: "Full Belly & Wide Hips (Natural Plus)",
    gender: "female",
    ageGroup: "mature",
    description: "Pronounced natural lower belly, generous curves, wide stance, confident full presence.",
    anchorBuild: "heavy",
    anchorHeight: "average",
    parameters: clampBodyDiversityParameters({
      heightScale: 1.0,
      frameWidth: 0.35,
      shoulderWidth: 0.2,
      muscleMass: 0.05,
      bodyMass: 0.65,
      bellyFullness: 0.75,
      chestFullness: 0.55,
      waistWidth: 0.5,
      hipWidth: 0.75,
      armThickness: 0.35,
      legThickness: 0.45,
      legToTorsoRatio: -0.05,
      neckProportions: 0.25,
    }),
    tags: ["girl", "female", "plus", "full-belly", "wide-hips", "natural"],
  },
];

export const LEGACY_BODY_PRESET_MAP: Record<string, string> = {
  "body-short-heavy-belly": "body-boy-short-heavy-belly",
  "body-tall-slim-lean": "body-boy-tall-slim-lean",
  "body-short-muscular": "body-boy-short-muscular",
  "body-tall-broad-heavy": "body-boy-tall-broad-heavy",
  "body-broad-bigbelly-thinlegs": "body-boy-broad-bigbelly",
  "body-tall-athletic-buff": "body-boy-tall-athletic-buff",
  "body-average-stocky-deep": "body-boy-average-stocky",
  "body-curvy-full-frame": "body-girl-curvy-full-frame",
  "body-compact-strong": "body-boy-compact-strong",
};

export function getBodyDiversityPresetById(id: string): BodyDiversityPreset | undefined {
  const resolvedId = LEGACY_BODY_PRESET_MAP[id] ?? id;
  return GLOBAL_BODY_DIVERSITY_PRESETS.find((p) => p.id === resolvedId);
}

export function filterBodyPresets(gender?: "female" | "male" | "unisex" | "all"): BodyDiversityPreset[] {
  if (!gender || gender === "all") return GLOBAL_BODY_DIVERSITY_PRESETS;
  return GLOBAL_BODY_DIVERSITY_PRESETS.filter((p) => p.gender === gender || p.gender === "unisex");
}

export interface ExtendedBodyProportions extends BodyProportions {
  heightScale: number;
  bellyScale: number;
  bellyOffsetZ: number;
  chestDepth: number;
  armThickness: number;
  legLengthRatio: number;
  neckLength: number;
  neckThickness: number;
  boneScalingMap: Record<string, [number, number, number]>;
}

/**
 * Computes continuous body proportions on the canonical 26-bone skeleton.
 * Height matters proportionally (limb-to-torso, arm/leg thickness, head-to-body ratio).
 */
export function computeCanonicalBodyProportions(
  spec: AvatarSpec,
  diversityParams?: Partial<BodyDiversityParameters>,
): ExtendedBodyProportions {
  const base = AGE_PROPORTIONS[spec.ageGroup] ?? AGE_PROPORTIONS["adult"]!;
  const buildMod = BUILD_WIDTH_SCALE[spec.bodyBuild] ?? 1.0;
  const p = clampBodyDiversityParameters(diversityParams ?? {});

  // Proportional height scaling: does not stretch the head uniformly
  const heightMultiplier = HEIGHT_SCALE[spec.heightTier] * p.heightScale;

  // Head ratio maintains bobblehead styling without turning into a giant balloon or pinhead
  const headRatioAdjusted = THREE_HEAD_CLAMP(
    base.headRatio * (1 - (heightMultiplier - 1) * 0.18) * (1 - p.bodyMass * 0.08),
  );

  const shoulderWidth = Math.max(
    0.65,
    Math.min(1.7, (base.shoulderWidth * buildMod) * (1 + p.frameWidth * 0.25 + p.shoulderWidth * 0.2 + p.muscleMass * 0.1)),
  );

  const hipWidth = Math.max(
    0.65,
    Math.min(1.65, (base.hipWidth * buildMod) * (1 + p.frameWidth * 0.15 + p.hipWidth * 0.25 + p.bodyMass * 0.15)),
  );

  const waistMod = Math.max(0.6, Math.min(1.8, (1 + p.waistWidth * 0.3 + p.bodyMass * 0.25 + p.bellyFullness * 0.2)));
  const bellyScale = Math.max(0.7, Math.min(2.1, 1 + p.bellyFullness * 0.65 + p.bodyMass * 0.35));
  const bellyOffsetZ = Math.max(0, p.bellyFullness * 0.12 + Math.max(0, p.bodyMass) * 0.08);

  const limbThickness = Math.max(
    0.6,
    Math.min(1.65, (base.limbThickness * buildMod) * (1 + p.armThickness * 0.2 + p.legThickness * 0.2 + p.muscleMass * 0.15 + p.bodyMass * 0.1)),
  );

  const armThickness = Math.max(0.6, Math.min(1.7, limbThickness * (1 + p.armThickness * 0.25)));
  const legThickness = Math.max(0.6, Math.min(1.7, limbThickness * (1 + p.legThickness * 0.25)));

  const legLengthRatio = Math.max(
    0.75,
    Math.min(1.3, base.legLengthRatio * (1 + p.legToTorsoRatio * 0.2) * (0.85 + heightMultiplier * 0.15)),
  );

  const neckLength = Math.max(0.65, Math.min(1.35, base.neckLength * (1 - p.neckProportions * 0.2)));
  const neckThickness = Math.max(0.7, Math.min(1.6, 1 + p.neckProportions * 0.4 + p.bodyMass * 0.15));
  const chestDepth = Math.max(0.7, Math.min(1.6, 1 + p.chestFullness * 0.35 + p.muscleMass * 0.2));

  // Canonical 26-bone scaling map for 3D deformation
  const boneScalingMap: Record<string, [number, number, number]> = {
    Spine: [waistMod, 1, 1 + p.bellyFullness * 0.3],
    Spine1: [shoulderWidth * 0.85, 1, chestDepth],
    Spine2: [shoulderWidth, 1, chestDepth],
    Neck: [neckThickness, neckLength, neckThickness],
    LeftShoulder: [shoulderWidth, 1, 1],
    RightShoulder: [shoulderWidth, 1, 1],
    LeftArm: [armThickness, 1, armThickness],
    RightArm: [armThickness, 1, armThickness],
    LeftForeArm: [armThickness * 0.9, 1, armThickness * 0.9],
    RightForeArm: [armThickness * 0.9, 1, armThickness * 0.9],
    Hips: [hipWidth, 1, waistMod],
    LeftUpLeg: [legThickness, legLengthRatio, legThickness],
    RightUpLeg: [legThickness, legLengthRatio, legThickness],
    LeftLeg: [legThickness * 0.85, legLengthRatio, legThickness * 0.85],
    RightLeg: [legThickness * 0.85, legLengthRatio, legThickness * 0.85],
  };

  return {
    headRatio: headRatioAdjusted,
    legLengthRatio,
    shoulderWidth,
    hipWidth,
    neckLength,
    limbThickness,
    heightScale: heightMultiplier,
    bellyScale,
    bellyOffsetZ,
    chestDepth,
    armThickness,
    neckThickness,
    boneScalingMap,
  };
}

function THREE_HEAD_CLAMP(val: number): number {
  return Math.max(0.12, Math.min(0.24, val));
}

// ─── Persistence Authority ───────────────────────────────────────────────────

export const BODY_DIVERSITY_STORAGE_KEY = "tmi_avatar_body_diversity_v1";
let memoryFallbackBodyDiversity: BodyDiversityParameters | null = null;

export function readPersistedBodyDiversity(): BodyDiversityParameters {
  if (typeof window === "undefined") {
    return memoryFallbackBodyDiversity ?? DEFAULT_BODY_DIVERSITY_PARAMETERS;
  }
  try {
    const raw = window.sessionStorage.getItem(BODY_DIVERSITY_STORAGE_KEY);
    return raw ? clampBodyDiversityParameters(JSON.parse(raw)) : memoryFallbackBodyDiversity ?? DEFAULT_BODY_DIVERSITY_PARAMETERS;
  } catch {
    return memoryFallbackBodyDiversity ?? DEFAULT_BODY_DIVERSITY_PARAMETERS;
  }
}

export function persistBodyDiversity(params: BodyDiversityParameters): void {
  const safe = clampBodyDiversityParameters(params);
  memoryFallbackBodyDiversity = safe;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(BODY_DIVERSITY_STORAGE_KEY, JSON.stringify(safe));
  } catch {
    /* ignore storage quota */
  }
}

/**
 * TMI Global Avatar Identity Law Section 13: Randomize without stereotyping.
 * Generates an anatomically valid body recipe across continuous parameter ranges.
 */
export function generateRandomBodyRecipe(): BodyDiversityParameters {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  return clampBodyDiversityParameters({
    heightScale: rand(0.75, 1.25),
    frameWidth: rand(-0.4, 0.5),
    shoulderWidth: rand(-0.4, 0.5),
    muscleMass: rand(-0.3, 0.6),
    bodyMass: rand(-0.4, 0.6),
    bellyFullness: rand(-0.3, 0.7),
    chestFullness: rand(-0.3, 0.5),
    waistWidth: rand(-0.3, 0.5),
    hipWidth: rand(-0.3, 0.5),
    armThickness: rand(-0.3, 0.5),
    legThickness: rand(-0.3, 0.5),
    legToTorsoRatio: rand(-0.25, 0.25),
    neckProportions: rand(-0.3, 0.4),
  });
}
