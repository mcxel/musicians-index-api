/**
 * host/page.tsx
 * Repo: apps/web/src/app/contest/host/page.tsx
 * Action: CREATE | Wave: W4
 */
'use client';
import type { Metadata } from 'next';

// Note: cannot export metadata from a 'use client' component.
// Move to a separate layout.tsx or remove 'use client' if host controls are server-only.

export default function HostPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', margin: '0 0 8px', textTransform: 'uppercase' }}>
          Contest
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Ray Journey</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>
          Your host for the Grand Platform Contest. Ray Journey guides contestants, announces sponsors,
          and reveals winners live.
        </p>

        {/* RayJourneyHost wiring point */}
        <div style={{
          background: '#0d1117', border: '1px solid rgba(255,107,26,.2)',
          borderRadius: 14, padding: 40, textAlign: 'center', marginBottom: 20,
        }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎙</div>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, margin: '0 0 24px' }}>
            Ray Journey is ready to host.
          </p>
          {/* TODO: import RayJourneyHost from '@/components/host/RayJourneyHost' and render here */}
          {/* TODO: wire to /api/contest/host/scripts and /api/contest/host/cue endpoints */}
        </div>

        {/* HostCuePanel wiring point */}
        <div style={{
          background: '#0d1117', border: '1px solid rgba(255,255,255,.07)',
          borderRadius: 14, padding: 24,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Host Controls</div>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>
            {/* TODO: import HostCuePanel and HostScriptPanel from '@/components/host/' */}
            Host control panel wiring point. Place HostCuePanel component here.
          </p>
        </div>
      </div>
    </main>
  );
}
