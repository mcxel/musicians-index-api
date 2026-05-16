import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';
import AdminBotGovernanceSummaryCard from '@/components/admin/AdminBotGovernanceSummaryCard';

const metrics = [
  { label: 'Engagement', value: '78.2%', tone: 'green' as const },
  { label: 'Retention', value: '64.5%', tone: 'yellow' as const },
  { label: 'Conversion', value: '11.7%', tone: 'white' as const },
  { label: 'Countries', value: '84', tone: 'white' as const },
  { label: 'Room Activity', value: '1,406/h', tone: 'green' as const },
];

const rows = [
  { primary: 'Engagement Deck', secondary: 'session and dwell patterns', status: 'stable', value: '78.2%', chips: ['engagement', 'sessions'] },
  { primary: 'Retention Curve', secondary: 'day 1 / day 7 / day 30 hold', status: 'watch', value: '64.5%', chips: ['retention', 'cohorts'] },
  { primary: 'Conversion Funnel', secondary: 'trial to paid and ticket buy', status: 'stable', value: '11.7%', chips: ['conversion', 'commerce'] },
  { primary: 'Country Heat', secondary: 'global active country spread', status: 'stable', value: '84 countries', chips: ['countries', 'global'] },
  { primary: 'Room Activity Rail', secondary: 'room opens, joins, and exits', status: 'stable', value: '1,406/h', chips: ['rooms', 'activity'] },
];

export default function AdminAnalyticsPage() {
  return (
    <>
      <div style={{ padding: '16px 16px 0' }}>
        <AdminBotGovernanceSummaryCard />
      </div>
      <AdminOpsConsole
        title="Administrator Analytics"
        subtitle="Analytics authority for engagement, retention, conversion, country spread, room activity, and workforce governance."
        metrics={metrics}
        rowsTitle="Analytics Intelligence"
        rows={rows}
        actions={commonAdminActions}
        quickLinks={adminOpsLinks}
      />
    </>
  );
}
