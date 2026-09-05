import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Go Live · TMI',
  description: 'Start broadcasting and appear on the TMI Lobby Wall instantly.',
};

/**
 * LEGACY route — canonical Go Live is in-place via Command Center.
 * Always redirects to hub performer golive; UVR + HubMonitor players only.
 * Dev wizard archaeology: /live/go?wizard=1 → /hub/performer?golive=1
 */
export default function GoLivePage({
  searchParams,
}: {
  searchParams?: { setup?: string; wizard?: string };
}) {
  const role = (cookies().get('tmi_role')?.value ?? '').toLowerCase();
  const isAllowed = ['performer', 'artist', 'admin', 'superadmin', 'venue'].includes(role);

  if (!isAllowed) {
    redirect('/auth/signin?next=/hub/performer?golive=1');
  }

  redirect('/hub/performer?golive=1');
}
