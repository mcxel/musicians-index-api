import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';

const metrics = [
  { label: 'Free', value: '8,940', tone: 'white' as const },
  { label: 'Pro', value: '1,240', tone: 'green' as const },
  { label: 'Bronze', value: '920', tone: 'white' as const },
  { label: 'Gold', value: '2,110', tone: 'yellow' as const },
  { label: 'Platinum', value: '780', tone: 'yellow' as const },
  { label: 'Diamond', value: '291', tone: 'green' as const },
  { label: 'Gifted', value: '316', tone: 'white' as const },
  { label: 'Trial', value: '614', tone: 'yellow' as const },
];

const rows = [
  { primary: 'Free and Pro Base', secondary: 'entry and growth cohorts', status: 'stable', value: '10,180', chips: ['free', 'pro'] },
  { primary: 'Bronze to Gold Ladder', secondary: 'mid-tier upgrades and retention', status: 'stable', value: '3,030', chips: ['bronze', 'gold'] },
  { primary: 'Platinum and Diamond', secondary: 'high-value subscriber governance', status: 'stable', value: '1,071', chips: ['platinum', 'diamond'] },
  { primary: 'Gifted and Trial Pipeline', secondary: 'promo and invite conversions', status: 'watch', value: '930', chips: ['gifted', 'trial'] },
];

export default function AdminSubscriptionsPage() {
  return (
    <AdminOpsConsole
      title="Administrator Subscriptions"
      subtitle="Subscription oversight for free, pro, bronze, gold, platinum, diamond, gifted, and trial tiers."
      metrics={metrics}
      rowsTitle="Subscription Tiers"
      rows={rows}
      actions={commonAdminActions}
      quickLinks={adminOpsLinks}
    />
  );
}
