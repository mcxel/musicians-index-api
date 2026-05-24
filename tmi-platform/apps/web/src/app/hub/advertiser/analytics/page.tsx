import { cookies } from 'next/headers';
import HubAnalyticsDashboard from '@/components/analytics/HubAnalyticsDashboard';
import type { SubscriptionTier } from '@/lib/analytics/TieredAnalyticsEngine';

export default function AdvertiserAnalyticsPage() {
  const tier = (cookies().get('tmi_tier')?.value?.toLowerCase() ?? 'free') as SubscriptionTier;
  return <HubAnalyticsDashboard context="advertiser" roleLabel="ADVERTISER ANALYTICS" tier={tier} />;
}
