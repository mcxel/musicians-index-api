import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';

const metrics = [
  { label: 'Magazine', value: '74 issues', tone: 'white' as const },
  { label: 'Articles', value: '312', tone: 'green' as const },
  { label: 'Ads', value: '147', tone: 'yellow' as const },
  { label: 'Billboards', value: '39', tone: 'green' as const },
  { label: 'Sponsors', value: '18', tone: 'white' as const },
];

const rows = [
  { primary: 'Magazine Editorial', secondary: 'cover + issue sequencing', status: 'stable', value: 'issue 74 live', chips: ['magazine', 'editorial'] },
  { primary: 'Article Desk', secondary: 'news and creator stories', status: 'stable', value: '12 queued', chips: ['articles', 'publishing'] },
  { primary: 'Ad Operations', secondary: 'campaign placements and pacing', status: 'watch', value: '4 approvals', chips: ['ads', 'campaign'] },
  { primary: 'Billboard Board', secondary: 'venue and homepage billboards', status: 'stable', value: '39 active', chips: ['billboards', 'visuals'] },
  { primary: 'Sponsor Placements', secondary: 'sponsor creative governance', status: 'stable', value: '18 active', chips: ['sponsors', 'brand'] },
];

export default function AdminContentPage() {
  return (
    <AdminOpsConsole
      title="Administrator Content"
      subtitle="Content governance for magazine, articles, ads, billboards, and sponsors."
      metrics={metrics}
      rowsTitle="Content Surfaces"
      rows={rows}
      actions={commonAdminActions}
      quickLinks={adminOpsLinks}
    />
  );
}
