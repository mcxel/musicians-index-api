import AdminOpsConsole, { type AdminOpsMetric, type AdminOpsRow } from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';
import AdminVisualCommandSummaryCard from '@/components/admin/AdminVisualCommandSummaryCard';
import AdminVideoObservatorySummaryCard from '@/components/admin/AdminVideoObservatorySummaryCard';
import AdminBotGovernanceSummaryCard from '@/components/admin/AdminBotGovernanceSummaryCard';
import { getHealthSummary } from '@/lib/bots/BotActivationEngine';
import { getStripeIncidentStatus, isStripePayoutQueuePaused } from '@/lib/stripe/stripe-incident-engine';

// Rule 20 (Visual Honesty): this page previously hardcoded fake precision
// percentages (99.98% route health, $41.2k/day, etc.) with no real source.
// Only show a metric when a real engine backs it — route/queue/visual/motion/
// auth telemetry don't exist yet, so they show an honest "not wired" state
// instead of a fabricated number.
function buildOperationsData(): { metrics: AdminOpsMetric[]; rows: AdminOpsRow[] } {
  const botHealth = getHealthSummary();
  const stripeStatus = getStripeIncidentStatus();
  const payoutPaused = isStripePayoutQueuePaused();
  const botHealthPct = botHealth.total > 0 ? Math.round((botHealth.healthy / botHealth.total) * 100) : null;

  const metrics: AdminOpsMetric[] = [
    { label: 'Route Health', value: 'Not wired', tone: 'white' },
    { label: 'Queue Health', value: 'Not wired', tone: 'white' },
    { label: 'Bot Health', value: botHealthPct !== null ? `${botHealthPct}%` : 'No bots active', tone: botHealthPct === null ? 'white' : botHealthPct >= 90 ? 'green' : 'yellow' },
    { label: 'Visual Health', value: 'Not wired', tone: 'white' },
    { label: 'Motion Health', value: 'Not wired', tone: 'white' },
    { label: 'Auth Health', value: 'Not wired', tone: 'white' },
    { label: 'Payment Health', value: payoutPaused ? 'Payouts paused' : `${stripeStatus.recentIncidents.length} recent incidents`, tone: payoutPaused ? 'red' : stripeStatus.recentIncidents.length > 0 ? 'yellow' : 'green' },
  ];

  const rows: AdminOpsRow[] = [
    { primary: 'Route Cluster A', secondary: 'public + account + artist', status: 'no telemetry', value: '—', chips: ['routes', 'sockets'] },
    { primary: 'Queue Fabric', secondary: 'ticketing + booking + support', status: 'no telemetry', value: '—', chips: ['queues', 'fallback'] },
    { primary: 'Auth Authority', secondary: 'session + token + role checks', status: 'no telemetry', value: '—', chips: ['auth', 'device trust'] },
    { primary: 'Payment Rail', secondary: 'subscriptions + tips + ads', status: payoutPaused ? 'paused' : 'stable', value: payoutPaused ? 'Paused' : 'Active', chips: ['payments', 'webhooks'] },
    { primary: 'Bot Runtime', secondary: 'social + concierge + moderation', status: botHealth.active > 0 ? 'stable' : 'idle', value: `${botHealth.active} active`, chips: ['bots', 'behavior'] },
  ];

  return { metrics, rows };
}

export default function AdminOperationsPage() {
  const { metrics, rows } = buildOperationsData();
  return (
    <>
      <div style={{ padding: '16px 16px 0', display: 'grid', gap: 12 }}>
        <AdminBotGovernanceSummaryCard />
        <AdminVisualCommandSummaryCard />
        <AdminVideoObservatorySummaryCard />
      </div>
      <AdminOpsConsole
        title="Administrator Operations"
        subtitle="Departmental governance command for routes, queues, bots, visuals, motion, auth, and payments."
        metrics={metrics}
        rowsTitle="Operational Surfaces"
        rows={rows}
        actions={commonAdminActions}
        quickLinks={adminOpsLinks}
      />
    </>
  );
}
