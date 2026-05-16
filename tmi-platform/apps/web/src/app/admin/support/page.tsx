import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';
import SupportTicketEngine from '@/lib/support/SupportTicketEngine';

const backlog = SupportTicketEngine.getBacklogSummary();

const metrics = [
  { label: 'Billing Tickets', value: String(backlog.open), tone: 'yellow' as const },
  { label: 'Help Requests', value: String(backlog.total), tone: 'white' as const },
  { label: 'Recovery Cases', value: String(backlog.pending), tone: 'yellow' as const },
  { label: 'Appeals', value: String(backlog.escalated), tone: 'white' as const },
];

const rows = [
  {
    primary: 'Billing Operations',
    secondary: 'refunds and payment disputes',
    status: 'stable',
    value: '6m avg',
    chips: ['billing', 'finance'],
  },
  {
    primary: 'General Help Desk',
    secondary: 'fan and creator support tickets',
    status: 'stable',
    value: '84 open',
    chips: ['help', 'triage'],
  },
  {
    primary: 'Account Recovery',
    secondary: 'password and device recovery',
    status: 'watch',
    value: '11 active',
    chips: ['recovery', 'auth'],
  },
  {
    primary: 'Appeals Unit',
    secondary: 'moderation and access appeals',
    status: 'stable',
    value: '17 pending',
    chips: ['appeals', 'policy'],
  },
];

export default function AdminSupportPage() {
  return (
    <AdminOpsConsole
      title="Administrator Support"
      subtitle="Support oversight for billing, help, recovery, and appeals operations."
      metrics={metrics}
      rowsTitle="Support Departments"
      rows={rows}
      actions={commonAdminActions}
      quickLinks={adminOpsLinks}
    />
  );
}
