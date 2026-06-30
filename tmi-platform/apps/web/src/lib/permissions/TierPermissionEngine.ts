/**
 * TierPermissionEngine.ts
 *
 * Tier-Driven Permission System for TMI Platform
 * Single source of truth for which features unlock at which tier
 *
 * LOCKED BY: Marcel Dickels, 2026-06-29
 * Platform Law: Tier drives access. FREE tier is complete and usable.
 * Upgrades unlock convenience and exclusive features, not core functionality.
 */

import type { UserTier } from '@/lib/auth/UserStore';

export type Feature =
  // Performer features
  | 'performer_analytics'
  | 'advanced_streaming'
  | 'custom_stage_effects'
  | 'merchandise_store'
  | 'booking_requests'
  | 'fan_recognition'
  | 'exclusive_content'
  | 'sponsorship_dashboard'
  | 'vip_lounge_access'
  | 'world_tour_events'
  // Fan features
  | 'fan_follower_limit'
  | 'fan_playlist_limit'
  | 'fan_custom_avatar'
  | 'fan_vip_badge'
  | 'fan_exclusive_streams'
  | 'fan_priority_chat'
  | 'fan_early_access'
  | 'fan_fanclub_creation'
  // Shared features
  | 'hd_streaming'
  | 'no_ads'
  | 'custom_profile'
  | 'offline_mode';

/**
 * Tier-to-Features mapping (locked)
 *
 * FREE tier is complete — users can upload, go live, discover, attend,
 * send tips, chat, create content. Upgrades add convenience/exclusive content.
 */
export const TIER_FEATURES: Record<UserTier, Feature[]> = {
  FREE: [
    // Performer: core ability to broadcast
    'performer_analytics',
    // Fan: core ability to discover and attend
    'fan_follower_limit',
    'fan_playlist_limit',
  ],
  PRO: [
    'performer_analytics',
    'fan_follower_limit',
    'fan_playlist_limit',
    'custom_profile',
  ],
  RUBY: [
    'performer_analytics',
    'advanced_streaming',
    'custom_stage_effects',
    'fan_follower_limit',
    'fan_playlist_limit',
    'fan_custom_avatar',
    'custom_profile',
    'hd_streaming',
  ],
  SILVER: [
    'performer_analytics',
    'advanced_streaming',
    'custom_stage_effects',
    'merchandise_store',
    'booking_requests',
    'fan_follower_limit',
    'fan_playlist_limit',
    'fan_custom_avatar',
    'fan_vip_badge',
    'custom_profile',
    'hd_streaming',
    'offline_mode',
  ],
  GOLD: [
    'performer_analytics',
    'advanced_streaming',
    'custom_stage_effects',
    'merchandise_store',
    'booking_requests',
    'fan_recognition',
    'sponsorship_dashboard',
    'fan_follower_limit',
    'fan_playlist_limit',
    'fan_custom_avatar',
    'fan_vip_badge',
    'fan_exclusive_streams',
    'fan_priority_chat',
    'custom_profile',
    'hd_streaming',
    'no_ads',
    'offline_mode',
  ],
  PLATINUM: [
    'performer_analytics',
    'advanced_streaming',
    'custom_stage_effects',
    'merchandise_store',
    'booking_requests',
    'fan_recognition',
    'exclusive_content',
    'sponsorship_dashboard',
    'vip_lounge_access',
    'fan_follower_limit',
    'fan_playlist_limit',
    'fan_custom_avatar',
    'fan_vip_badge',
    'fan_exclusive_streams',
    'fan_priority_chat',
    'fan_early_access',
    'fan_fanclub_creation',
    'custom_profile',
    'hd_streaming',
    'no_ads',
    'offline_mode',
  ],
  DIAMOND: [
    'performer_analytics',
    'advanced_streaming',
    'custom_stage_effects',
    'merchandise_store',
    'booking_requests',
    'fan_recognition',
    'exclusive_content',
    'sponsorship_dashboard',
    'vip_lounge_access',
    'world_tour_events',
    'fan_follower_limit',
    'fan_playlist_limit',
    'fan_custom_avatar',
    'fan_vip_badge',
    'fan_exclusive_streams',
    'fan_priority_chat',
    'fan_early_access',
    'fan_fanclub_creation',
    'custom_profile',
    'hd_streaming',
    'no_ads',
    'offline_mode',
  ],
  ADMIN: [
    // Admins have all features
    'performer_analytics',
    'advanced_streaming',
    'custom_stage_effects',
    'merchandise_store',
    'booking_requests',
    'fan_recognition',
    'exclusive_content',
    'sponsorship_dashboard',
    'vip_lounge_access',
    'world_tour_events',
    'fan_follower_limit',
    'fan_playlist_limit',
    'fan_custom_avatar',
    'fan_vip_badge',
    'fan_exclusive_streams',
    'fan_priority_chat',
    'fan_early_access',
    'fan_fanclub_creation',
    'custom_profile',
    'hd_streaming',
    'no_ads',
    'offline_mode',
  ],
};

/**
 * Tier pricing (locked) — for display and upgrade CTAs
 */
export const TIER_PRICING: Record<Exclude<UserTier, 'FREE' | 'ADMIN'>, { monthly: number; displayName: string }> = {
  PRO: { monthly: 0, displayName: 'Pro' },
  RUBY: { monthly: 199, displayName: 'Ruby' },
  SILVER: { monthly: 499, displayName: 'Silver' },
  GOLD: { monthly: 999, displayName: 'Gold' },
  PLATINUM: { monthly: 1999, displayName: 'Platinum' },
  DIAMOND: { monthly: 4999, displayName: 'Diamond' },
};

/**
 * Check if a tier has a specific feature
 */
export function hasTierFeature(tier: UserTier, feature: Feature): boolean {
  const features = TIER_FEATURES[tier] || [];
  return features.includes(feature);
}

/**
 * Get all features for a tier
 */
export function getTierFeatures(tier: UserTier): Feature[] {
  return TIER_FEATURES[tier] || [];
}

/**
 * Get the tier required for a feature (returns lowest tier that unlocks it)
 */
export function getTierForFeature(feature: Feature): UserTier | null {
  const tiers: UserTier[] = ['FREE', 'PRO', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  for (const tier of tiers) {
    if (hasTierFeature(tier, feature)) {
      return tier;
    }
  }
  return null;
}

/**
 * Get upgrade messaging for a feature based on current tier
 */
export function getUpgradeMessage(currentTier: UserTier, requiredFeature: Feature): { tier: UserTier; price: number; message: string } | null {
  const requiredTier = getTierForFeature(requiredFeature);
  if (!requiredTier || requiredTier === 'ADMIN') return null;

  if (hasTierFeature(currentTier, requiredFeature)) {
    // Already has feature
    return null;
  }

  const tierInfo = TIER_PRICING[requiredTier as Exclude<UserTier, 'FREE' | 'ADMIN'>];
  if (!tierInfo) return null;

  const priceDisplay = tierInfo.monthly === 0 ? 'Free' : `$${(tierInfo.monthly / 100).toFixed(2)}/month`;
  return {
    tier: requiredTier,
    price: tierInfo.monthly,
    message: `Unlock this feature with ${tierInfo.displayName}. Upgrade starting at ${priceDisplay}.`,
  };
}

/**
 * Get entry-level upgrade messaging for performers and fans
 */
export function getEntryLevelUpgradeMessage(role: 'performer' | 'fan'): { tier: UserTier; price: number; message: string } {
  const tier = role === 'performer' ? 'RUBY' : 'SILVER';
  const tierInfo = TIER_PRICING[tier as Exclude<UserTier, 'FREE' | 'ADMIN'>];
  const priceDisplay = `$${(tierInfo.monthly / 100).toFixed(2)}/month`;

  if (role === 'performer') {
    return {
      tier,
      price: tierInfo.monthly,
      message: `Upgrade your stage. Plans starting at just ${priceDisplay}.`,
    };
  } else {
    return {
      tier,
      price: tierInfo.monthly,
      message: `Get closer to your favorite performers. Upgrades starting at just ${priceDisplay}.`,
    };
  }
}

/**
 * Get all available tiers for upgrade (excluding current and ADMIN)
 */
export function getAvailableUpgradeTiers(currentTier: UserTier): (Exclude<UserTier, 'FREE' | 'ADMIN'>)[] {
  const order: (Exclude<UserTier, 'FREE' | 'ADMIN'>)[] = ['PRO', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const tiers: (Exclude<UserTier, 'FREE' | 'ADMIN'>)[] = ['PRO', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

  if (currentTier === 'ADMIN') return [];

  const currentIndex = order.indexOf(currentTier as any);
  if (currentIndex === -1) {
    // Current tier is FREE or unknown, show all
    return tiers;
  }

  // Return all tiers above current
  return tiers.filter((_, idx) => idx > currentIndex);
}
