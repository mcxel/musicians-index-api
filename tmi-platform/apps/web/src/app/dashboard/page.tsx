import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ROLE_DASHBOARD: Record<string, string> = {
  admin:      '/dashboard/admin',
  performer:  '/dashboard/performer',
  artist:     '/dashboard/artist',
  fan:        '/dashboard/fan',
  sponsor:    '/dashboard/sponsor',
  advertiser: '/dashboard/advertiser',
  venue:      '/dashboard/venue',
  promoter:   '/dashboard/promoter',
  writer:     '/dashboard/writer',
};

export default async function DashboardRedirect() {
  const cookieStore = cookies();
  const role = cookieStore.get('tmi_role')?.value?.toLowerCase() ?? '';
  const dest = ROLE_DASHBOARD[role] ?? '/dashboard/fan';
  redirect(dest);
}
