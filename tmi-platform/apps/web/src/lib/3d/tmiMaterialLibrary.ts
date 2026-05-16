export type TmiMaterialId =
  | "gloss-black-leather"
  | "chrome-trim"
  | "cyan-edge-glow"
  | "hot-pink-neon"
  | "electric-blue-neon"
  | "glass-dark"
  | "stage-matte-carbon"
  | "billboard-gloss"
  | "seat-fabric-premium";

export type TmiMaterialDefinition = {
  id: TmiMaterialId;
  label: string;
  baseColorToken: string;
  roughness: number;
  metalness: number;
  emissiveIntensity?: number;
  notes?: string;
};

export const TMI_MATERIAL_LIBRARY: Record<TmiMaterialId, TmiMaterialDefinition> = {
  "gloss-black-leather": {
    id: "gloss-black-leather",
    label: "Gloss Black Leather",
    baseColorToken: "TMI_GLASS_BLACK",
    roughness: 0.2,
    metalness: 0.05,
    notes: "Premium seat and panel surfaces",
  },
  "chrome-trim": {
    id: "chrome-trim",
    label: "Chrome Trim",
    baseColorToken: "TMI_CHROME",
    roughness: 0.15,
    metalness: 0.95,
  },
  "cyan-edge-glow": {
    id: "cyan-edge-glow",
    label: "Cyan Edge Glow",
    baseColorToken: "TMI_CYAN",
    roughness: 0.35,
    metalness: 0.4,
    emissiveIntensity: 1.4,
  },
  "hot-pink-neon": {
    id: "hot-pink-neon",
    label: "Hot Pink Neon",
    baseColorToken: "TMI_HOT_PINK",
    roughness: 0.3,
    metalness: 0.25,
    emissiveIntensity: 1.8,
  },
  "electric-blue-neon": {
    id: "electric-blue-neon",
    label: "Electric Blue Neon",
    baseColorToken: "TMI_ELECTRIC_BLUE",
    roughness: 0.3,
    metalness: 0.25,
    emissiveIntensity: 1.7,
  },
  "glass-dark": {
    id: "glass-dark",
    label: "Dark Glass",
    baseColorToken: "TMI_GLASS_BLACK",
    roughness: 0.1,
    metalness: 0.3,
  },
  "stage-matte-carbon": {
    id: "stage-matte-carbon",
    label: "Stage Matte Carbon",
    baseColorToken: "TMI_RED",
    roughness: 0.65,
    metalness: 0.2,
  },
  "billboard-gloss": {
    id: "billboard-gloss",
    label: "Billboard Gloss",
    baseColorToken: "TMI_WHITE_GLOW",
    roughness: 0.2,
    metalness: 0.25,
  },
  "seat-fabric-premium": {
    id: "seat-fabric-premium",
    label: "Seat Fabric Premium",
    baseColorToken: "TMI_LIME",
    roughness: 0.55,
    metalness: 0.1,
  },
};

export function getMaterialById(materialId: TmiMaterialId): TmiMaterialDefinition {
  return TMI_MATERIAL_LIBRARY[materialId];
}
