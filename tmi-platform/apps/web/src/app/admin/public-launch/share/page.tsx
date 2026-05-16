import { buildShareUrl } from '@/lib/share/ShareLinkEngine';

const sampleTargets = [
  { title: 'TMI Home', path: '/home/1' },
  { title: 'TMI Magazine', path: '/magazine' },
  { title: 'TMI Events', path: '/events' },
  { title: 'TMI Tickets', path: '/tickets' },
];

export default function AdminPublicLaunchSharePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0, fontSize: 28 }}>Share Diagnostics</h1>
      <p style={{ color: '#9fe', maxWidth: 760 }}>
        Validates deep links and share URLs used by the public share dock.
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        {sampleTargets.map((target) => (
          <div
            key={target.path}
            style={{
              border: '1px solid #00ffff33',
              borderRadius: 12,
              padding: 12,
              background: '#0a0a1a',
            }}
          >
            <div style={{ fontWeight: 800 }}>{target.title}</div>
            <div style={{ color: '#9bb', fontSize: 12 }}>{target.path}</div>
            <div style={{ color: '#00ffff', wordBreak: 'break-all', marginTop: 6 }}>
              {buildShareUrl({
                ...target,
                context: { source: 'admin', medium: 'diagnostic', campaign: 'soft_launch' },
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
