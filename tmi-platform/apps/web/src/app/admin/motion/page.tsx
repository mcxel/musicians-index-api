import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';
import AdminVisualCommandSummaryCard from '@/components/admin/AdminVisualCommandSummaryCard';

const metrics = [
  { label: 'Motion Queue', value: '94', tone: 'yellow' as const },
  { label: 'Deployments', value: '27', tone: 'green' as const },
  { label: 'Failed Motion', value: '3', tone: 'red' as const },
  { label: 'Host Motion', value: '19', tone: 'white' as const },
  { label: 'Venue Motion', value: '22', tone: 'white' as const },
];

const rows = [
  { primary: 'Masthead Runtime', secondary: 'home motion loops', status: 'watch', value: 'timing recalibration', chips: ['home', 'loop'] },
  { primary: 'Host Intro Packs', secondary: 'host overlays and transitions', status: 'stable', value: '19 active', chips: ['host', 'deploy'] },
  { primary: 'Venue Motion Stack', secondary: 'venue stage transitions', status: 'stable', value: '22 active', chips: ['venue', 'stage'] },
  { primary: 'Emergency Motion Fallback', secondary: 'zero-motion safe mode', status: 'stable', value: 'ready', chips: ['fallback', 'safety'] },
];

export default function AdminMotionPage() {
  return (
    <>
      <div style={{ padding: '16px 16px 0' }}>
        <AdminVisualCommandSummaryCard />
      </div>
      <AdminOpsConsole
        title="Administrator Motion"
        subtitle="Motion command for queueing, deployments, failure handling, and host/venue runtime control."
        metrics={metrics}
        rowsTitle="Motion Pipelines"
        rows={rows}
        actions={commonAdminActions}
        quickLinks={adminOpsLinks}
      />
    </>
  );
}
