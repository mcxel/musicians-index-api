import Link from 'next/link';

export const metadata = { title: 'Rankings — TMI Platform' };

const RANKING_CATEGORIES = [
  { href: '/rankings/crown', label: 'Crown Rankings', desc: 'Grand Contest leaderboard — top artists this season.', color: '#ffd700' },
  { href: '/charts', label: 'Charts', desc: 'Trending beats, artists, and songs across all genres.', color: '#00FFFF' },
];

export default function RankingsPage() {
  return (
    <main style={{ background: '#050510', minHeight: '100vh', padding: '60px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Rankings
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 48 }}>
          Discover who&apos;s leading the TMI platform this season.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {RANKING_CATEGORIES.map((cat) => (
            <Link key={cat.href} href={cat.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${cat.color}33`,
                borderRadius: 12,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: cat.color, marginBottom: 4 }}>{cat.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{cat.desc}</div>
                </div>
                <div style={{ color: cat.color, opacity: 0.6, fontSize: 18 }}>→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
