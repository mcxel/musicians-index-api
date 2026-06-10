import type { SubscriptionTier } from '@/components/monitor/types';

export const SUBSCRIPTION_MONITOR_LIMITS: Record<SubscriptionTier, number> = {
  FREE: 1,
  PRO: 3,
  BRONZE: 5,
  SILVER: 8,
  GOLD: 12,
  PLATINUM: 20,
  DIAMOND: Number.MAX_SAFE_INTEGER,
};

export function canOpenMonitorForTier(tier: SubscriptionTier, activeCount: number): boolean {
  return activeCount < SUBSCRIPTION_MONITOR_LIMITS[tier];
}
