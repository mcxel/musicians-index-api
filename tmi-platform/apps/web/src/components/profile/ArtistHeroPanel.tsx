'use client';
import Link from 'next/link';

/** Artist hero panel — all action buttons are routed; no dead buttons. */
export function ArtistHeroPanel({ slug }: { slug: string }) {
  const actions = [
    {
      label: '⭐ Follow',
      href: `/api/follow?target=${encodeURIComponent(slug)}`,
      style: {
        background: 'linear-gradient(135deg, #FF2DAA, #AA2DFF)',
        color: '#fff',
        border: 'none',
        fontWeight: 900,
        padding: '10px 22px',
        borderRadius: 8,
        fontSize: 12,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        boxShadow: '0 0 18px rgba(255,45,170,0.55)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      },
    },
    {
      label: '🔴 Go Live',
      href: '/go-live',
      style: {
        background: 'rgba(0,255,255,0.08)',
        color: '#00FFFF',
        border: '1px solid rgba(0,255,255,0.4)',
        fontWeight: 800,
        padding: '10px 22px',
        borderRadius: 8,
        fontSize: 12,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      },
    },
    {
      label: '📁 Upload',
      href: `/profile/artist/${encodeURIComponent(slug)}#upload`,
      style: {
        background: 'rgba(255,215,0,0.08)',
        color: '#FFD700',
        border: '1px solid rgba(255,215,0,0.4)',
        fontWeight: 800,
        padding: '10px 22px',
        borderRadius: 8,
        fontSize: 12,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      },
    },
    {
      label: '📅 Book',
      href: `/profile/artist/${encodeURIComponent(slug)}/booking`,
      style: {
        background: 'rgba(170,45,255,0.08)',
        color: '#AA2DFF',
        border: '1px solid rgba(170,45,255,0.4)',
        fontWeight: 800,
        padding: '10px 22px',
        borderRadius: 8,
        fontSize: 12,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      },
    },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(160deg, rgba(5,5,16,0.92), rgba(170,45,255,0.08) 60%, rgba(5,5,16,0.96))',
        borderRadius: 20,
        padding: '24px 28px',
        border: '1px solid rgba(170,45,255,0.22)',
        boxShadow: '0 20px 60px rgba(170,45,255,0.18)',
      }}
    >
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
        {[
          { num: '—', label: 'Followers' },
          { num: '—', label: 'Cypher Wins' },
          { num: '—', label: 'Revenue' },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-orbitron, monospace)' }}>{s.num}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons — all routed */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {actions.map((action) => (
          <Link key={action.label} href={action.href} style={{ textDecoration: 'none' }}>
            <button
              style={action.style as React.CSSProperties}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              {action.label}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
