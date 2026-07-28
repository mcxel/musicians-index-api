'use client';

/**
 * /shows/deal-or-feud — EOS-mounted Deal or Feud experience (Phase 4 Pass 4.6).
 * StageLoader validates contract → mounts DealOrFeudExperience in FlightDeckBezel.
 * Full producer game runtime remains at /rooms/deal-vs-feud.
 */

import Link from 'next/link';
import StageLoader from '@/components/eos/StageLoader';

export default function DealOrFeudEosPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(255,45,170,0.16), transparent 55%), #050510',
        color: '#fff',
        paddingBottom: 24,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.9)',
          borderBottom: '1px solid rgba(255,45,170,0.25)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/explore"
            style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.1em' }}
          >
            ← EXPLORE
          </Link>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', fontWeight: 800, color: '#FF2DAA' }}>
            DEAL OR FEUD 1000 · GAME SHOW
          </div>
        </div>
        <Link
          href="/rooms/deal-vs-feud"
          style={{ fontSize: 9, color: '#00FFFF', textDecoration: 'none', fontWeight: 700 }}
        >
          Full Game Runtime →
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 0' }}>
        <StageLoader
          experienceId="deal-or-feud"
          roomId="deal-vs-feud"
          venueId="deal-or-feud"
          role="fan"
        />
      </div>
    </main>
  );
}
