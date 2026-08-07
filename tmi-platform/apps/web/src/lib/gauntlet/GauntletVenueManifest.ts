/**
 * GauntletVenueManifest — outdoor venue skins for Musical Gauntlet.
 * Consumed by UniversalVenueRenderer (Rule 21 one venue runtime, mode/skin swap).
 */

export type GauntletVenueSkinId =
  | "gauntlet-amphitheater"
  | "gauntlet-stadium"
  | "gauntlet-festival"
  | "gauntlet-rooftop"
  | "gauntlet-park-bowl";

export type GauntletVenueSkin = {
  id: GauntletVenueSkinId;
  label: string;
  description: string;
  /** Maps into AudienceScene / UniversalVenueRenderer venueIndex where applicable. */
  venueIndex: number;
  lightingPreset: "SUNSET" | "NEON" | "WARM_STAGE" | "STROBE";
  outdoor: true;
  atmosphere: string;
};

export const GAUNTLET_VENUE_SKINS: Record<GauntletVenueSkinId, GauntletVenueSkin> = {
  "gauntlet-amphitheater": {
    id: "gauntlet-amphitheater",
    label: "Neon Amphitheater",
    description: "Open-air stone bowl under cyan skyline glow.",
    venueIndex: 2,
    lightingPreset: "SUNSET",
    outdoor: true,
    atmosphere: "amphitheater",
  },
  "gauntlet-stadium": {
    id: "gauntlet-stadium",
    label: "Night Stadium",
    description: "Floodlit outdoor stadium for peak gauntlet rounds.",
    venueIndex: 0,
    lightingPreset: "STROBE",
    outdoor: true,
    atmosphere: "stadium",
  },
  "gauntlet-festival": {
    id: "gauntlet-festival",
    label: "Festival Grounds",
    description: "Multi-stage festival field with jumbotron spine.",
    venueIndex: 3,
    lightingPreset: "NEON",
    outdoor: true,
    atmosphere: "festival",
  },
  "gauntlet-rooftop": {
    id: "gauntlet-rooftop",
    label: "Skyline Rooftop",
    description: "Vice-city rooftop bowl overlooking the district.",
    venueIndex: 1,
    lightingPreset: "NEON",
    outdoor: true,
    atmosphere: "rooftop",
  },
  "gauntlet-park-bowl": {
    id: "gauntlet-park-bowl",
    label: "Park Bowl",
    description: "Grass amphitheater for continuous afternoon runs.",
    venueIndex: 4,
    lightingPreset: "WARM_STAGE",
    outdoor: true,
    atmosphere: "park",
  },
};

export function getGauntletVenueSkin(id: GauntletVenueSkinId): GauntletVenueSkin {
  return GAUNTLET_VENUE_SKINS[id] ?? GAUNTLET_VENUE_SKINS["gauntlet-amphitheater"];
}

export function getDefaultGauntletVenueSkin(): GauntletVenueSkin {
  return GAUNTLET_VENUE_SKINS["gauntlet-amphitheater"];
}

export function listGauntletVenueSkins(): GauntletVenueSkin[] {
  return Object.values(GAUNTLET_VENUE_SKINS);
}
