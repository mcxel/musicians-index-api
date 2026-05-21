/**
 * admin/page.tsx
 * Repo: apps/web/src/app/contest/admin/page.tsx
 * Action: CREATE | Wave: W4
 * REQUIRES: apps/web/src/app/contest/admin/layout.tsx must exist first (it's the auth guard)
 */
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contest Admin | TMI' };

const ADMIN_SECTIONS = [
  { label: 'Contestants',   href: '/contest/admin/contestants', color: '#ff6b1a', desc: 'Review + approve entries' },
  { label: 'Sponsors',      href: '/contest/admin/sponsors',    color: '#00e5ff', desc: 'Verify contributions' },
  { label: 'Reveal',        href: '/contest/admin/reveal',      color: '#ffd700', desc: 'Control winner reveal' },
  { label: 'Seasons',       href: '/contest/admin/seasons',     color: '#00c853', desc: 'Create + manage seasons' },
  { label: 'Payouts',       href: '/contest/admin/payouts',     color: '#c0c0c0', desc: 'Track prize fulfillment' },
  { label: 'Audit Log',     href: '/contest/admin/audit',       color: 'rgba(255,255,255,.5)', desc: 'View all actions' },
];

export default async function ContestAdminPage() {
  // TODO: fetch queue counts from API
  // const [contestantQueue, sponsorQueue] = await Promise.all([
  //   fetch('/api/contest/admin/queue/contestants').then(r => r.json()),
  //   fetch('/api/contest/admin/queue/sponsors').then(r => r.json()),
  // ]);

  return (
    <main style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', margin: '0 0 8px', textTransform: 'uppercase' }}>
          Admin
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px' }}>Contest Control Center</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', margin: '0 0 40px' }}>
          Manage contestants, sponsors, seasons, reveals, and payouts.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {ADMIN_SECTIONS.map(section => (
            <a
              key={section.label}
              href={section.href}
              style={{
                display: 'block', padding: '20px',
                background: '#0d1117',
                border: `1px solid ${section.color}33`,
                borderRadius: 12, textDecoration: 'none',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color .2s',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: section.color }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: section.color, marginBottom: 4 }}>
                {section.label}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{section.desc}</div>
              <div style={{ fontSize: 11, color: section.color, marginTop: 12, fontWeight: 600 }}>
                Manage →
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
