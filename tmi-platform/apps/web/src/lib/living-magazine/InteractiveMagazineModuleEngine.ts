// InteractiveMagazineModuleEngine
// Every spread contains interactive modules — not static article pages.
// Supports: live video, audio, polls, votes, comments, reactions, ticket cards, merch, etc.

import type { MagazineModule, MagazineModuleType } from "./types";

const INTERACTIVE_MODULE_TYPES: MagazineModuleType[] = [
  "article", "video", "audio", "interview", "comic-strip", "poll",
  "ticket-card", "merch-card", "beat-player", "nft-card",
  "sponsor-card", "ad-slot", "venue-promo", "battle-replay",
  "cypher-replay", "live-room-join", "fan-thread", "artist-discovery",
  "ranking-rail", "countdown",
];

// Rules for which module types can appear in which slot types
const SLOT_MODULE_RULES: Record<string, MagazineModuleType[]> = {
  editorial:      ["article", "video", "interview", "audio", "comic-strip", "poll", "fan-thread"],
  discovery:      ["artist-discovery", "ranking-rail", "article", "video"],
  "sponsored-boost": ["sponsor-card", "ad-slot", "ticket-card", "merch-card", "nft-card"],
  "battle-recap": ["battle-replay", "article", "ranking-rail", "video"],
  "venue-promo":  ["venue-promo", "ticket-card", "live-room-join", "ad-slot"],
  wildcard:       [...INTERACTIVE_MODULE_TYPES],
};

export function createModule(
  id: string,
  type: MagazineModuleType,
  options: Partial<MagazineModule> = {},
): MagazineModule {
  return {
    id,
    type,
    accentColor: "#00FFFF",
    interactive: true,
    monetized: ["sponsor-card", "ad-slot", "ticket-card", "merch-card", "nft-card", "beat-player"].includes(type),
    ...options,
  };
}

export function getAllowedModulesForSlot(slotType: string): MagazineModuleType[] {
  return SLOT_MODULE_RULES[slotType] ?? INTERACTIVE_MODULE_TYPES;
}

export function isInteractive(module: MagazineModule): boolean {
  return module.interactive;
}

export function isMonetized(module: MagazineModule): boolean {
  return module.monetized;
}

// Validates a module list for a spread — ensures at least 1 interactive module per spread
export function validateSpreadModules(modules: MagazineModule[]): boolean {
  return modules.some(m => m.interactive);
}
