'use client';

/**
 * /challenge/stage — EOS-mounted Challenge experience (Phase 4 Pass 4.4).
 * LEGACY REDIRECT — original content below is superseded by EOS StageLoader.
 */

import Link from 'next/link';
import StageLoader from '@/components/eos/StageLoader';

export default function ChallengeStagePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(0,229,255,0.18), transparent 55%), #050510',
        color: '#fff',
        paddingBottom: 24,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.9)',
          borderBottom: '1px solid rgba(0,229,255,0.25)',
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
          <div style={{ fontSize: 9, letterSpacing: '0.3em', fontWeight: 800, color: '#00E5FF' }}>
            CHALLENGE ARENA · LIVE STAGE
          </div>
        </div>
        <Link href="/challenge" style={{ fontSize: 9, color: '#FFD700', textDecoration: 'none', fontWeight: 700 }}>
          All Challenges →
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 0' }}>
        <StageLoader
          experienceId="challenge"
          roomId="challenge-arena"
          venueId="challenge"
          role="fan"
        />
      </div>
    </main>
  );
}
