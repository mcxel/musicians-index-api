import { TMI_3D_ASSET_BLUEPRINTS, type Tmi3DAssetBlueprint, type Tmi3DAssetType } from "./tmi3DAssetBlueprints";
import { getLightingPreset, type TmiLightingPresetId } from "./tmiLightingPresets";

export type BuiltTmiProp = {
  blueprintId: string;
  type: Tmi3DAssetType;
  meshProfile: string;
  materials: string[];
  animationTracks: string[];
  lightingPreset: TmiLightingPresetId;
  routeUse: string[];
};

function pickLightingPreset(type: Tmi3DAssetType): TmiLightingPresetId {
  if (type === "stage" || type === "venue" || type === "spotlight") return "venue-concert-prime";
  if (type === "billboard" || type === "screen" || type === "booth") return "monitor-glow-control";
  if (type === "seat" || type === "crowd-section") return "arena-neon-night";
  return "magazine-hero-gloss";
}

export function buildTmiProp(blueprint: Tmi3DAssetBlueprint): BuiltTmiProp {
  const lightingPreset = pickLightingPreset(blueprint.type);
  const resolvedLighting = getLightingPreset(lightingPreset);

  return {
    blueprintId: blueprint.id,
    type: blueprint.type,
    meshProfile: blueprint.geometry,
    materials: blueprint.materials,
    animationTracks: [...blueprint.animation, `light-${resolvedLighting.id}`],
    lightingPreset,
    routeUse: blueprint.routeUse,
  };
}

export function buildPropsByType(type: Tmi3DAssetType): BuiltTmiProp[] {
  return TMI_3D_ASSET_BLUEPRINTS.filter((bp) => bp.type === type).map(buildTmiProp);
}

export function buildAllKnownTmiProps(): BuiltTmiProp[] {
  return TMI_3D_ASSET_BLUEPRINTS.map(buildTmiProp);
}
