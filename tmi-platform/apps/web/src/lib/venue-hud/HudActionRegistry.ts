/**
 * Chevron Action Registry & Entitlement Filtering Engine.
 *
 * Rules:
 *   1. Permanent HUD stays compact.
 *   2. Tapping chevron triggers [ ⋯ ] / [ › ] / [ ⌃ ] expands registered action trays.
 *   3. Filters owned items and capability entitlements before rendering.
 */

import { resolveHudCapabilities, type UserRoleCapability } from "./TMIExperienceHudRuntime";

export type HudActionCategory =
  | "reaction"
  | "emote"
  | "dance"
  | "social"
  | "show"
  | "cosmetic";

export interface RegisteredHudAction {
  id: string;
  label: string;
  icon: string;
  category: HudActionCategory;
  requiredRole?: UserRoleCapability;
  skuId?: string;
  unlockRequirement?: string;
}

const registeredActions = new Map<string, RegisteredHudAction>();

// Populate canonical default items
const DEFAULT_ACTIONS: RegisteredHudAction[] = [
  { id: "act-fire", label: "Fire", icon: "🔥", category: "reaction" },
  { id: "act-heart", label: "Heart", icon: "❤️", category: "reaction" },
  { id: "act-clap", label: "Clap", icon: "👏", category: "reaction" },
  { id: "act-diamond", label: "Diamond Glow", icon: "💎", category: "reaction", skuId: "cosmetic-diamond-glow" },
  { id: "act-crown", label: "Prestige Crown", icon: "👑", category: "reaction", skuId: "cosmetic-crown" },
  { id: "act-dance-spin", label: "Spin Dance", icon: "💃", category: "dance", skuId: "emote-spin-dance" },
  { id: "act-dance-break", label: "Breakdance", icon: "🕺", category: "dance", skuId: "emote-break-dance" },
  { id: "act-cheer", label: "Audience Cheer", icon: "🙌", category: "emote" },
  { id: "act-laugh", label: "Laugh", icon: "😂", category: "emote" },
  { id: "act-support-vote", label: "Support Vote", icon: "🗳️", category: "show", requiredRole: "fan" },
  { id: "act-collect-card", label: "Collect Card", icon: "🎴", category: "social", requiredRole: "fan" },
  { id: "act-cue-next", label: "Next Cue", icon: "⏭️", category: "show", requiredRole: "performer" },
];

DEFAULT_ACTIONS.forEach((a) => registeredActions.set(a.id, a));

export function registerHudAction(action: RegisteredHudAction): () => void {
  registeredActions.set(action.id, action);
  return () => {
    registeredActions.delete(action.id);
  };
}

export function getAllRegisteredHudActions(): RegisteredHudAction[] {
  return Array.from(registeredActions.values());
}

export function filterActionsForUser(
  role: UserRoleCapability,
  ownedSkus: Set<string> = new Set(["cosmetic-diamond-glow", "emote-spin-dance"]),
  category?: HudActionCategory,
): RegisteredHudAction[] {
  const caps = resolveHudCapabilities(role);
  return Array.from(registeredActions.values()).filter((act) => {
    if (category && act.category !== category) return false;

    if (act.requiredRole) {
      if (act.requiredRole === "fan" && role !== "fan") return false;
      if (act.requiredRole === "performer" && role !== "performer" && role !== "admin") return false;
    }

    if (act.skuId && !ownedSkus.has(act.skuId)) {
      return false;
    }

    return true;
  });
}
