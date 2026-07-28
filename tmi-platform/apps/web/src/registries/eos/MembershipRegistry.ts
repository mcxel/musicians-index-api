/**
 * MembershipRegistry — bridges account tier → cosmetic/skin unlocks (Phase 2).
 * Single source for dashboard + dock tier-gated features (Rule 8 registry-first).
 */

import {
  SKIN_REGISTRY,
  canEquipSkin,
  type ArtifactSkinId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import {
  getSkinsForMembership,
  type MembershipTier,
  type VenueSkin,
} from "@/registries/venues/VenueSkinRegistry";

export type { MembershipTier };

export const MEMBERSHIP_TIER_ORDER: MembershipTier[] = [
  "FREE",
  "PRO",
  "RUBY",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
];

const TIER_RANK: Record<MembershipTier, number> = {
  FREE: 0,
  PRO: 1,
  RUBY: 2,
  SILVER: 3,
  GOLD: 4,
  PLATINUM: 5,
  DIAMOND: 6,
};

/** Normalize session/API tier strings to canonical MembershipTier. */
export function normalizeMembershipTier(raw: string | undefined | null): MembershipTier {
  const upper = (raw ?? "FREE").toUpperCase();
  if (upper in TIER_RANK) return upper as MembershipTier;
  return "FREE";
}

export function isTierAtLeast(
  userTier: MembershipTier,
  required: MembershipTier
): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required];
}

/** Playlist artifact skins unlocked at this tier (free + tier-reward). */
export function getUnlockedPlaylistSkins(
  tier: MembershipTier,
  ownedSkinIds: ArtifactSkinId[] = []
): ArtifactSkinId[] {
  return (Object.keys(SKIN_REGISTRY) as ArtifactSkinId[]).filter((skinId) =>
    canEquipSkin(skinId, tier, ownedSkinIds)
  );
}

/** Venue skins accessible at this membership tier. */
export function getUnlockedVenueSkins(tier: MembershipTier): VenueSkin[] {
  return getSkinsForMembership(tier);
}

export interface MembershipUnlockSummary {
  tier: MembershipTier;
  playlistSkins: ArtifactSkinId[];
  venueSkinCount: number;
  nextTier: MembershipTier | null;
  nextTierPlaylistUnlocks: string[];
}

/** Dashboard-facing summary for tier badge + unlock preview. */
export function getMembershipUnlockSummary(
  rawTier: string | undefined | null,
  ownedSkinIds: ArtifactSkinId[] = []
): MembershipUnlockSummary {
  const tier = normalizeMembershipTier(rawTier);
  const idx = MEMBERSHIP_TIER_ORDER.indexOf(tier);
  const nextTier = idx < MEMBERSHIP_TIER_ORDER.length - 1
    ? MEMBERSHIP_TIER_ORDER[idx + 1]!
    : null;

  const nextTierPlaylistUnlocks = nextTier
    ? (Object.entries(SKIN_REGISTRY) as [ArtifactSkinId, (typeof SKIN_REGISTRY)[ArtifactSkinId]][])
        .filter(([, skin]) => skin.unlockMethod === "tier" && skin.tierRequired === nextTier)
        .map(([, skin]) => skin.label)
    : [];

  return {
    tier,
    playlistSkins: getUnlockedPlaylistSkins(tier, ownedSkinIds),
    venueSkinCount: getUnlockedVenueSkins(tier).length,
    nextTier,
    nextTierPlaylistUnlocks,
  };
}
