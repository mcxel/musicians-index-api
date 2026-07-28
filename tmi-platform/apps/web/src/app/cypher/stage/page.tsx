'use client';

/**
 * /cypher/stage — EOS-mounted Cypher experience (Phase 4 Pass 4.3).
 * StageLoader validates contract → mounts CypherExperience in FlightDeckBezel.
 */

import Link from 'next/link';
import StageLoader from '@/components/eos/StageLoader';

export default function CypherStagePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(170,45,255,0.18), transparent 55%), #050510',
        color: '#fff',
        paddingBottom: 24,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.9)',
          borderBottom: '1px solid rgba(170,45,255,0.25)',
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
          <div style={{ fontSize: 9, letterSpacing: '0.3em', fontWeight: 800, color: '#AA2DFF' }}>
            CYPHER CIRCLE · LIVE STAGE
          </div>
        </div>
        <Link href="/cypher" style={{ fontSize: 9, color: '#00FFFF', textDecoration: 'none', fontWeight: 700 }}>
          All Cyphers →
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 0' }}>
        <StageLoader
          experienceId="cypher"
          roomId="cypher-circle"
          venueId="cypher"
          role="fan"
        />
      </div>
    </main>
  );
}
