import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Go Live · TMI',
  description: 'Start broadcasting and appear on the TMI Lobby Wall instantly.',
};

/**
 * LEGACY route — Step 4 Slice 1 canonical entry is triggerCanonicalGoLive
 * (hub in-place presentInstantGoLiveInPlace → POST /api/live/go).
 * Always redirects to hub performer golive; UVR + HubMonitor players only.
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
