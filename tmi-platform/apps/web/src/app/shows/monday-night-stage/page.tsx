'use client';

/**
 * /shows/monday-night-stage — EOS-mounted Monday Night Stage experience (Phase 4 Pass 4.5).
 * Broadcast Profile: StageLoader validates contract → mounts MondayNightStageExperience.
 * Widget stack: broadcast_controls + live_chat + stream_status (broadcast group)
 *               boo_meter + crowd_meter + voting (audience group)
 *               show_title + live_badge (overlay group)
 *
 * The full-featured producer page with MondayNightStageEngine lives at
 * /rooms/monday-stage and remains the canonical runtime; this route is the
 * EOS-certified broadcast-profile entry point per entryRoute in ExperienceRegistry.
 */

import Link from 'next/link';
import StageLoader from '@/components/eos/StageLoader';

export default function MondayNightStagePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(255,215,0,0.12), transparent 55%), #050510',
        color: '#fff',
        paddingBottom: 24,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.9)',
          borderBottom: '1px solid rgba(255,215,0,0.25)',
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
          <div style={{ fontSize: 9, letterSpacing: '0.3em', fontWeight: 800, color: '#FFD700' }}>
            MONDAY NIGHT STAGE · LIVE BROADCAST
          </div>
        </div>
        <Link href="/shows" style={{ fontSize: 9, color: '#00FFFF', textDecoration: 'none', fontWeight: 700 }}>
          All Shows →
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 0' }}>
        <StageLoader
          experienceId="monday-night-stage"
          roomId="monday-night-stage"
          venueId="monday-night-stage"
          role="fan"
        />
      </div>
    </main>
  );
}
