import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ROLE_DASHBOARD: Record<string, string> = {
  admin:      '/admin',
  staff:      '/admin',
  performer:  '/hub/performer',
  artist:     '/hub/performer',
  fan:        '/hub/fan',
  sponsor:    '/hub/sponsor',
  advertiser: '/hub/advertiser',
  venue:      '/hub/venue',
  promoter:   '/hub/promoter',
  writer:     '/hub/writer',
};

export default async function DashboardRedirect() {
  const cookieStore = cookies();
  const role = cookieStore.get('tmi_role')?.value?.toLowerCase() ?? '';
  const dest = ROLE_DASHBOARD[role] ?? '/hub/fan';
  redirect(dest);
}
