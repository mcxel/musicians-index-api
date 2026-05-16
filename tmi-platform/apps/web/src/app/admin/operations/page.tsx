import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';
import AdminVisualCommandSummaryCard from '@/components/admin/AdminVisualCommandSummaryCard';
import AdminVideoObservatorySummaryCard from '@/components/admin/AdminVideoObservatorySummaryCard';
import AdminBotGovernanceSummaryCard from '@/components/admin/AdminBotGovernanceSummaryCard';

const metrics = [
  { label: 'Route Health', value: '99.98%', tone: 'green' as const },
  { label: 'Queue Health', value: '97.42%', tone: 'yellow' as const },
  { label: 'Bot Health', value: '98.10%', tone: 'green' as const },
  { label: 'Visual Health', value: '99.31%', tone: 'green' as const },
  { label: 'Motion Health', value: '96.80%', tone: 'yellow' as const },
  { label: 'Auth Health', value: '99.90%', tone: 'green' as const },
  { label: 'Payment Health', value: '99.21%', tone: 'green' as const },
];

const rows = [
  { primary: 'Route Cluster A', secondary: 'public + account + artist', status: 'stable', value: '2.4ms', chips: ['routes', 'sockets'] },
  { primary: 'Queue Fabric', secondary: 'ticketing + booking + support', status: 'watch', value: '71% load', chips: ['queues', 'fallback'] },
  { primary: 'Auth Authority', secondary: 'session + token + role checks', status: 'stable', value: '0.02% fail', chips: ['auth', 'device trust'] },
  { primary: 'Payment Rail', secondary: 'subscriptions + tips + ads', status: 'stable', value: '$41.2k/day', chips: ['payments', 'webhooks'] },
  { primary: 'Bot Runtime', secondary: 'social + concierge + moderation', status: 'stable', value: '412 active', chips: ['bots', 'behavior'] },
];

export default function AdminOperationsPage() {
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
