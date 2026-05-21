/**
 * contest/admin/reveal/page.tsx
 * Repo: apps/web/src/app/contest/admin/reveal/page.tsx
 * Action: CREATE | Wave: C
 * Requires: apps/web/src/app/contest/admin/layout.tsx (admin guard)
 * Dependencies: WinnerCameraDirector, WinnerRevealPanel
 */
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Reveal Controls | Contest Admin | TMI' };

// NOTE: This is a server component shell.
// Wire real data from GET /api/contest/seasons/active + GET /api/reveal-config/:seasonId

export default async function RevealAdminPage() {
  // TODO: const season = await fetch('/api/contest/seasons/active').then(r => r.json());
  // TODO: const revealConfig = await fetch(`/api/contest/reveal-config/${season?.id}`).then(r => r.json());

  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', margin: '0 0 8px', textTransform: 'uppercase' }}>
            Contest Admin
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>Reveal Controls</h1>
          <p style={{ color: 'rgba(255,255,255,.4)', margin: 0 }}>
            Configure winner reveal behavior for the active contest season.
            All changes are logged. Season lock prevents changes during live events.
          </p>
        </div>

        {/* SECTION: Winner Count Mode */}
        <section style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffd700', margin: '0 0 16px' }}>
            Winner Count Mode
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
            {[
              { id: 'single', label: 'Single Winner', desc: '1 winner, fastest reveal', emoji: '🥇' },
              { id: 'small_game', label: 'Small Game', desc: '1–5 winners, group + hero', emoji: '🎯' },
              { id: 'big_contest', label: 'Big Contest', desc: '5–10 winners, full ceremony', emoji: '🏆' },
            ].map(mode => (
              <div key={mode.id} style={{
                padding: '18px 16px', background: 'rgba(255,255,255,.03)',
                border: '1px solid rgba(255,255,255,.1)', borderRadius: 12,
                textAlign: 'center', cursor: 'pointer',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{mode.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{mode.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{mode.desc}</div>
              </div>
            ))}
          </div>
          {/* TODO: Wire to PUT /api/contest/reveal-config/:seasonId */}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', margin: 0 }}>
            Wire reveal mode selector to updateRevealConfig API endpoint.
          </p>
        </section>

        {/* SECTION: Group Hold + Voice */}
        <section style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#00e5ff', margin: '0 0 16px' }}>
            Group Reaction Settings
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em', display: 'block', marginBottom: 8 }}>
                GROUP HOLD DURATION
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[2, 3, 4, 5].map(s => (
                  <button key={s} style={{ padding: '8px 16px', background: s === 3 ? 'rgba(0,229,255,.15)' : 'rgba(255,255,255,.04)', border: `1px solid ${s === 3 ? 'rgba(0,229,255,.5)' : 'rgba(255,255,255,.1)'}`, borderRadius: 8, color: s === 3 ? '#00e5ff' : 'rgba(255,255,255,.5)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    {s}s
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em', display: 'block', marginBottom: 8 }}>
                VOICE CHATTER MODE
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['chaotic', 'balanced', 'broadcast_safe'].map(m => (
                  <button key={m} style={{ padding: '8px 12px', background: m === 'balanced' ? 'rgba(0,229,255,.1)' : 'rgba(255,255,255,.03)', border: `1px solid ${m === 'balanced' ? 'rgba(0,229,255,.3)' : 'rgba(255,255,255,.08)'}`, borderRadius: 8, color: m === 'balanced' ? '#00e5ff' : 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                    {m.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Camera Presets */}
        <section style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#00ff88', margin: '0 0 16px' }}>
            Camera Preset Pool
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
            Only presets in the approved pool will be used. All transitions are logged.
          </p>
          {/* TODO: Wire to reveal.presets.ts CAMERA_PRESETS and updateRevealConfig */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {['hero_zoom', 'group_celebration', 'podium_pan', 'winner_isolation', 'chaotic_reaction_sweep', 'crowd_bounce_shot'].map(id => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(0,255,136,.2)', borderRadius: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{id.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: Season Lock + Controls */}
        <section style={{ background: '#0d1117', border: '1px solid rgba(255,107,26,.2)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ff6b1a', margin: '0 0 16px' }}>
            Safety Controls
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={{ padding: '10px 20px', background: 'rgba(255,215,0,.1)', border: '1px solid rgba(255,215,0,.3)', borderRadius: 8, color: '#ffd700', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              🔒 Season Lock ON
            </button>
            <button style={{ padding: '10px 20px', background: 'rgba(255,107,26,.1)', border: '1px solid rgba(255,107,26,.3)', borderRadius: 8, color: '#ff6b1a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              ↺ Reset Weights to Default
            </button>
            <button style={{ padding: '10px 20px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: 'rgba(255,255,255,.6)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              🛡️ Enable Fallback Mode
            </button>
          </div>
        </section>

        {/* SECTION: Recent Audit Log */}
        <section style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,.7)', margin: '0 0 16px' }}>
            Reveal Audit Log
          </h2>
          {/* TODO: Fetch from GET /api/contest/admin/audit?action=reveal */}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', textAlign: 'center', padding: '20px 0' }}>
            No reveal events logged yet. Audit entries appear after first reveal.
          </p>
        </section>

      </div>
    </main>
  );
}
