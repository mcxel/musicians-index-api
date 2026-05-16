import Link from 'next/link';

export const metadata = { title: 'Crown Rankings — TMI Platform' };

const MOCK_CROWN_LEADERS = [
  { rank: 1, name: 'Astra Nova', score: 98420, tier: 'Diamond', genre: 'Afrobeats', change: '+2' },
  { rank: 2, name: 'DJ Kreach', score: 94110, tier: 'Diamond', genre: 'Electronic', change: '—' },
  { rank: 3, name: 'Twan King', score: 89780, tier: 'Platinum', genre: 'R&B', change: '+5' },
  { rank: 4, name: 'MelodixB', score: 82400, tier: 'Platinum', genre: 'Hip-Hop', change: '-1' },
  { rank: 5, name: 'VenusRhythm', score: 77650, tier: 'Gold', genre: 'Soul', change: '+3' },
];

const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];

export default function CrownRankingsPage() {
  return (
    <main style={{ background: '#050510', minHeight: '100vh', padding: '60px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link href="/charts" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 10px' }}>
            ← All Charts
          </Link>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#ffd700', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Crown Rankings
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>
          The Grand Contest leaderboard — updated live during active seasons.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOCK_CROWN_LEADERS.map((entry, i) => {
            const rankColor = i < 3 ? RANK_COLORS[i] : 'rgba(255,255,255,0.4)';
            return (
              <div key={entry.rank} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: i < 3 ? `${RANK_COLORS[i]}08` : 'rgba(255,255,255,0.025)',
                border: `1px solid ${i < 3 ? `${RANK_COLORS[i]}33` : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: rankColor, width: 32, textAlign: 'center', flexShrink: 0 }}>
                  #{entry.rank}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{entry.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{entry.tier} · {entry.genre}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: rankColor }}>{entry.score.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{entry.change} this week</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,215,0,0.7)' }}>
            Rankings update in real-time during active contest seasons. Full leaderboard available during Grand Contest events.
          </div>
        </div>
      </div>
    </main>
  );
}
