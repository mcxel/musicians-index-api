import Link from 'next/link';

export const metadata = { title: 'Premieres — TMI Platform' };

const UPCOMING = [
  { title: 'Crown Season IV — Opening Ceremony', date: 'Fri June 6 · 9PM EST', genre: 'Multi-Genre', color: '#ffd700' },
  { title: 'Afrobeats Invasion: Vol. 3 Premier', date: 'Sat June 7 · 8PM EST', genre: 'Afrobeats', color: '#FF2DAA' },
  { title: 'Underground Kings Documentary', date: 'Sun June 8 · 7PM EST', genre: 'Hip-Hop', color: '#00FFFF' },
];

export default function PremieresPage() {
  return (
    <main style={{ background: '#050510', minHeight: '100vh', padding: '60px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Premieres
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 40 }}>
          Exclusive first-look drops, live events, and documentary releases.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {UPCOMING.map((item) => (
            <div key={item.title} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${item.color}33`,
              borderRadius: 14,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{ width: 6, height: 56, borderRadius: 3, background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.date} · {item.genre}</div>
              </div>
              <div style={{ padding: '6px 14px', background: `${item.color}18`, border: `1px solid ${item.color}44`, borderRadius: 8, fontSize: 11, fontWeight: 700, color: item.color }}>
                Remind Me
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/events" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 2 }}>
            View all events →
          </Link>
        </div>
      </div>
    </main>
  );
}
