/**
 * Canonical Foundry manufacturing departments — one Foundry, many isolated departments.
 * Avatar wardrobe (8) · Personal Props · Venue/World · Media Equipment · Blueprint Library
 */

export type FoundryDivisionId =
  | "AVATAR_CUSTOMIZATION"
  | "AVATAR_PERSONAL_PROPS"
  | "VENUE_WORLD_CONSTRUCTION"
  | "MEDIA_DISPLAYS_EQUIPMENT"
  | "BLUEPRINT_REFERENCE_LIBRARY";

export type FoundryDepartmentId =
  // Avatar anatomy
  | "FACES_HEAD_SHAPES"
  | "FACIAL_FEATURES"
  | "SKIN_MATERIALS"
  | "HAIRSTYLES"
  | "BEARDS_FACIAL_HAIR"
  | "GLOVES"
  // Wardrobe (8 first-class ACC categories)
  | "OUTFITS"
  | "TOPS"
  | "BOTTOMS"
  | "SHOES"
  | "HATS"
  | "ACCESSORIES"
  | "MASKS"
  | "PROPS"
  // Venue & world
  | "WALLS_PARTITIONS"
  | "FLOORS_PLATFORMS"
  | "CEILINGS_ROOFS"
  | "DOORS_WINDOWS"
  | "STAIRS_ELEVATORS"
  | "TERRAIN_LANDSCAPING"
  | "INDOOR_ENVIRONMENTS"
  | "OUTDOOR_ENVIRONMENTS"
  | "VENUE_SHELLS_STAGES"
  | "FURNITURE_SEATING"
  | "DECOR_DISPLAYS"
  | "LIGHTING_FX"
  | "INTERACTIVE_WORLD_OBJECTS"
  // Media equipment (under venue division)
  | "JUKEBOXES_MUSIC_STATIONS"
  | "LOUNGE_VIDEO_PANELS"
  | "TELEVISIONS_MONITORS"
  | "COMMERCIAL_AD_SCREENS"
  | "STAGE_SCREENS_JUMBOTRONS"
  // Knowledge
  | "BLUEPRINT_LIBRARY";

export type AccWardrobeSectionId =
  | "OUTFITS"
  | "TOPS"
  | "BOTTOMS"
  | "SHOES"
  | "HATS"
  | "ACCESSORIES"
  | "MASKS"
  | "PROPS";

export type FootwearTypeId =
  | "SNEAKERS_ATHLETIC"
  | "BOOTS"
  | "DRESS_LOAFERS"
  | "SANDALS_SLIDES"
  | "HEELS"
  | "PLATFORMS"
  | "SLIPPERS"
  | "FUTURISTIC"
  | "COSTUME_FOOTWEAR"
  | "CUSTOM";

export type FoundryDepartmentDef = {
  departmentId: FoundryDepartmentId;
  divisionId: FoundryDivisionId;
  label: string;
  /** ACC section when avatar-facing; null for venue/blueprint-only. */
  accSectionId: AccWardrobeSectionId | "FACE" | "SKIN" | "HAIR" | "FACIAL_HAIR" | null;
  /** Logical destination catalog — resolve real routes from repo, never invent. */
  destinationCatalogId: string;
  firstClass: boolean;
};

export const FOUNDRY_DEPARTMENTS: readonly FoundryDepartmentDef[] = [
  // Anatomy
  { departmentId: "FACES_HEAD_SHAPES", divisionId: "AVATAR_CUSTOMIZATION", label: "Faces & Head Shapes", accSectionId: "FACE", destinationCatalogId: "ACC_FACE", firstClass: true },
  { departmentId: "FACIAL_FEATURES", divisionId: "AVATAR_CUSTOMIZATION", label: "Facial Features", accSectionId: "FACE", destinationCatalogId: "ACC_FACE", firstClass: true },
  { departmentId: "SKIN_MATERIALS", divisionId: "AVATAR_CUSTOMIZATION", label: "Skin Materials", accSectionId: "SKIN", destinationCatalogId: "ACC_SKIN", firstClass: true },
  { departmentId: "HAIRSTYLES", divisionId: "AVATAR_CUSTOMIZATION", label: "Hairstyles", accSectionId: "HAIR", destinationCatalogId: "ACC_HAIR", firstClass: true },
  { departmentId: "BEARDS_FACIAL_HAIR", divisionId: "AVATAR_CUSTOMIZATION", label: "Beards & Facial Hair", accSectionId: "FACIAL_HAIR", destinationCatalogId: "ACC_FACIAL_HAIR", firstClass: true },
  { departmentId: "GLOVES", divisionId: "AVATAR_CUSTOMIZATION", label: "Gloves", accSectionId: "ACCESSORIES", destinationCatalogId: "ACC_ACCESSORIES", firstClass: true },
  // Wardrobe 8
  { departmentId: "OUTFITS", divisionId: "AVATAR_CUSTOMIZATION", label: "Outfits & Costumes", accSectionId: "OUTFITS", destinationCatalogId: "ACC_OUTFITS", firstClass: true },
  { departmentId: "TOPS", divisionId: "AVATAR_CUSTOMIZATION", label: "Tops", accSectionId: "TOPS", destinationCatalogId: "ACC_TOPS", firstClass: true },
  { departmentId: "BOTTOMS", divisionId: "AVATAR_CUSTOMIZATION", label: "Bottoms", accSectionId: "BOTTOMS", destinationCatalogId: "ACC_BOTTOMS", firstClass: true },
  { departmentId: "SHOES", divisionId: "AVATAR_CUSTOMIZATION", label: "Shoes & Footwear", accSectionId: "SHOES", destinationCatalogId: "ACC_SHOES", firstClass: true },
  { departmentId: "HATS", divisionId: "AVATAR_CUSTOMIZATION", label: "Hats & Headwear", accSectionId: "HATS", destinationCatalogId: "ACC_HATS", firstClass: true },
  { departmentId: "ACCESSORIES", divisionId: "AVATAR_CUSTOMIZATION", label: "Accessories (chains, jewelry, glasses)", accSectionId: "ACCESSORIES", destinationCatalogId: "ACC_ACCESSORIES", firstClass: true },
  { departmentId: "MASKS", divisionId: "AVATAR_CUSTOMIZATION", label: "Masks", accSectionId: "MASKS", destinationCatalogId: "ACC_MASKS", firstClass: true },
  { departmentId: "PROPS", divisionId: "AVATAR_PERSONAL_PROPS", label: "Personal Props (static & animated)", accSectionId: "PROPS", destinationCatalogId: "ACC_PROPS", firstClass: true },
  // Venue
  { departmentId: "WALLS_PARTITIONS", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Walls & Partitions", accSectionId: null, destinationCatalogId: "VENUE_STRUCTURE", firstClass: true },
  { departmentId: "FLOORS_PLATFORMS", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Floors & Platforms", accSectionId: null, destinationCatalogId: "VENUE_STRUCTURE", firstClass: true },
  { departmentId: "CEILINGS_ROOFS", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Ceilings & Roofs", accSectionId: null, destinationCatalogId: "VENUE_STRUCTURE", firstClass: true },
  { departmentId: "DOORS_WINDOWS", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Doors & Windows", accSectionId: null, destinationCatalogId: "VENUE_STRUCTURE", firstClass: true },
  { departmentId: "STAIRS_ELEVATORS", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Stairs, Ramps & Elevators", accSectionId: null, destinationCatalogId: "VENUE_STRUCTURE", firstClass: true },
  { departmentId: "TERRAIN_LANDSCAPING", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Terrain & Landscaping", accSectionId: null, destinationCatalogId: "VENUE_OUTDOOR", firstClass: true },
  { departmentId: "INDOOR_ENVIRONMENTS", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Indoor Environments", accSectionId: null, destinationCatalogId: "VENUE_INDOOR", firstClass: true },
  { departmentId: "OUTDOOR_ENVIRONMENTS", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Outdoor Environments", accSectionId: null, destinationCatalogId: "VENUE_OUTDOOR", firstClass: true },
  { departmentId: "VENUE_SHELLS_STAGES", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Venue Shells, Stages & Arenas", accSectionId: null, destinationCatalogId: "VENUE_SHELL", firstClass: true },
  { departmentId: "FURNITURE_SEATING", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Furniture & Seating", accSectionId: null, destinationCatalogId: "VENUE_FURNITURE", firstClass: true },
  { departmentId: "DECOR_DISPLAYS", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Decor & Displays", accSectionId: null, destinationCatalogId: "VENUE_DECOR", firstClass: true },
  { departmentId: "LIGHTING_FX", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Lighting & FX", accSectionId: null, destinationCatalogId: "VENUE_LIGHTING", firstClass: true },
  { departmentId: "INTERACTIVE_WORLD_OBJECTS", divisionId: "VENUE_WORLD_CONSTRUCTION", label: "Interactive World Objects", accSectionId: null, destinationCatalogId: "VENUE_INTERACTIVE", firstClass: true },
  // Media equipment
  { departmentId: "JUKEBOXES_MUSIC_STATIONS", divisionId: "MEDIA_DISPLAYS_EQUIPMENT", label: "Jukeboxes & Music Stations", accSectionId: null, destinationCatalogId: "LOUNGE_EQUIPMENT", firstClass: true },
  { departmentId: "LOUNGE_VIDEO_PANELS", divisionId: "MEDIA_DISPLAYS_EQUIPMENT", label: "Lounge Video Panels", accSectionId: null, destinationCatalogId: "LOUNGE_VIDEO_PANEL", firstClass: true },
  { departmentId: "TELEVISIONS_MONITORS", divisionId: "MEDIA_DISPLAYS_EQUIPMENT", label: "Televisions & Monitors", accSectionId: null, destinationCatalogId: "VENUE_DISPLAY", firstClass: true },
  { departmentId: "COMMERCIAL_AD_SCREENS", divisionId: "MEDIA_DISPLAYS_EQUIPMENT", label: "Commercial & Advertising Screens", accSectionId: null, destinationCatalogId: "COMMERCIAL_DISPLAY", firstClass: true },
  { departmentId: "STAGE_SCREENS_JUMBOTRONS", divisionId: "MEDIA_DISPLAYS_EQUIPMENT", label: "Stage Screens & Jumbotrons", accSectionId: null, destinationCatalogId: "STAGE_EQUIPMENT", firstClass: true },
  // Knowledge
  { departmentId: "BLUEPRINT_LIBRARY", divisionId: "BLUEPRINT_REFERENCE_LIBRARY", label: "Blueprint & Reference Library", accSectionId: null, destinationCatalogId: "FOUNDRY_BLUEPRINT_LIBRARY", firstClass: true },
] as const;

export const ACC_WARDROBE_SECTIONS: readonly AccWardrobeSectionId[] = [
  "OUTFITS",
  "TOPS",
  "BOTTOMS",
  "SHOES",
  "HATS",
  "ACCESSORIES",
  "MASKS",
  "PROPS",
] as const;

export const FOOTWEAR_TYPES: readonly { id: FootwearTypeId; label: string }[] = [
  { id: "SNEAKERS_ATHLETIC", label: "Sneakers & Athletic" },
  { id: "BOOTS", label: "Boots" },
  { id: "DRESS_LOAFERS", label: "Dress Shoes & Loafers" },
  { id: "SANDALS_SLIDES", label: "Sandals & Slides" },
  { id: "HEELS", label: "Heels" },
  { id: "PLATFORMS", label: "Platforms" },
  { id: "SLIPPERS", label: "Slippers" },
  { id: "FUTURISTIC", label: "Futuristic" },
  { id: "COSTUME_FOOTWEAR", label: "Costume Footwear" },
  { id: "CUSTOM", label: "Custom Designs" },
] as const;

export function listDepartmentsByDivision(divisionId: FoundryDivisionId): FoundryDepartmentDef[] {
  return FOUNDRY_DEPARTMENTS.filter((d) => d.divisionId === divisionId);
}

export function getFoundryDepartment(id: FoundryDepartmentId): FoundryDepartmentDef {
  const d = FOUNDRY_DEPARTMENTS.find((x) => x.departmentId === id);
  if (!d) throw new Error(`Unknown Foundry department: ${id}`);
  return d;
}

export function shoesDepartment(): FoundryDepartmentDef {
  return getFoundryDepartment("SHOES");
}

export function propsDepartment(): FoundryDepartmentDef {
  return getFoundryDepartment("PROPS");
}
