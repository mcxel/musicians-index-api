import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';

const metrics = [
  { label: 'Venues', value: '182', tone: 'white' as const },
  { label: 'Performers', value: '496', tone: 'green' as const },
  { label: 'Meet-and-Greets', value: '63', tone: 'yellow' as const },
  { label: 'Open Requests', value: '44', tone: 'yellow' as const },
];

const rows = [
  { primary: 'Venue Booking Grid', secondary: 'city and country venue matching', status: 'stable', value: '182 venues', chips: ['venues', 'matching'] },
  { primary: 'Performer Dispatch', secondary: 'performer availability windows', status: 'stable', value: '496 profiles', chips: ['performers', 'calendar'] },
  { primary: 'Meet-and-Greet Pipeline', secondary: 'vip and fan experiences', status: 'watch', value: '63 scheduled', chips: ['vip', 'events'] },
  { primary: 'Booking Review Queue', secondary: 'pending confirmations and edits', status: 'watch', value: '44 open', chips: ['queue', 'approval'] },
];

export default function AdminBookingsPage() {
  return (
    <AdminOpsConsole
      title="Administrator Bookings"
      subtitle="Booking oversight for venues, performers, and meet-and-greet operations."
      metrics={metrics}
      rowsTitle="Booking Intelligence"
      rows={rows}
      actions={commonAdminActions}
      quickLinks={adminOpsLinks}
    />
  );
}
