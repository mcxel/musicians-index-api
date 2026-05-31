import Link from 'next/link';

const CFG = { label: 'Artist', accent: '#FF2DAA', hub: '/hub/performer', emoji: '🎨' };

const STATS = [
  { label: 'Performances', value: '0', sub: 'events participated' },
  { label: 'Revenue', value: '$0', sub: 'all time earnings' },
  { label: 'Followers', value: '0', sub: 'fans following you' },
  { label: 'Battles Won', value: '0', sub: 'cypher victories' },
];

export default function ArtistDashboardPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#07071a', color: '#fff', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link href={CFG.hub} style={{ color: CFG.accent, textDecoration: 'none', fontSize: 14 }}>
          ← Back to {CFG.label} Hub
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: '1rem' }}>
          {CFG.emoji} Artist Dashboard
        </h1>
        <p style={{ color: '#888', fontSize: 15, marginBottom: '2rem' }}>Your creative performance at a glance.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {STATS.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} accent={CFG.accent} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <QuickLink href="/artist/studio" label="Studio" desc="Manage your portfolio and works" accent={CFG.accent} />
          <QuickLink href="/artist/battles" label="Battles" desc="Enter creative competitions" accent={CFG.accent} />
          <QuickLink href="/artist/shows" label="Shows" desc="Featured appearances and events" accent={CFG.accent} />
          <QuickLink href="/artist/analytics" label="Analytics" desc="Views, reach, and fan engagement" accent={CFG.accent} />
          <QuickLink href="/artist/payments" label="Payments" desc="Revenue and commission tracking" accent={CFG.accent} />
          <QuickLink href="/artist/profile" label="Edit Profile" desc="Update bio, links, and style" accent={CFG.accent} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{ background: '#0f0f2a', border: `1px solid ${accent}33`, borderRadius: 10, padding: '1.25rem' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function QuickLink({ href, label, desc, accent }: { href: string; label: string; desc: string; accent: string }) {
  return (
    <Link href={href} style={{ background: '#0f0f2a', border: `1px solid ${accent}22`, borderRadius: 10, padding: '1rem 1.25rem', textDecoration: 'none', color: '#fff', display: 'block' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>{label}</div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{desc}</div>
    </Link>
  );
}
