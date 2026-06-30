'use client';

/**
 * useTierPermission.ts
 *
 * React hook for tier-based feature access
 * Used by components to check if a feature is unlocked for current user
 */

import { useSession } from 'next-auth/react';
import {
  hasTierFeature,
  getUpgradeMessage,
  type Feature,
} from './TierPermissionEngine';
import type { UserTier } from '@/lib/auth/UserStore';

export interface TierPermissionCheck {
  hasAccess: boolean;
  currentTier: UserTier | null;
  upgradeMessage: { tier: UserTier; price: number; message: string } | null;
}

/**
 * Check if current user has access to a feature
 * Returns upgrade messaging if they don't
 */
export function useTierPermission(feature: Feature): TierPermissionCheck {
  const session = useSession();

  // Not logged in — return FREE tier access
  if (!session.data?.user) {
    const hasFreeAccess = hasTierFeature('FREE', feature);
    return {
      hasAccess: hasFreeAccess,
      currentTier: 'FREE',
      upgradeMessage: null,
    };
  }

  // Get user tier from session
  const userTier = (session.data.user as { tier?: UserTier }).tier ?? 'FREE';

  // Check if user has access
  const hasAccess = hasTierFeature(userTier as UserTier, feature);

  // If no access, get upgrade message
  const upgradeMessage = hasAccess
    ? null
    : getUpgradeMessage(userTier as UserTier, feature);

  return {
    hasAccess,
    currentTier: userTier as UserTier,
    upgradeMessage,
  };
}

/**
 * Get current user's tier
 */
export function useUserTier(): UserTier | null {
  const session = useSession();
  if (!session.data?.user) return 'FREE';
  return (session.data.user as { tier?: UserTier }).tier ?? 'FREE';
}
