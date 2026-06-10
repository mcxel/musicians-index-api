'use client';

import Link from 'next/link';

const SHOWCASES = [
  { format: 'dj',             label: 'DJ Showcase',             emoji: '🎧', accent: '#00FFFF', desc: 'Turntablists & mix engineers live' },
  { format: 'singer',         label: 'Singer Showcase',         emoji: '🎤', accent: '#AA2DFF', desc: 'Vocal artists performing live' },
  { format: 'comedy',         label: 'Comedy Showcase',         emoji: '😂', accent: '#FFD700', desc: 'Stand-up, improv & sketch comedy' },
  { format: 'dance',          label: 'Dance Showcase',          emoji: '💃', accent: '#FF2DAA', desc: 'All dance styles & crews' },
  { format: 'producer',       label: 'Producer Showcase',       emoji: '🎹', accent: '#00FF88', desc: 'Beat producers & instrumentals' },
  { format: 'band',           label: 'Band Showcase',           emoji: '🎸', accent: '#FF6B35', desc: 'Bands & groups performing live' },
  { format: 'instrumentalist',label: 'Instrumentalist Showcase',emoji: '🥁', accent: '#FF3B5C', desc: 'Solo & ensemble instrumentalists' },
  { format: 'spoken-word',    label: 'Spoken Word Showcase',    emoji: '🎭', accent: '#40C4FF', desc: 'Poetry, spoken word & storytelling' },
  { format: 'actor',          label: 'Actor Showcase',          emoji: '🎬', accent: '#FF8C00', desc: 'Monologues, scenes & improvisation' },
  { format: 'magician',       label: 'Magician Showcase',       emoji: '🪄', accent: '#ADFF2F', desc: 'Live magic & illusion performance' },
];

export default function ShowcasesHubPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px' }}>
      {/* Back nav */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/home/1" style={{ color: '#00FFFF', textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'var(--font-orbitron, monospace)' }}>
          ← HOME
        </Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 'clamp(22px, 5vw, 42px)', fontWeight: 900, color: '#00FFFF', textShadow: '0 0 30px #00FFFF55', letterSpacing: '0.1em', margin: '0 0 12px' }}>
          TMI SHOWCASES
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          Non-competitive live performance rooms. Perform, react, tip, and discover talent across 10 formats.
        </p>
      </div>

      {/* Showcase grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {SHOWCASES.map(s => (
          <Link key={s.format} href={`/showcases/${s.format}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: `${s.accent}08`,
              border: `1px solid ${s.accent}33`,
              borderRadius: 12,
              padding: '24px 20px',
              cursor: 'pointer',
              transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = 'translateY(-4px)';
              el.style.boxShadow = `0 8px 30px ${s.accent}33`;
              el.style.background = `${s.accent}14`;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = '';
              el.style.boxShadow = '';
              el.style.background = `${s.accent}08`;
            }}
            >
              <div style={{ fontSize: 32 }}>{s.emoji}</div>
              <div style={{ fontFamily: 'var(--font-orbitron, monospace)', fontWeight: 900, fontSize: 13, color: s.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                {s.desc}
              </div>
              <div style={{ marginTop: 4 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '5px 14px',
                  background: `${s.accent}20`,
                  border: `1px solid ${s.accent}55`,
                  borderRadius: 6,
                  color: s.accent,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  ENTER SHOWCASE →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Sign-up CTA */}
      <div style={{ textAlign: 'center', marginTop: 60, padding: '32px 24px', background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.15)', borderRadius: 16, maxWidth: 600, margin: '60px auto 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 }}>Ready to perform? Join TMI free and get your showcase slot.</p>
        <Link href="/signup" style={{
          display: 'inline-block',
          padding: '12px 32px',
          background: 'linear-gradient(135deg, #00FFFF22, #AA2DFF22)',
          border: '1.5px solid #00FFFF',
          borderRadius: 8,
          color: '#00FFFF',
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          fontFamily: 'var(--font-orbitron, monospace)',
        }}>
          SIGN UP FREE
        </Link>
      </div>
    </main>
  );
}
