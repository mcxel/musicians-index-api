import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';

const metrics = [
  { label: 'Routes', value: '6 warnings', tone: 'yellow' as const },
  { label: 'Queues', value: '2 stalls', tone: 'red' as const },
  { label: 'Bots', value: '17 fails', tone: 'red' as const },
  { label: 'Visuals', value: '4 misses', tone: 'yellow' as const },
  { label: 'Motion', value: '3 fails', tone: 'yellow' as const },
  { label: 'Sockets', value: '99.7%', tone: 'green' as const },
];

const rows = [
  { primary: 'Route Error Grid', secondary: '404 and route ownership issues', status: 'watch', value: '6', chips: ['routes', 'truth'] },
  { primary: 'Queue Stall Detector', secondary: 'dispatch and retry stalls', status: 'critical', value: '2', chips: ['queues', 'recovery'] },
  { primary: 'Bot Exception Stream', secondary: 'behavior and action failures', status: 'watch', value: '17', chips: ['bots', 'exceptions'] },
  { primary: 'Visual Asset Errors', secondary: 'missing or invalid media links', status: 'watch', value: '4', chips: ['visuals', 'assets'] },
  { primary: 'Motion Runtime Errors', secondary: 'timeline and host motion faults', status: 'watch', value: '3', chips: ['motion', 'timeline'] },
  { primary: 'Socket Integrity', secondary: 'connection and reconnect health', status: 'stable', value: '99.7%', chips: ['sockets', 'transport'] },
];

export default function AdminErrorsPage() {
  return (
    <AdminOpsConsole
      title="Administrator Errors"
      subtitle="Error observatory for routes, queues, bots, visuals, motion, and sockets."
      metrics={metrics}
      rowsTitle="Error Intelligence"
      rows={rows}
      actions={commonAdminActions}
      quickLinks={adminOpsLinks}
    />
  );
}
