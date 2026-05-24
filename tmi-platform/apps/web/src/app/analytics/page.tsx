import TieredAnalyticsDashboard from '@/components/analytics/TieredAnalyticsDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | TMI',
  description: 'Your personal stats and activity breakdown on The Musician\'s Index.',
};

export default function AnalyticsPage() {
  return <TieredAnalyticsDashboard initialTier="fan" />;
}
