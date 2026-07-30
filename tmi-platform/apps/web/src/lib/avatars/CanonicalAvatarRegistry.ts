/**
 * Canonical Avatar Registry — Phase 11
 * Single source of truth for the platform-wide Canonical Avatar System.
 * Defines 12 Global Archetype Base Characters, Bobblehead ratios, Body Types,
 * Modular Hair, Face Morph Targets, and Wearable Rigging mappings.
 */

export type CreationPath = "FACE_SCAN" | "STARTER_ARCHETYPE";

export type GenderType = "MALE" | "FEMALE" | "NON_BINARY";

export type BodyTypeCategory = "SLIM" | "ATHLETIC" | "AVERAGE" | "CURVY" | "HEAVY" | "TALL" | "SHORT";

export interface ArchetypeBase {
  id: string;
  name: string;
  ethnicityRegion: string;
  gender: GenderType;
  baseSkinTone: string;
  defaultHairStyle: string;
  thumbnailUrl: string;
}

export const GLOBAL_12_ARCHETYPES: ArchetypeBase[] = [
  { id: "arch-black-m", name: "Black Male Archetype", ethnicityRegion: "African / African American", gender: "MALE", baseSkinTone: "#3b2219", defaultHairStyle: "locs", thumbnailUrl: "/assets/archetypes/black_m.png" },
  { id: "arch-black-f", name: "Black Female Archetype", ethnicityRegion: "African / African American", gender: "FEMALE", baseSkinTone: "#4a2d21", defaultHairStyle: "braided-bun", thumbnailUrl: "/assets/archetypes/black_f.png" },
  { id: "arch-white-m", name: "White Male Archetype", ethnicityRegion: "European", gender: "MALE", baseSkinTone: "#f5d0b5", defaultHairStyle: "fade", thumbnailUrl: "/assets/archetypes/white_m.png" },
  { id: "arch-white-f", name: "White Female Archetype", ethnicityRegion: "European", gender: "FEMALE", baseSkinTone: "#f7d7c4", defaultHairStyle: "wavy-long", thumbnailUrl: "/assets/archetypes/white_f.png" },
  { id: "arch-latino-m", name: "Latino Male Archetype", ethnicityRegion: "Hispanic / Latino", gender: "MALE", baseSkinTone: "#c68b59", defaultHairStyle: "buzz-cut", thumbnailUrl: "/assets/archetypes/latino_m.png" },
  { id: "arch-latina-f", name: "Latina Female Archetype", ethnicityRegion: "Hispanic / Latino", gender: "FEMALE", baseSkinTone: "#d09564", defaultHairStyle: "curly-afro", thumbnailUrl: "/assets/archetypes/latina_f.png" },
  { id: "arch-e-asian-m", name: "East Asian Male Archetype", ethnicityRegion: "East Asian", gender: "MALE", baseSkinTone: "#f3cc9b", defaultHairStyle: "straight-fringe", thumbnailUrl: "/assets/archetypes/e_asian_m.png" },
  { id: "arch-e-asian-f", name: "East Asian Female Archetype", ethnicityRegion: "East Asian", gender: "FEMALE", baseSkinTone: "#f5d4a7", defaultHairStyle: "straight-bob", thumbnailUrl: "/assets/archetypes/e_asian_f.png" },
  { id: "arch-s-asian-m", name: "South Asian Male Archetype", ethnicityRegion: "South Asian", gender: "MALE", baseSkinTone: "#8d5b3d", defaultHairStyle: "slick-back", thumbnailUrl: "/assets/archetypes/s_asian_m.png" },
  { id: "arch-s-asian-f", name: "South Asian Female Archetype", ethnicityRegion: "South Asian", gender: "FEMALE", baseSkinTone: "#986243", defaultHairStyle: "long-braid", thumbnailUrl: "/assets/archetypes/s_asian_f.png" },
  { id: "arch-mena-m", name: "Middle Eastern / North African Archetype", ethnicityRegion: "MENA", gender: "MALE", baseSkinTone: "#ab7853", defaultHairStyle: "fade-beard", thumbnailUrl: "/assets/archetypes/mena_m.png" },
  { id: "arch-pac-f", name: "Pacific Islander / Indigenous Archetype", ethnicityRegion: "Pacific Islander", gender: "FEMALE", baseSkinTone: "#86523c", defaultHairStyle: "wavy-curls", thumbnailUrl: "/assets/archetypes/pac_f.png" },
];

export interface FaceMorphParameters {
  headWidth: number;      // -1.0 to 1.0
  jawShape: number;       // -1.0 to 1.0
  chinProminence: number; // -1.0 to 1.0
  cheekVolume: number;    // -1.0 to 1.0
  noseSize: number;       // -1.0 to 1.0
  lipThickness: number;   // -1.0 to 1.0
  eyeSpacing: number;     // -1.0 to 1.0
  foreheadHeight: number; // -1.0 to 1.0
}

export interface CanonicalAvatarProfile {
  userId: string;
  creationPath: CreationPath;
  faceScanDataUrl?: string;
  archetypeId: string;
  bobbleheadRatio: number; // 1.0 = normal, 1.35 = signature TMI Bobblehead
  bodyType: BodyTypeCategory;
  skinToneHex: string;
  hairStyleId: string;
  hairColorHex: string;
  morphs: FaceMorphParameters;
  outfitId: string;
  equippedProps: string[];
}

export const DEFAULT_CANONICAL_AVATAR: CanonicalAvatarProfile = {
  userId: "canonical-user-default",
  creationPath: "STARTER_ARCHETYPE",
  archetypeId: "arch-black-m",
  bobbleheadRatio: 1.35, // Signature TMI Bobblehead Ratio
  bodyType: "ATHLETIC",
  skinToneHex: "#3b2219",
  hairStyleId: "locs",
  hairColorHex: "#111111",
  morphs: {
    headWidth: 0.0,
    jawShape: 0.2,
    chinProminence: 0.1,
    cheekVolume: 0.0,
    noseSize: 0.0,
    lipThickness: 0.1,
    eyeSpacing: 0.0,
    foreheadHeight: 0.0,
  },
  outfitId: "outfit-tmi-gold-jacket",
  equippedProps: ["mic-gold-stage"],
};

export function getArchetypeById(id: string): ArchetypeBase {
  return GLOBAL_12_ARCHETYPES.find((a) => a.id === id) || GLOBAL_12_ARCHETYPES[0];
}
