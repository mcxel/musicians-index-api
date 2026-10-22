import HubAnalyticsDashboard from '@/components/analytics/HubAnalyticsDashboard';
import HubWorkspaceClosed from '@/components/auth/HubWorkspaceClosed';
import { authorizeHubWorkspace } from '@/lib/auth/getTmiAuth';
import type { SubscriptionTier } from '@/lib/analytics/TieredAnalyticsEngine';

export const dynamic = 'force-dynamic';

export default async function PerformerAnalyticsPage() {
  const gate = await authorizeHubWorkspace('performer');
  if (!gate.access.allowed || gate.decision.outcome !== 'authenticated') {
    return (
      <HubWorkspaceClosed
        reason={!gate.access.allowed && gate.access.reason === 'unavailable' ? 'unavailable' : 'unauthenticated'}
        retryHref="/hub/performer/analytics"
      />
    );
  }
  const tier = (gate.decision.user.tier ?? 'FREE').toLowerCase() as SubscriptionTier;
  return <HubAnalyticsDashboard context="artist" roleLabel="PERFORMER ANALYTICS" tier={tier} />;
}
