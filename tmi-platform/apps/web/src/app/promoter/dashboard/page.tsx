import Link from 'next/link';

const CFG = { label: 'Promoter', accent: '#FF6B35', hub: '/hub/promoter', emoji: '📢' };

const STATS = [
  { label: 'Events Hosted', value: '0', sub: 'total events promoted' },
  { label: 'Ticket Sales', value: '0', sub: 'tickets sold' },
  { label: 'Revenue', value: '$0', sub: 'all time earnings' },
  { label: 'Artists Booked', value: '0', sub: 'unique artists' },
];

export default function PromoterDashboardPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#07071a', color: '#fff', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link href={CFG.hub} style={{ color: CFG.accent, textDecoration: 'none', fontSize: 14 }}>
          ← Back to {CFG.label} Hub
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: '1rem' }}>
          {CFG.emoji} Promoter Dashboard
        </h1>
        <p style={{ color: '#888', fontSize: 15, marginBottom: '2rem' }}>Your event promotion overview at a glance.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {STATS.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} accent={CFG.accent} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <QuickLink href="/promoter/events" label="Events" desc="Create and manage your events" accent={CFG.accent} />
          <QuickLink href="/promoter/tickets" label="Tickets" desc="Ticket inventory and sales" accent={CFG.accent} />
          <QuickLink href="/promoter/analytics" label="Analytics" desc="Attendance, revenue, and reach" accent={CFG.accent} />
          <QuickLink href="/promoter/contracts" label="Contracts" desc="Artist and venue agreements" accent={CFG.accent} />
          <QuickLink href="/promoter/payments" label="Payments" desc="Revenue tracking and payouts" accent={CFG.accent} />
          <QuickLink href="/promoter/profile" label="Edit Profile" desc="Update your brand and info" accent={CFG.accent} />
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
