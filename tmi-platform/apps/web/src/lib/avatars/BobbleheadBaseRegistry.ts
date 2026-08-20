/**
 * BobbleheadBaseRegistry — Fan-only starter bases from Marcel's concept pack.
 *
 * Source folder (gitignored, on-disk only):
 *   `BobbleHead Avatar Bases/` (17 concept files — see BOBBLEHEAD_SOURCE_INVENTORY)
 *
 * Marcel lock — digital world citizens:
 * - World presence = AvatarRig / BobbleheadRuntimeCharacter (R3F primitives + sockets)
 * - Same FanLobbyVenue seats / FREE_ROAM floor as venues (not CSS cutouts)
 * - previewImageUrl = catalog concept reference ONLY — never the seated avatar
 *
 * Honesty (Rules 18 / 20):
 * - Runtime today: procedural bobblehead mesh (oversized head capsule), not photoreal GLB
 * - Face-scan → morph → lip-sync → LOD is NOT implemented here
 *
 * Ownership (Rule 26): Fan-only. Never surface in Performer ownership UI.
 *
 * FUTURE (not shipped — do not stub as live features):
 * - faceScanPipeline: Photo → landmarks → UV map onto base head mesh
 * - glbRigUrl: Shared TMI humanoid rig (walk/sit/dance/emote)
 * - lipSyncDriver: Voice → viseme weights
 * - lodLadder: full → simplified → billboard → point-cloud
 * - evolutionRuntime: Observe/Measure/Recommend only (Rule 22) — never silent rewrite
 */

export type BobbleheadGender = "male" | "female" | "unisex";
export type BobbleheadBuild =
  | "slim"
  | "athletic"
  | "average"
  | "stocky"
  | "curvy"
  | "plus"
  | "youth"
  | "elder";
export type BobbleheadUnlock = "free" | "pro" | "ruby" | "silver" | "gold" | "store" | "points";
export type AccessoryFitSlot =
  | "headwear"
  | "eyewear"
  | "neckwear"
  | "outerwear"
  | "top"
  | "legwear"
  | "footwear"
  | "hand_prop"
  | "emote";

export type BobbleheadSourceKind =
  | "cutout_face_scan"
  | "turntable_sheet"
  | "roster_sheet"
  | "body_shapes"
  | "creation_studio_ui"
  | "style_extras"
  | "generated_preview";

/** On-disk inventory of every file in `BobbleHead Avatar Bases/` (flat, 17 files, 0 subdirs). */
export interface BobbleheadSourceAsset {
  id: string;
  /** Filename as stored on disk (extension may be missing — detect via magic). */
  fileName: string;
  /** Relative to repo root; not served by Next — register only. */
  localRefPath: string;
  detectedFormat: "jpeg" | "png" | "unknown";
  approxBytes: number;
  kind: BobbleheadSourceKind;
  catalogNotes: string;
}

export interface BobbleheadAccessoryTemplate {
  id: string;
  label: string;
  slot: AccessoryFitSlot;
  /** Links existing FanCosmeticCatalog SKU when present. */
  cosmeticSkuId?: string;
  /** Style tags that match base.styleTags for compatibility. */
  compatibleStyleTags: string[];
  unlock: BobbleheadUnlock;
  pointsCost: number;
  icon: string;
  description: string;
}

export interface BobbleheadBase {
  id: string;
  displayName: string;
  gender: BobbleheadGender;
  build: BobbleheadBuild;
  styleTags: string[];
  hair: string;
  outfitSummary: string;
  accessoriesVisible: string[];
  environmentCue: "studio" | "indoor" | "outdoor" | "mixed";
  /** Public web path — catalog concept reference only (not world citizen). */
  previewImageUrl: string;
  /** Catalog honesty — world citizen uses AvatarRig, not this image. */
  previewHonestyLabel: "Concept catalog ref — world avatar is AvatarRig 3D";
  /** Path under gitignored BobbleHead folder (or sheet id). */
  sourceRefPath: string;
  sourceAssetIds: string[];
  unlock: BobbleheadUnlock;
  pointsCost: number;
  fanOnly: true;
  /** Design generation counter for future improvement tracking — not an AI learner. */
  evolutionGeneration: number;
  evolutionNotes: string;
  /** Compatible accessory template ids. */
  accessoryFitSlots: AccessoryFitSlot[];
  /** Future fields — undefined until real pipeline exists. */
  faceScanReady?: never;
  glbRigUrl?: never;
  lipSyncDriver?: never;
  lodLadder?: never;
}

const REF_ROOT = "BobbleHead Avatar Bases";
const PREVIEW = "/avatars/bobblehead-bases";
const HONEST = "Concept catalog ref — world avatar is AvatarRig 3D" as const;

export const BOBBLEHEAD_SOURCE_INVENTORY: BobbleheadSourceAsset[] = [
  {
    id: "src-studio-1",
    fileName: "Avatar Creation Studio 1.png",
    localRefPath: `${REF_ROOT}/Avatar Creation Studio 1.png`,
    detectedFormat: "png",
    approxBytes: 216225,
    kind: "creation_studio_ui",
    catalogNotes: "UI mock — Hair/Eyes/Accessories/Outfits/Props + cosmetic store rarities",
  },
  {
    id: "src-studio-2",
    fileName: "Avatar Creation Studio 2",
    localRefPath: `${REF_ROOT}/Avatar Creation Studio 2`,
    detectedFormat: "jpeg",
    approxBytes: 162292,
    kind: "creation_studio_ui",
    catalogNotes: "Second creation-studio UI concept (no extension on disk)",
  },
  {
    id: "src-cutout-1",
    fileName: "BobbleHead Avatar 1 Cutout for face scan.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar 1 Cutout for face scan.jpg`,
    detectedFormat: "png",
    approxBytes: 2046464,
    kind: "cutout_face_scan",
    catalogNotes: "Large face-scan cutout concept (misnamed .jpg; PNG magic) — do not commit",
  },
  {
    id: "src-cutout-2",
    fileName: "BobbleHead Avatar 2 Cutout for face scan.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar 2 Cutout for face scan.jpg`,
    detectedFormat: "png",
    approxBytes: 1966585,
    kind: "cutout_face_scan",
    catalogNotes: "Face-scan cutout pair with urban turntable sheet",
  },
  {
    id: "src-sheet-2",
    fileName: "BobbleHead Avatar 2.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar 2.jpg`,
    detectedFormat: "jpeg",
    approxBytes: 105343,
    kind: "turntable_sheet",
    catalogNotes: "Urban male (cap/shades) + rocker dreads leather — 4-angle turntables",
  },
  {
    id: "src-cutout-3",
    fileName: "BobbleHead Avatar 3 Cutout for face scan.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar 3 Cutout for face scan.jpg`,
    detectedFormat: "png",
    approxBytes: 1831894,
    kind: "cutout_face_scan",
    catalogNotes: "Face-scan cutout for Diverse Roster II sheet A",
  },
  {
    id: "src-sheet-3",
    fileName: "BobbleHead Avatar 3.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar 3.jpg`,
    detectedFormat: "jpeg",
    approxBytes: 136749,
    kind: "roster_sheet",
    catalogNotes: "Avatar Studio roster — kendo, afrofuturist, fisherman, Hawaiian, lab, scuba, weaver, architect…",
  },
  {
    id: "src-cutout-4",
    fileName: "BobbleHead Avatar 4 Cutout for face scan.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar 4 Cutout for face scan.jpg`,
    detectedFormat: "png",
    approxBytes: 1882770,
    kind: "cutout_face_scan",
    catalogNotes: "Face-scan cutout for Diverse Roster II sheet B",
  },
  {
    id: "src-sheet-4",
    fileName: "BobbleHead Avatar 4.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar 4.jpg`,
    detectedFormat: "jpeg",
    approxBytes: 126716,
    kind: "roster_sheet",
    catalogNotes: "Roster — adventurer youth, fashionista, elder, athlete, matriarch, music fan, executive…",
  },
  {
    id: "src-cutout-5",
    fileName: "BobbleHead Avatar 5 Cutout for face scan.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar 5 Cutout for face scan.jpg`,
    detectedFormat: "jpeg",
    approxBytes: 68252,
    kind: "cutout_face_scan",
    catalogNotes: "Smaller face-scan cutout for youth/skater roster",
  },
  {
    id: "src-sheet-5",
    fileName: "BobbleHead Avatar 5.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar 5.jpg`,
    detectedFormat: "jpeg",
    approxBytes: 134963,
    kind: "roster_sheet",
    catalogNotes: "360 library UI — skater, artsy, casual, fusion, athleisure, streetwear",
  },
  {
    id: "src-bodyshapes-1",
    fileName: "BobbleHead Avatar Bodyshapes",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar Bodyshapes`,
    detectedFormat: "png",
    approxBytes: 1785402,
    kind: "body_shapes",
    catalogNotes: "Body-shape reference sheet 1 (no extension)",
  },
  {
    id: "src-bodyshapes-2",
    fileName: "BobbleHead Avatar Bodyshapes 2",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar Bodyshapes 2`,
    detectedFormat: "png",
    approxBytes: 1782686,
    kind: "body_shapes",
    catalogNotes: "Body-shape reference sheet 2",
  },
  {
    id: "src-bodyshapes-3",
    fileName: "BobbleHead Avatar Bodyshapes 3",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar Bodyshapes 3`,
    detectedFormat: "png",
    approxBytes: 1604297,
    kind: "body_shapes",
    catalogNotes: "Body-shape reference sheet 3",
  },
  {
    id: "src-extras-1",
    fileName: "BobbleHead Avatar extras 1.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar extras 1.jpg`,
    detectedFormat: "jpeg",
    approxBytes: 166908,
    kind: "style_extras",
    catalogNotes: "Outdoor maritime couple — ultra-realistic bobblehead style cue (ship deck)",
  },
  {
    id: "src-extras-2",
    fileName: "BobbleHead Avatar extras 2.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar extras 2.jpg`,
    detectedFormat: "jpeg",
    approxBytes: 148173,
    kind: "style_extras",
    catalogNotes: "Outdoor coastal action caricature — tactical vest / helmet fit cues (not a TMI base)",
  },
  {
    id: "src-extras-3",
    fileName: "BobbleHead Avatar extras 3.jpg",
    localRefPath: `${REF_ROOT}/BobbleHead Avatar extras 3.jpg`,
    detectedFormat: "jpeg",
    approxBytes: 174572,
    kind: "style_extras",
    catalogNotes: "Outdoor ruin cinematic style cue — headwear/robe/hand-prop slots (not a TMI base)",
  },
];

/** Selectable Fan starter bases — archetype batch (not one registry row per roster tile). */
export const BOBBLEHEAD_BASES: BobbleheadBase[] = [
  {
    id: "bh-urban-cap-male",
    displayName: "Urban Cap",
    gender: "male",
    build: "stocky",
    styleTags: ["urban", "streetwear", "minimalist", "stealth"],
    hair: "short + beard",
    outfitSummary: "Black tee, black pants, backwards cap, shades",
    accessoriesVisible: ["backwards_cap", "sunglasses"],
    environmentCue: "studio",
    previewImageUrl: `${PREVIEW}/base-urban-cap-male.jpg`,
    previewHonestyLabel: HONEST,
    sourceRefPath: `${REF_ROOT}/BobbleHead Avatar 2.jpg`,
    sourceAssetIds: ["src-sheet-2", "src-cutout-2", "src-studio-1"],
    unlock: "free",
    pointsCost: 0,
    fanOnly: true,
    evolutionGeneration: 1,
    evolutionNotes: "Seed from urban turntable + creation-studio cosmetic slots",
    accessoryFitSlots: ["headwear", "eyewear", "neckwear", "top", "legwear", "footwear", "emote"],
  },
  {
    id: "bh-rocker-dreads-male",
    displayName: "Rocker Dreads",
    gender: "male",
    build: "stocky",
    styleTags: ["rocker", "streetwear", "layered", "leather"],
    hair: "long dreadlocks",
    outfitSummary: "Leather jacket, ripped jeans, chain, shades",
    accessoriesVisible: ["sunglasses", "gold_chain", "leather_jacket"],
    environmentCue: "studio",
    previewImageUrl: `${PREVIEW}/base-rocker-dreads-male.jpg`,
    previewHonestyLabel: HONEST,
    sourceRefPath: `${REF_ROOT}/BobbleHead Avatar 2.jpg`,
    sourceAssetIds: ["src-sheet-2"],
    unlock: "free",
    pointsCost: 0,
    fanOnly: true,
    evolutionGeneration: 1,
    evolutionNotes: "Layered outerwear + jewelry fit points from turntable sheet",
    accessoryFitSlots: ["headwear", "eyewear", "neckwear", "outerwear", "top", "legwear", "footwear", "emote"],
  },
  {
    id: "bh-kendo-male",
    displayName: "Kendo Practitioner",
    gender: "male",
    build: "athletic",
    styleTags: ["martial", "traditional", "sport", "japanese"],
    hair: "short dark",
    outfitSummary: "Navy kendo gi + shinai prop",
    accessoriesVisible: ["shinai"],
    environmentCue: "studio",
    previewImageUrl: `${PREVIEW}/base-kendo-male.jpg`,
    previewHonestyLabel: HONEST,
    sourceRefPath: `${REF_ROOT}/BobbleHead Avatar 3.jpg`,
    sourceAssetIds: ["src-sheet-3", "src-cutout-3"],
    unlock: "free",
    pointsCost: 0,
    fanOnly: true,
    evolutionGeneration: 1,
    evolutionNotes: "Roster P1 kendo archetype — hand_prop priority",
    accessoryFitSlots: ["headwear", "top", "legwear", "footwear", "hand_prop", "emote"],
  },
  {
    id: "bh-music-fan-female",
    displayName: "Music Fan",
    gender: "female",
    build: "youth",
    styleTags: ["music", "streetwear", "hoodie", "headphones"],
    hair: "long micro-braids",
    outfitSummary: "Black hoodie, ripped jeans, headphones, phone",
    accessoriesVisible: ["headphones", "phone"],
    environmentCue: "studio",
    previewImageUrl: `${PREVIEW}/base-music-fan-female.jpg`,
    previewHonestyLabel: HONEST,
    sourceRefPath: `${REF_ROOT}/BobbleHead Avatar 4.jpg`,
    sourceAssetIds: ["src-sheet-4", "src-cutout-4"],
    unlock: "free",
    pointsCost: 0,
    fanOnly: true,
    evolutionGeneration: 1,
    evolutionNotes: "Roster music-fan tile — neck/hand accessory focus",
    accessoryFitSlots: ["headwear", "eyewear", "neckwear", "top", "legwear", "footwear", "hand_prop", "emote"],
  },
  {
    id: "bh-skater-youth-male",
    displayName: "Skater Youth",
    gender: "male",
    build: "youth",
    styleTags: ["skater", "streetwear", "beanie", "casual"],
    hair: "short under beanie",
    outfitSummary: "Beanie, graphic hoodie, cargo pants, skateboard",
    accessoriesVisible: ["beanie", "skateboard"],
    environmentCue: "studio",
    previewImageUrl: `${PREVIEW}/base-skater-youth-male.jpg`,
    previewHonestyLabel: HONEST,
    sourceRefPath: `${REF_ROOT}/BobbleHead Avatar 5.jpg`,
    sourceAssetIds: ["src-sheet-5", "src-cutout-5"],
    unlock: "free",
    pointsCost: 0,
    fanOnly: true,
    evolutionGeneration: 1,
    evolutionNotes: "Youth 360 library skater card",
    accessoryFitSlots: ["headwear", "top", "legwear", "footwear", "hand_prop", "emote"],
  },
  {
    id: "bh-athlete-female",
    displayName: "Arena Athlete",
    gender: "female",
    build: "athletic",
    styleTags: ["athletic", "athleisure", "sport", "fitness"],
    hair: "ponytail",
    outfitSummary: "Athletic tank + leggings, water bottles",
    accessoriesVisible: ["water_bottle"],
    environmentCue: "studio",
    previewImageUrl: `${PREVIEW}/base-athlete-female.jpg`,
    previewHonestyLabel: HONEST,
    sourceRefPath: `${REF_ROOT}/BobbleHead Avatar 4.jpg`,
    sourceAssetIds: ["src-sheet-4"],
    unlock: "pro",
    pointsCost: 0,
    fanOnly: true,
    evolutionGeneration: 1,
    evolutionNotes: "Roster athlete tile — outdoor venue dance-floor ready later",
    accessoryFitSlots: ["headwear", "top", "legwear", "footwear", "hand_prop", "emote"],
  },
  {
    id: "bh-matriarch-elder-female",
    displayName: "Matriarch Elder",
    gender: "female",
    build: "elder",
    styleTags: ["traditional", "elegant", "indoor", "seated"],
    hair: "grey bun",
    outfitSummary: "Ornate traditional dress + folding fan",
    accessoriesVisible: ["folding_fan"],
    environmentCue: "indoor",
    previewImageUrl: `${PREVIEW}/base-matriarch-elder-female.jpg`,
    previewHonestyLabel: HONEST,
    sourceRefPath: `${REF_ROOT}/BobbleHead Avatar 4.jpg`,
    sourceAssetIds: ["src-sheet-4"],
    unlock: "ruby",
    pointsCost: 0,
    fanOnly: true,
    evolutionGeneration: 1,
    evolutionNotes: "Seating-binding candidate when VenueRuntime seats ship",
    accessoryFitSlots: ["headwear", "top", "legwear", "footwear", "hand_prop", "emote"],
  },
  {
    id: "bh-professional-female",
    displayName: "Studio Professional",
    gender: "female",
    build: "average",
    styleTags: ["professional", "business", "modern"],
    hair: "dark shoulder-length",
    outfitSummary: "White blouse, black pencil skirt, heels",
    accessoriesVisible: [],
    environmentCue: "studio",
    previewImageUrl: `${PREVIEW}/base-professional-female.jpg`,
    previewHonestyLabel: HONEST,
    sourceRefPath: `${REF_ROOT}/BobbleHead Avatar 4.jpg`,
    sourceAssetIds: ["src-sheet-4", "src-sheet-3"],
    unlock: "free",
    pointsCost: 0,
    fanOnly: true,
    evolutionGeneration: 1,
    evolutionNotes: "Business/architect roster family",
    accessoryFitSlots: ["headwear", "eyewear", "neckwear", "outerwear", "top", "legwear", "footwear", "hand_prop", "emote"],
  },
];

/**
 * Accessory templates for bobblehead fit points.
 * Prefer linking FanCosmeticCatalog SKUs — no fake AI generator API.
 */
export const BOBBLEHEAD_ACCESSORY_TEMPLATES: BobbleheadAccessoryTemplate[] = [
  {
    id: "acc-backwards-cap",
    label: "Backwards Cap",
    slot: "headwear",
    cosmeticSkuId: "backwards_cap",
    compatibleStyleTags: ["urban", "streetwear", "skater", "minimalist"],
    unlock: "free",
    pointsCost: 0,
    icon: "🧢",
    description: "Concept headwear fit — maps to head socket when GLB lands",
  },
  {
    id: "acc-beanie",
    label: "Street Beanie",
    slot: "headwear",
    cosmeticSkuId: "street_beanie",
    compatibleStyleTags: ["skater", "streetwear", "casual", "music"],
    unlock: "free",
    pointsCost: 0,
    icon: "🧶",
    description: "Youth roster beanie slot",
  },
  {
    id: "acc-sunglasses",
    label: "Studio Shades",
    slot: "eyewear",
    cosmeticSkuId: "sunglasses",
    compatibleStyleTags: ["urban", "rocker", "streetwear", "professional"],
    unlock: "points",
    pointsCost: 200,
    icon: "🕶️",
    description: "Wired to FanCosmeticCatalog sunglasses SKU",
  },
  {
    id: "acc-gold-chain",
    label: "Gold Chain",
    slot: "neckwear",
    cosmeticSkuId: "gold_chain",
    compatibleStyleTags: ["rocker", "streetwear", "urban", "music"],
    unlock: "points",
    pointsCost: 180,
    icon: "📿",
    description: "Wired to FanCosmeticCatalog gold_chain SKU",
  },
  {
    id: "acc-leather-jacket",
    label: "Leather Jacket",
    slot: "outerwear",
    cosmeticSkuId: "cyber-jacket-neon",
    compatibleStyleTags: ["rocker", "leather", "layered", "streetwear"],
    unlock: "points",
    pointsCost: 299,
    icon: "🧥",
    description: "Outerwear fit — uses neon jacket SKU until leather GLB exists",
  },
  {
    id: "acc-headphones",
    label: "Neck Headphones",
    slot: "neckwear",
    cosmeticSkuId: "neck_headphones",
    compatibleStyleTags: ["music", "hoodie", "streetwear", "youth"],
    unlock: "points",
    pointsCost: 150,
    icon: "🎧",
    description: "Music-fan neck accessory template",
  },
  {
    id: "acc-crown",
    label: "Crown",
    slot: "headwear",
    cosmeticSkuId: "crown",
    compatibleStyleTags: ["elegant", "professional", "urban"],
    unlock: "points",
    pointsCost: 400,
    icon: "👑",
    description: "Legendary headwear — FanCosmeticCatalog crown",
  },
  {
    id: "acc-mic",
    label: "Starter Mic",
    slot: "hand_prop",
    cosmeticSkuId: "mic",
    compatibleStyleTags: ["music", "urban", "streetwear", "professional"],
    unlock: "free",
    pointsCost: 0,
    icon: "🎤",
    description: "Hand prop — FanCosmeticCatalog mic",
  },
  {
    id: "acc-skateboard",
    label: "Skateboard Prop",
    slot: "hand_prop",
    compatibleStyleTags: ["skater", "youth", "streetwear"],
    unlock: "points",
    pointsCost: 120,
    icon: "🛹",
    description: "Skater hand_prop template — no GLB yet",
  },
  {
    id: "acc-emote-dance",
    label: "Dance Burst",
    slot: "emote",
    compatibleStyleTags: ["athletic", "music", "skater", "urban", "streetwear"],
    unlock: "free",
    pointsCost: 0,
    icon: "💃",
    description: "Emote slot — pairs with avatarInventoryEngine emote-dance-01",
  },
];

/** Promoted sheet previews under public/ (concept boards, not individual GLBs). */
export const BOBBLEHEAD_SHEET_PREVIEWS = [
  { id: "sheet-urban-street", url: `${PREVIEW}/sheet-urban-street.jpg`, sourceAssetId: "src-sheet-2" },
  { id: "sheet-roster-diverse-a", url: `${PREVIEW}/sheet-roster-diverse-a.jpg`, sourceAssetId: "src-sheet-3" },
  { id: "sheet-roster-diverse-b", url: `${PREVIEW}/sheet-roster-diverse-b.jpg`, sourceAssetId: "src-sheet-4" },
  { id: "sheet-roster-youth", url: `${PREVIEW}/sheet-roster-youth.jpg`, sourceAssetId: "src-sheet-5" },
  { id: "ui-creation-studio-ref", url: `${PREVIEW}/ui-creation-studio-ref.png`, sourceAssetId: "src-studio-1" },
] as const;

export const BOBBLEHEAD_DEFAULT_BASE_ID = "bh-urban-cap-male";

export function getBobbleheadBaseById(id: string): BobbleheadBase | undefined {
  return BOBBLEHEAD_BASES.find((b) => b.id === id);
}

export function listFanSelectableBases(): BobbleheadBase[] {
  return BOBBLEHEAD_BASES.filter((b) => b.fanOnly);
}

export function listFreeBobbleheadBases(): BobbleheadBase[] {
  return BOBBLEHEAD_BASES.filter((b) => b.unlock === "free");
}

export function getAccessoriesForBase(baseId: string): BobbleheadAccessoryTemplate[] {
  const base = getBobbleheadBaseById(baseId);
  if (!base) return [];
  return BOBBLEHEAD_ACCESSORY_TEMPLATES.filter((acc) => {
    if (!base.accessoryFitSlots.includes(acc.slot)) return false;
    return acc.compatibleStyleTags.some((t) => base.styleTags.includes(t));
  });
}

export function getBobbleheadSourceInventoryStats() {
  return {
    folder: REF_ROOT,
    subfolders: 0,
    fileCount: BOBBLEHEAD_SOURCE_INVENTORY.length,
    selectableBases: BOBBLEHEAD_BASES.length,
    accessoryTemplates: BOBBLEHEAD_ACCESSORY_TEMPLATES.length,
    promotedSheetPreviews: BOBBLEHEAD_SHEET_PREVIEWS.length,
  };
}

/** Gap ledger for assembly directors — EXISTS vs MISSING (blocking soft-launch vs future). */
export const BOBBLEHEAD_PIPELINE_GAP = {
  exists: [
    { piece: "AvatarRig + sockets (R3F Primitive3D v0)", path: "apps/web/src/components/3d/AvatarLobbyCanvas.tsx" },
    { piece: "BobbleheadRuntimeCharacter → venue/lobby seating", path: "apps/web/src/lib/avatars/BobbleheadRuntimeCharacter.ts" },
    { piece: "Fan lobby FREE_ROAM + seat sit/stand", path: "apps/web/src/components/lobbies/LobbyFreeRoamAvatars.tsx" },
    { piece: "Fan cosmetic SKUs + sockets", path: "apps/web/src/lib/avatars/FanCosmeticCatalog.ts" },
    { piece: "AvatarCreationCenter + Workspace (Fan RoleGate)", path: "apps/web/src/components/canisters/AvatarCreationCenter.tsx" },
    { piece: "This base registry + concept catalog refs", path: "apps/web/src/lib/avatars/BobbleheadBaseRegistry.ts" },
    { piece: "ArenaEventShell → UniversalVenueRenderer audience world", path: "apps/web/src/components/live/UniversalVenueRenderer.tsx" },
  ],
  missingBlocking: [
    { piece: "Photoreal GLB body + head from concept sheets", note: "Procedural AvatarRig stands in — certifiedGlb false" },
    { piece: "Real face-scan → mesh pipeline", note: "Rule 18 unbuilt; Capture/Upload remain shells" },
    { piece: "AudienceScene canvas seats using BobbleheadRuntimeCharacter", note: "Fan lobby wired; Arena 2D crowd canvas still entity-driven without full R3F bobbleheads" },
  ],
  missingFuture: [
    { piece: "Lip sync / facial animation", note: "FUTURE — do not stub" },
    { piece: "LOD ladder for crowd", note: "After real GLB avatar exists" },
    { piece: "Full FREE_ROAM_3D collision mesh shared with UniversalVenueRenderer", note: "Lobby anchors + sit pose exist; full physics collision pending" },
    { piece: "Evolution observe→recommend loop", note: "Rule 22 — evolutionGeneration is a counter only" },
    { piece: "Procedural accessory AI generator", note: "Templates + socket attach only — no fake generation API" },
  ],
} as const;
