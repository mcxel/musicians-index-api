import HubAnalyticsDashboard from '@/components/analytics/HubAnalyticsDashboard';
import HubWorkspaceClosed from '@/components/auth/HubWorkspaceClosed';
import { authorizeHubWorkspace } from '@/lib/auth/getTmiAuth';
import type { SubscriptionTier } from '@/lib/analytics/TieredAnalyticsEngine';

export const dynamic = 'force-dynamic';

export default async function FanAnalyticsPage() {
  const gate = await authorizeHubWorkspace('fan');
  if (!gate.access.allowed || gate.decision.outcome !== 'authenticated') {
    return (
      <HubWorkspaceClosed
        reason={!gate.access.allowed && gate.access.reason === 'unavailable' ? 'unavailable' : 'unauthenticated'}
        retryHref="/hub/fan/analytics"
      />
    );
  }
  const tier = (gate.decision.user.tier ?? 'FREE').toLowerCase() as SubscriptionTier;
  return <HubAnalyticsDashboard context="fan" roleLabel="FAN ANALYTICS" tier={tier} />;
}
