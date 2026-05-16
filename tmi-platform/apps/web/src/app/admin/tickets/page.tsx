import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';

const metrics = [
  { label: 'Sold', value: '12,420', tone: 'green' as const },
  { label: 'Transferred', value: '1,106', tone: 'yellow' as const },
  { label: 'Refunded', value: '284', tone: 'red' as const },
  { label: 'Checked-In', value: '8,990', tone: 'white' as const },
  { label: 'Printed', value: '6,341', tone: 'white' as const },
];

const rows = [
  { primary: 'Ticket Sales Rail', secondary: 'new purchases and seat inventory', status: 'stable', value: '12,420 sold', chips: ['sold', 'inventory'] },
  { primary: 'Transfer Desk', secondary: 'peer transfers and validation', status: 'watch', value: '1,106', chips: ['transferred', 'validation'] },
  { primary: 'Refund Queue', secondary: 'policy and payment reversals', status: 'watch', value: '284', chips: ['refunded', 'billing'] },
  { primary: 'Entry Control', secondary: 'scanner check-in integrity', status: 'stable', value: '8,990', chips: ['checked-in', 'scanner'] },
  { primary: 'Ticket Print Node', secondary: 'qr print and backup print', status: 'stable', value: '6,341', chips: ['printed', 'qr'] },
];

export default function AdminTicketsPage() {
  return (
    <AdminOpsConsole
      title="Administrator Tickets"
      subtitle="Ticket oversight for sold, transferred, refunded, checked-in, and printed states."
      metrics={metrics}
      rowsTitle="Ticket Lifecycle"
      rows={rows}
      actions={commonAdminActions}
      quickLinks={adminOpsLinks}
    />
  );
}
