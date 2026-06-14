'use client';

export interface SponsorRailProps {
  sponsors?: Array<{ id: string; name: string; logoUrl?: string; tagline?: string }>;
  zone?: string;
  className?: string;
}

export default function SponsorRail({ sponsors = [], zone = 'rail', className = '' }: SponsorRailProps) {
  if (sponsors.length === 0) return null;

  // Triple for seamless infinite scroll
  const items = [...sponsors, ...sponsors, ...sponsors];

  return (
    <aside
      className={className}
      data-sponsor-zone={zone}
      aria-label="Sponsors"
      style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(90deg, rgba(5,5,16,0) 0%, rgba(170,45,255,0.06) 30%, rgba(0,255,255,0.04) 70%, rgba(5,5,16,0) 100%)',
        borderTop: '1px solid rgba(170,45,255,0.18)',
        borderBottom: '1px solid rgba(0,255,255,0.15)',
        padding: '5px 0',
      }}
    >
      {/* Left fade */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 64,
        background: 'linear-gradient(90deg, #050510 0%, transparent 100%)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      {/* Right fade */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 64,
        background: 'linear-gradient(270deg, #050510 0%, transparent 100%)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* Scrolling strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: 'max-content',
        animation: 'sponsorRailScroll 24s linear infinite',
        gap: 0,
      }}>
        {items.map((s, i) => (
          <div key={`${s.id}-${i}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 28px',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            <span style={{ color: '#FFD700', fontSize: 8, lineHeight: 1 }}>◆</span>
            <span style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              fontFamily: "'Inter', sans-serif",
            }}>
              {s.name}
            </span>
            {s.tagline && (
              <span style={{
                fontSize: 8,
                color: 'rgba(0,255,255,0.45)',
                fontStyle: 'italic',
                fontFamily: "'Inter', sans-serif",
                marginLeft: 2,
              }}>
                {s.tagline}
              </span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes sponsorRailScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </aside>
  );
}
