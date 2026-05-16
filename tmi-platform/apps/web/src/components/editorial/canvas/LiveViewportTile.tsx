'use client';

import Link from 'next/link';

interface LiveViewportTileProps {
  displayName: string;
  headline: string;
  genre: string;
  rank: number;
  isLive: boolean;
  heroImage?: string;
  accentColor: string;
  liveRoomId?: string;
}

export default function LiveViewportTile({
  displayName, headline, genre, rank, isLive, heroImage, accentColor, liveRoomId = 'cypher-arena',
}: LiveViewportTileProps) {
  const FUCHSIA = '#FF2DAA';
  const accent  = accentColor;

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 0' }}>
      <div style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        border: `2px solid ${accent}`,
        boxShadow: `0 0 60px ${accent}25, 0 0 120px ${accent}10, inset 0 0 80px rgba(0,0,0,0.7)`,
        clipPath: 'polygon(0 0, 100% 0, 100% 93%, 96% 100%, 0 100%)',
        background: heroImage
          ? `url(${heroImage}) center/cover no-repeat`
          : `linear-gradient(135deg, ${accent}18 0%, #0a0a1a 55%, ${FUCHSIA}08 100%)`,
        minHeight: 360,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: 24,
      }}>
        {/* Vignette overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,6,12,0.3) 0%, transparent 40%, rgba(5,6,12,0.75) 100%)', pointerEvents: 'none' }} />
        {/* Scan-line texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)', pointerEvents: 'none' }} />

        {/* Top badges */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {isLive ? (
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', background: FUCHSIA, color: '#fff', borderRadius: 4, padding: '3px 10px', textTransform: 'uppercase' }}>
                ● LIVE NOW
              </span>
            ) : (
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.45)', borderRadius: 4, padding: '3px 10px', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.1)' }}>
                Replay Available
              </span>
            )}
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', background: `${accent}18`, color: accent, borderRadius: 4, padding: '3px 10px', textTransform: 'uppercase', border: `1px solid ${accent}35` }}>
              {genre}
            </span>
          </div>

          {/* Watch Live button */}
          <Link href={`/live/rooms/${liveRoomId}`} style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '0.06em',
            background: `linear-gradient(135deg, ${accent}, ${FUCHSIA})`,
            color: '#000', borderRadius: 8, padding: '8px 20px',
            textDecoration: 'none', textTransform: 'uppercase',
            boxShadow: `0 0 20px ${accent}60, 0 4px 12px rgba(0,0,0,0.4)`,
            display: 'inline-block',
          }}>
            {isLive ? 'Watch Live →' : 'View Stage →'}
          </Link>
        </div>

        {/* Bottom identity */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em', textShadow: `0 0 40px ${accent}70, 0 2px 4px rgba(0,0,0,0.8)` }}>
              {displayName}
            </h1>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#FFD700', fontFamily: 'monospace', letterSpacing: '0.04em', textShadow: '0 0 12px rgba(255,215,0,0.6)' }}>
              #{rank}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, fontStyle: 'italic', lineHeight: 1.5, maxWidth: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {headline}
          </p>
        </div>
      </div>
    </section>
  );
}
