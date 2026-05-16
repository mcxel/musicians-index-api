import Link from 'next/link';

const SEED_BANDS = [
  { slug: 'the-frequency-collective', name: 'The Frequency Collective', genre: 'Hip-Hop / Trap', memberCount: 5, isLive: true, accent: '#FF2DAA' },
  { slug: 'voltage-sons', name: 'Voltage Sons', genre: 'Dancehall / Afrobeats', memberCount: 3, isLive: false, accent: '#00FF88' },
  { slug: 'neon-cipher', name: 'Neon Cipher', genre: 'Cypher / Spoken Word', memberCount: 7, isLive: true, accent: '#00FFFF' },
  { slug: 'midnight-grid', name: 'Midnight Grid', genre: 'R&B / Neo Soul', memberCount: 4, isLive: false, accent: '#AA2DFF' },
  { slug: 'beast-mode-band', name: 'Beast Mode Band', genre: 'Battle Rap / Trap', memberCount: 6, isLive: false, accent: '#FFD700' },
];

export default function BandsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#060410', color: '#fff', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '36px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.5px' }}>🎸 Bands</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Groups, crews, collectives — bands perform together, go live together.
            </p>
          </div>
          <Link
            href="/bands/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 24,
              background: 'rgba(255,45,170,0.12)', border: '1px solid rgba(255,45,170,0.35)',
              color: '#FF2DAA', fontWeight: 800, fontSize: 12,
              letterSpacing: '0.05em', textDecoration: 'none',
            }}
          >
            + Register Your Band
          </Link>
        </div>
      </div>

      {/* Band Grid */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {SEED_BANDS.map(band => (
            <Link
              key={band.slug}
              href={`/bands/${band.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  borderRadius: 12, padding: '18px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${band.accent}22`,
                  transition: 'border-color 0.2s, background 0.2s',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: `${band.accent}18`,
                    border: `2px solid ${band.accent}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    🎸
                  </div>
                  {band.isLive && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
                      color: '#00FF88', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                      LIVE
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>
                  {band.name}
                </h3>
                <p style={{ fontSize: 11, color: band.accent, margin: '0 0 8px', fontWeight: 700 }}>
                  {band.genre}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                  {band.memberCount} members
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
