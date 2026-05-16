import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';
import AdminVisualCommandSummaryCard from '@/components/admin/AdminVisualCommandSummaryCard';

const metrics = [
  { label: 'Visual Queue', value: '138', tone: 'yellow' as const },
  { label: 'Slots', value: '54', tone: 'white' as const },
  { label: 'Deployments', value: '41', tone: 'green' as const },
  { label: 'Replacements', value: '12', tone: 'yellow' as const },
];

const rows = [
  { primary: 'Homepage Hero Rotation', secondary: 'global visual stack', status: 'stable', value: '12 assets', chips: ['queue', 'deploy'] },
  { primary: 'Venue Screen Pack', secondary: 'xxl + tmi stage displays', status: 'watch', value: '4 pending', chips: ['slots', 'replace'] },
  { primary: 'Billboard Feed', secondary: 'sponsor and promo placements', status: 'stable', value: '28 live', chips: ['billboards', 'ads'] },
  { primary: 'Magazine Visual Rail', secondary: 'issue 74 media set', status: 'stable', value: '9 pages', chips: ['magazine', 'content'] },
];

export default function AdminVisualsPage() {
  return (
    <>
      <div style={{ padding: '16px 16px 0' }}>
        <AdminVisualCommandSummaryCard />
      </div>
      <AdminOpsConsole
        title="Administrator Visuals"
        subtitle="Visual command for queueing, slots, deployments, and replacement control."
        metrics={metrics}
        rowsTitle="Visual Pipelines"
        rows={rows}
        actions={commonAdminActions}
        quickLinks={adminOpsLinks}
      />
    </>
  );
}
