import { cookies } from 'next/headers';
import HubAnalyticsDashboard from '@/components/analytics/HubAnalyticsDashboard';
import type { SubscriptionTier } from '@/lib/analytics/TieredAnalyticsEngine';

export default function FanAnalyticsPage() {
  const tier = (cookies().get('tmi_tier')?.value?.toLowerCase() ?? 'free') as SubscriptionTier;
  return <HubAnalyticsDashboard context="fan" roleLabel="FAN ANALYTICS" tier={tier} />;
}
