'use client';

/**
 * useTierPermission.ts
 *
 * React hook for tier-based feature access
 * Used by components to check if a feature is unlocked for current user
 */

import { useEffect, useState } from 'react';
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
  /** True until the real session tier has been fetched — callers should
   *  avoid rendering a hard gate/paywall off `hasAccess` while this is true
   *  (mirrors RoleGate.tsx's 'loading' convention) to avoid flashing the
   *  wrong state before the real tier is known. */
  loading: boolean;
}

/**
 * Real session tier — this app's auth is cookie-based (tmi_role/tmi_tier),
 * not next-auth, so this fetches the same /api/auth/session route RoleGate
 * uses for role, rather than a next-auth useSession() that always returns
 * an empty session here (no SessionProvider is mounted in the app).
 */
function useSessionTier(): { tier: UserTier; loading: boolean } {
  const [tier, setTier] = useState<UserTier>('FREE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json())
      .then((d: { user?: { tier?: UserTier }; tier?: UserTier }) => {
        if (!active) return;
        setTier((d.user?.tier ?? d.tier ?? 'FREE') as UserTier);
      })
      .catch(() => {
        if (active) setTier('FREE');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { tier, loading };
}

/**
 * Check if current user has access to a feature
 * Returns upgrade messaging if they don't
 */
export function useTierPermission(feature: Feature): TierPermissionCheck {
  const { tier, loading } = useSessionTier();

  const hasAccess = hasTierFeature(tier, feature);
  const upgradeMessage = hasAccess ? null : getUpgradeMessage(tier, feature);

  return {
    hasAccess,
    currentTier: tier,
    upgradeMessage,
    loading,
  };
}

/**
 * Get current user's tier
 */
export function useUserTier(): UserTier | null {
  const { tier, loading } = useSessionTier();
  return loading ? null : tier;
}
