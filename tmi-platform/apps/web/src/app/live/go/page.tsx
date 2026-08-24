import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import GoLiveStudio from '@/components/live/GoLiveStudio';

export const metadata: Metadata = {
  title: 'Go Live · TMI',
  description: 'Start broadcasting and appear on the TMI Lobby Wall instantly.',
};

export default function GoLivePage({
  searchParams,
}: {
  searchParams?: { setup?: string; wizard?: string };
}) {
  const role = (cookies().get('tmi_role')?.value ?? '').toLowerCase();
  const isAllowed = ['performer', 'artist', 'admin', 'superadmin', 'venue'].includes(role);

  if (!isAllowed) {
    redirect('/auth/signin?next=/live/go');
  }

  const useWizard =
    searchParams?.setup === '1' ||
    searchParams?.setup === 'true' ||
    searchParams?.wizard === '1' ||
    searchParams?.wizard === 'true';

  if (!useWizard) {
    redirect('/hub/performer?golive=1');
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <GoLiveStudio />
      </div>
    </main>
  );
}
