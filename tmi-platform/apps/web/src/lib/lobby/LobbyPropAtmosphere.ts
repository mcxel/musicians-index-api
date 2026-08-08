/**
 * Prop → room atmosphere for 3D Avatar Runtime v0.
 * Visible CSS ambient wash when holdables are used — no certified GLB required.
 */

import { getFanCosmetic } from "@/lib/avatars/FanCosmeticCatalog";
import { getLobbyPropDef } from "@/lib/lobby/LobbyPropRegistry";

export type PropAtmosphere = {
  propId: string;
  ambientScale: number;
  glowColor: string;
  washOpacity: number;
  label: string;
};

export function atmosphereForProp(propId: string | null | undefined): PropAtmosphere | null {
  if (!propId || propId === "none") return null;
  const cosmetic = getFanCosmetic(propId);
  if (cosmetic?.ambientDelta != null) {
    return {
      propId,
      ambientScale: 1 + cosmetic.ambientDelta,
      glowColor: cosmetic.accent,
      washOpacity: Math.min(0.4, 0.12 + Math.abs(cosmetic.ambientDelta) * 0.55),
      label: cosmetic.label,
    };
  }
  const def = getLobbyPropDef(propId);
  if (!def || def.effect !== "hold") return null;
  return {
    propId,
    ambientScale: 1.12,
    glowColor: def.accent,
    washOpacity: 0.14,
    label: def.label,
  };
}

export function mergePropAtmospheres(propIds: string[]): PropAtmosphere | null {
  const effects = propIds
    .map((id) => atmosphereForProp(id))
    .filter((e): e is PropAtmosphere => Boolean(e));
  if (effects.length === 0) return null;
  const ambientScale = effects.reduce((sum, e) => sum + e.ambientScale, 0) / effects.length;
  const strongest = effects.reduce((a, b) => (b.washOpacity > a.washOpacity ? b : a));
  return {
    propId: strongest.propId,
    ambientScale,
    glowColor: strongest.glowColor,
    washOpacity: Math.min(0.48, strongest.washOpacity + (effects.length - 1) * 0.04),
    label: strongest.label,
  };
}
