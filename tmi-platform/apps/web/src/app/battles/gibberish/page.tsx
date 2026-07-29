'use client';

/**
 * /battles/gibberish — EOS-mounted Gibberish Battle (Phase 4.7 Vocal Improv).
 * StageLoader validates contract → mounts GibberishBattleExperience in FlightDeckBezel.
 */

import Link from 'next/link';
import StageLoader from '@/components/eos/StageLoader';

export default function GibberishBattlePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(0,255,255,0.12), transparent 50%), #050510',
        color: '#fff',
        paddingBottom: 24,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.9)',
          borderBottom: '1px solid rgba(0,255,255,0.25)',
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
          <div style={{ fontSize: 9, letterSpacing: '0.3em', fontWeight: 800, color: '#00FFFF' }}>
            GIBBERISH · VOCAL IMPROV
          </div>
        </div>
        <Link href="/battles" style={{ fontSize: 9, color: '#FF2DAA', textDecoration: 'none', fontWeight: 700 }}>
          All Battles →
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 0' }}>
        <StageLoader
          experienceId="gibberish-battle"
          roomId="gibberish"
          venueId="battle"
          role="fan"
        />
      </div>
    </main>
  );
}
