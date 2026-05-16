import { getPublicLaunchSnapshot } from '@/lib/share/PublicLaunchStatusEngine';
import Link from 'next/link';

export default function AdminPublicLaunchPage() {
  const snapshot = getPublicLaunchSnapshot();
  const gates = [
    ['Homepage visibility', snapshot.homepageVisibility],
    ['Magazine visibility', snapshot.magazineVisibility],
    ['Share layer', snapshot.shareLayer],
    ['Metadata layer', snapshot.metadataLayer],
    ['CTA layer', snapshot.ctaLayer],
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0, fontSize: 28 }}>Public Launch Command</h1>
      <p style={{ color: '#9fe', maxWidth: 760 }}>
        Soft-launch readiness view for public homepage, share system, route openness, and metadata
        coverage.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          margin: '20px 0',
        }}
      >
        {gates.map(([name, status]) => (
          <div
            key={String(name)}
            style={{
              border: '1px solid #00ffff44',
              borderRadius: 14,
              padding: 14,
              background: '#0a0a1a',
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: '#9bb',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {name}
            </div>
            <div
              style={{
                marginTop: 6,
                fontWeight: 900,
                color: status === 'PASS' ? '#00ffff' : '#ffcf55',
              }}
            >
              {status}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <Link href="/admin/public-launch/share" style={{ color: '#00ffff' }}>
          Share Diagnostics
        </Link>
        <Link href="/admin/public-launch/metadata" style={{ color: '#00ffff' }}>
          Metadata Diagnostics
        </Link>
        <Link href="/admin/public-launch/routes" style={{ color: '#00ffff' }}>
          Route Diagnostics
        </Link>
      </div>

      <section
        style={{
          border: '1px solid #AA2DFF55',
          borderRadius: 14,
          padding: 16,
          background: '#0b0718',
        }}
      >
        <h2 style={{ marginTop: 0 }}>P0 Public Routes</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {snapshot.routes.map((entry) => (
            <li key={entry.route}>
              <span style={{ color: '#fff' }}>{entry.route}</span>
              <span style={{ color: '#9bb' }}>
                {' '}
                - {entry.status} - {entry.note}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
