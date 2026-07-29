/**
 * CollectionRegistry — preset + kind catalog for the Collections Engine (media).
 *
 * Pages/UI consume this registry for Collection labels. Persistence stays on
 * MemoryAlbum / MemoryCollectible. Does not invent album rows or fake media.
 *
 * NOT for belts/trophies — those live in achievementCollectibleContracts.
 */

import type { CollectionPresetKey, MediaAssetKind } from "./collectionsContracts";
import { DEFAULT_COLLECTION_PRESET, DEFAULT_COLLECTION_TITLE } from "./collectionsContracts";
import { MEMORY_COLLECTIBLE_KINDS } from "./collectiblesContracts";

export interface CollectionPresetDefinition {
  key: CollectionPresetKey;
  title: string;
  /** Short product copy — never used as fake inventory */
  description: string;
}

export const COLLECTION_PRESET_REGISTRY: readonly CollectionPresetDefinition[] = [
  {
    key: "ALL_MEMORIES",
    title: DEFAULT_COLLECTION_TITLE,
    description: "Default Collection — every saved memory lands here unless filed elsewhere.",
  },
  {
    key: "FAMILY",
    title: "Family",
    description: "Personal / family moments.",
  },
  {
    key: "STUDIO",
    title: "Studio",
    description: "Studio sessions and behind-the-scenes stills.",
  },
  {
    key: "CONCERTS",
    title: "Concerts",
    description: "Concert and live-show memories.",
  },
  {
    key: "MONTHLY_IDOL",
    title: "Monthly Idol",
    description: "Monthly Idol event media keepsakes.",
  },
  {
    key: "WDP",
    title: "World Dance Party",
    description: "World Dance Party moments.",
  },
  {
    key: "BATTLES",
    title: "Battles",
    description: "Battle-room photos and clips — media only, not win trophies.",
  },
  {
    key: "VIP",
    title: "VIP",
    description: "VIP / backstage media keepsakes.",
  },
  {
    key: "ROAD_TRIPS",
    title: "Road Trips",
    description: "Tour and travel memories.",
  },
  {
    key: "CUSTOM",
    title: "Custom",
    description: "User-named Collection.",
  },
] as const;

export const MEDIA_ASSET_KINDS: readonly MediaAssetKind[] = MEMORY_COLLECTIBLE_KINDS;

export function getCollectionPreset(
  key: string | undefined | null,
): CollectionPresetDefinition | undefined {
  if (!key) return undefined;
  return COLLECTION_PRESET_REGISTRY.find((p) => p.key === key);
}

export function getDefaultCollectionPreset(): CollectionPresetDefinition {
  return (
    COLLECTION_PRESET_REGISTRY.find((p) => p.key === DEFAULT_COLLECTION_PRESET) ??
    COLLECTION_PRESET_REGISTRY[0]
  );
}

/**
 * Profile Collections hub tabs (follow-on UI).
 * Media tab = this engine. Achievements / Analytics are parallel systems.
 */
export const COLLECTIONS_HUB_TABS = [
  { id: "media", label: "Collections", system: "MEDIA" as const },
  { id: "achievements", label: "Achievements", system: "PROGRESSION" as const },
  { id: "analytics", label: "Analytics", system: "STATS" as const },
] as const;
