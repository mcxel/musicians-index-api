import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import GoLiveStudio from '@/components/live/GoLiveStudio';

export const metadata: Metadata = {
  title: 'Go Live · TMI',
  description: 'Start broadcasting and appear on the TMI Lobby Wall instantly.',
};

export default function GoLivePage() {
  const role = (cookies().get('tmi_role')?.value ?? '').toLowerCase();
  const isAllowed = ['performer', 'artist', 'admin', 'superadmin', 'venue'].includes(role);

  if (!isAllowed) {
    redirect('/auth/signin?next=/live/go');
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Link
          href="/live/lobby"
          style={{ fontSize: 9, color: '#FF2DAA', textDecoration: 'none', letterSpacing: '0.12em', display: 'block', marginBottom: 28 }}
        >
          ← BACK TO LOBBY
        </Link>

        <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900 }}>
          Start Your Broadcast
        </h1>
        <p style={{ margin: '0 0 36px', color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, maxWidth: 560 }}>
          Go live and appear on the Lobby Wall instantly. Fans discover and watch you in real time — no setup required.
        </p>

        <GoLiveStudio />
      </div>
    </main>
  );
}
