import type { Metadata } from 'next';
import OwnerDashboardClient from './OwnerDashboardClient';

export const metadata: Metadata = { title: 'Owner Dashboard' };

export default function OwnerDashboardPage() {
  return <OwnerDashboardClient />;
}
