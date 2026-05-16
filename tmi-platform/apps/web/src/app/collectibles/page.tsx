import Link from 'next/link';

export const metadata = { title: 'Collectibles — TMI Platform' };

const CATEGORIES = [
  { label: 'Artist Cards', desc: 'Limited-edition digital cards from your favourite TMI artists.', color: '#00FFFF' },
  { label: 'Beat Ownership Tokens', desc: 'Fractional ownership proofs for licensed beats.', color: '#ffd700' },
  { label: 'Live Moments', desc: 'Captured live performance clips minted as collectibles.', color: '#FF2DAA' },
  { label: 'Crown Fragments', desc: 'Pieces of the Grand Contest Crown — combine to claim.', color: '#ff6b1a' },
];

export default function CollectiblesPage() {
  return (
    <main style={{ background: '#050510', minHeight: '100vh', padding: '60px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Link href="/hub/fan" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 10px' }}>
            ← Fan Hub
          </Link>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Collectibles
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 48 }}>
          Your digital collectibles library — rare cards, tokens, and live moments.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 48 }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${cat.color}33`,
              borderRadius: 14,
              padding: 24,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: cat.color, marginBottom: 8 }}>{cat.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{cat.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Your collection is empty.</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>Attend live events and support artists to earn collectibles.</div>
        </div>
      </div>
    </main>
  );
}
