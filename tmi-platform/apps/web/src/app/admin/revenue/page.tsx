import AdminOpsConsole from '@/components/admin-ops/AdminOpsConsole';
import { adminOpsLinks, commonAdminActions } from '@/components/admin-ops/adminOpsConfig';

const metrics = [
  { label: 'Subscriptions', value: '$24.7k', tone: 'green' as const },
  { label: 'Tickets', value: '$9.2k', tone: 'white' as const },
  { label: 'Tips', value: '$4.9k', tone: 'yellow' as const },
  { label: 'Ads', value: '$6.1k', tone: 'green' as const },
  { label: 'NFTs', value: '$3.5k', tone: 'white' as const },
  { label: 'Beats', value: '$7.3k', tone: 'yellow' as const },
  { label: 'Bookings', value: '$11.8k', tone: 'green' as const },
];

const rows = [
  { primary: 'Subscription Revenue', secondary: 'free to diamond conversion flow', status: 'stable', value: '$24.7k', chips: ['subscriptions', 'tiers'] },
  { primary: 'Ticket + Tip Revenue', secondary: 'live room and event monetization', status: 'stable', value: '$14.1k', chips: ['tickets', 'tips'] },
  { primary: 'Ads + Sponsors Revenue', secondary: 'campaign and billboard channels', status: 'watch', value: '$6.1k', chips: ['ads', 'sponsors'] },
  { primary: 'NFT + Beat Revenue', secondary: 'asset and license commerce rails', status: 'stable', value: '$10.8k', chips: ['nfts', 'beats'] },
  { primary: 'Booking Revenue', secondary: 'venue and performer contracts', status: 'stable', value: '$11.8k', chips: ['bookings', 'contracts'] },
];

export default function AdminRevenuePage() {
  return (
    <AdminOpsConsole
      title="Administrator Revenue"
      subtitle="Revenue oversight across subscriptions, tickets, tips, ads, NFTs, beats, and bookings."
      metrics={metrics}
      rowsTitle="Revenue Streams"
      rows={rows}
      actions={commonAdminActions}
      quickLinks={adminOpsLinks}
    />
  );
}
