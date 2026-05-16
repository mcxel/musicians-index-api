import Link from 'next/link';

const LEGAL_PAGES = [
  { href: '/legal/content-rights', label: 'Content Rights', color: '#00FFFF', desc: 'Ownership, licensing, and usage rights for uploaded content.' },
  { href: '/legal/contractor', label: 'Contractor Agreement', color: '#fcd34d', desc: 'Terms for contractors, producers, and independent artists.' },
  { href: '/legal/tax-policy', label: 'Tax Policy', color: '#86efac', desc: 'Revenue reporting, withholding, and tax obligations.' },
  { href: '/legal/venue-policy', label: 'Venue Policy', color: '#fb923c', desc: 'Terms governing venue listings, bookings, and events.' },
];

export const metadata = { title: 'Legal — TMI Platform' };

export default function LegalIndexPage() {
  return (
    <main style={{ background: '#050510', minHeight: '100vh', padding: '60px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Legal Center
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 48 }}>
          Review TMI platform policies, agreements, and terms.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {LEGAL_PAGES.map((page) => (
            <Link key={page.href} href={page.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${page.color}33`,
                borderRadius: 12,
                padding: '20px 24px',
                transition: 'border-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: page.color, marginBottom: 4 }}>{page.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{page.desc}</div>
                </div>
                <div style={{ color: page.color, opacity: 0.6, fontSize: 18 }}>→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
