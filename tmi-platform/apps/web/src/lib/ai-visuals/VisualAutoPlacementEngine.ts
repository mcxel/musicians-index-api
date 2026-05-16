import { deployAsset } from "./VisualDeploymentEngine";
import { getSlot } from "./VisualSlotRegistry";

export type PlacementOwnerSurface =
  | "homepage-hero"
  | "magazine-cover"
  | "artist-profile"
  | "venue-background"
  | "battle-poster"
  | "ticket-slot"
  | "billboard-slot";

export type PlacementOwnershipRule = {
  slotId: string;
  ownerSurface: PlacementOwnerSurface;
  ownerSystem: string;
};

const rules = new Map<string, PlacementOwnershipRule>();

export function registerPlacementRule(rule: PlacementOwnershipRule): PlacementOwnershipRule {
  rules.set(rule.slotId, rule);
  return rule;
}

export function getPlacementRule(slotId: string): PlacementOwnershipRule | null {
  return rules.get(slotId) ?? null;
}

export function autoPlaceAsset(slotId: string, assetId: string): { placed: boolean; reason?: string } {
  const slot = getSlot(slotId);
  if (!slot) return { placed: false, reason: "slot-not-found" };

  const rule = getPlacementRule(slotId);
  if (!rule) return { placed: false, reason: "ownership-rule-missing" };

  if (slot.owner !== rule.ownerSystem) {
    return { placed: false, reason: "owner-mismatch" };
  }

  const deployed = deployAsset(slotId, assetId);
  if (!deployed) return { placed: false, reason: "deploy-failed" };

  return { placed: true };
}
