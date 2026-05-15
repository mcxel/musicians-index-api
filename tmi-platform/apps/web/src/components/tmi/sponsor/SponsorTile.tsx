/**
 * SponsorTile.tsx
 * Purpose: Animated sponsor placement widget — profile rails, event banners, magazine inserts.
 * Placement: apps/web/src/components/sponsor/SponsorTile.tsx
 * Depends on: tmi-theme.css
 */

'use client';

import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';

import React, { useState } from 'react';

export type SponsorTileVariant = 'PROFILE_RAIL' | 'EVENT_BANNER' | 'MAGAZINE_INSERT' | 'CONTEST_PRIZE' | 'BUMPER';

interface SponsorTileProps {
  sponsorName: string;
  logoUrl?: string;
  tagline?: string;
  clickUrl?: string;
  variant?: SponsorTileVariant;
  prizeDescription?: string;    // for CONTEST_PRIZE variant
  isSponsoredContent?: boolean; // show "Sponsored" label
  onImpression?: () => void;
  onClickThrough?: () => void;
  className?: string;
}

export const SponsorTile: React.FC<SponsorTileProps> = ({
  sponsorName,
  logoUrl,
  tagline,
  clickUrl,
  variant = 'PROFILE_RAIL',
  prizeDescription,
  isSponsoredContent = true,
  onImpression,
  onClickThrough,
  className = '',
}) => {
  const [hovered, setHovered] = useState(false);

  React.useEffect(() => { onImpression?.(); }, []);

  const handleClick = () => {
    onClickThrough?.();
    if (clickUrl) window.open(clickUrl, '_blank', 'noopener');
  };

  return (
    <>
      <style>{`
        .st-root {
          position: relative;
          cursor: ${clickUrl ? 'pointer' : 'default'};
          transition: all 0.2s ease;
          border-radius: 10px;
          overflow: hidden;
        }
        .st-root:hover { transform: translateY(-1px); }

        /* PROFILE_RAIL */
        .st-profile-rail {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(11,11,30,0.95) 100%);
          border: 1px solid rgba(255,215,0,0.2);
        }
        .st-profile-rail:hover {
          border-color: rgba(255,215,0,0.5);
          box-shadow: 0 0 12px rgba(255,215,0,0.15);
        }
        .st-rail-logo {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: contain;
          background: rgba(255,215,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .st-rail-text {}
        .st-rail-name {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #FFD700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .st-rail-tagline {
          font-family: system-ui, sans-serif;
          font-size: 10px;
          color: rgba(255,255,255,0.55);
          margin-top: 1px;
        }

        /* EVENT_BANNER */
        .st-event-banner {
          width: 100%;
          padding: 8px 16px;
          background: linear-gradient(90deg, rgba(255,215,0,0.08) 0%, rgba(11,11,30,0.9) 50%, rgba(255,215,0,0.08) 100%);
          border-top: 1px solid rgba(255,215,0,0.15);
          border-bottom: 1px solid rgba(255,215,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .st-event-banner .st-sponsor-label {
          font-size: 9px;
          color: rgba(255,215,0,0.6);
          letter-spacing: 2px;
        }
        .st-event-banner .st-sponsor-name {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          font-weight: 700;
          color: #FFD700;
          text-transform: uppercase;
          letter-spacing: 2px;
          animation: st-shimmer 3s infinite;
          background: linear-gradient(90deg, #FFD700 0%, #FFFFFF 50%, #FFD700 100%);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* MAGAZINE_INSERT */
        .st-magazine-insert {
          padding: 20px;
          background: linear-gradient(135deg, rgba(255,215,0,0.04) 0%, rgba(11,11,30,0.98) 100%);
          border: 1px solid rgba(255,215,0,0.18);
          text-align: center;
        }
        .st-magazine-insert .st-mag-logo {
          height: 60px;
          margin: 0 auto 12px;
          object-fit: contain;
        }
        .st-magazine-insert .st-mag-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          line-height: 1.4;
          margin-bottom: 10px;
        }
        .st-magazine-insert .st-mag-cta {
          display: inline-block;
          padding: 6px 16px;
          border: 1px solid rgba(255,215,0,0.4);
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFD700;
        }

        /* CONTEST_PRIZE */
        .st-contest-prize {
          padding: 16px;
          background: linear-gradient(135deg, rgba(255,45,170,0.08) 0%, rgba(11,11,30,0.95) 100%);
          border: 1px solid rgba(255,45,170,0.25);
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .st-prize-icon {
          font-size: 32px;
          flex-shrink: 0;
        }
        .st-prize-text {}
        .st-prize-label {
          font-family: 'Courier New', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: #FF2DAA;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .st-prize-sponsor {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          font-weight: 700;
          color: #FFD700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .st-prize-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.65);
          margin-top: 2px;
        }

        /* BUMPER */
        .st-bumper {
          width: 100%;
          padding: 12px 24px;
          background: rgba(11,11,30,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(255,215,0,0.15);
        }
        .st-bumper-text {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 1px;
        }
        .st-bumper-name {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 1px;
        }

        .st-sponsored-badge {
          position: absolute;
          top: 4px;
          right: 6px;
          font-family: 'Courier New', monospace;
          font-size: 8px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
        }

        @keyframes st-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      {variant === 'PROFILE_RAIL' && (
        <div className={`st-root st-profile-rail ${className}`} onClick={handleClick}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          {isSponsoredContent && <div className="st-sponsored-badge">Sponsored</div>}
          <div className="st-rail-logo">
            {logoUrl ? <ImageSlotWrapper imageId="img-cy2p1i" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} /> : '🏢'}
          </div>
          <div className="st-rail-text">
            <div className="st-rail-name">{sponsorName}</div>
            {tagline && <div className="st-rail-tagline">{tagline}</div>}
          </div>
          {clickUrl && <div style={{ marginLeft: 'auto', color: '#FFD700', fontSize: 12, opacity: hovered ? 1 : 0.4 }}>›</div>}
        </div>
      )}

      {variant === 'EVENT_BANNER' && (
        <div className={`st-root st-event-banner ${className}`} onClick={handleClick}>
          <span className="st-sponsor-label">POWERED BY</span>
          {logoUrl && <ImageSlotWrapper imageId="img-mh3n2e" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />}
          <span className="st-sponsor-name">{sponsorName}</span>
          {tagline && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>— {tagline}</span>}
        </div>
      )}

      {variant === 'MAGAZINE_INSERT' && (
        <div className={`st-root st-magazine-insert ${className}`} onClick={handleClick}>
          {isSponsoredContent && <div className="st-sponsored-badge">Advertisement</div>}
          {logoUrl
            ? <ImageSlotWrapper imageId="img-rnjuee" roomId="runtime-surface" priority="normal" className="st-mag-logo" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
            : <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
          }
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 16, fontWeight: 700, color: '#FFD700', marginBottom: 8, letterSpacing: 2 }}>
            {sponsorName}
          </div>
          {tagline && <div className="st-mag-tagline">{tagline}</div>}
          {clickUrl && <div className="st-mag-cta">Learn More →</div>}
        </div>
      )}

      {variant === 'CONTEST_PRIZE' && (
        <div className={`st-root st-contest-prize ${className}`}>
          <div className="st-prize-icon">🏆</div>
          <div className="st-prize-text">
            <div className="st-prize-label">Prize Sponsor</div>
            <div className="st-prize-sponsor">{sponsorName}</div>
            {prizeDescription && <div className="st-prize-desc">{prizeDescription}</div>}
          </div>
        </div>
      )}

      {variant === 'BUMPER' && (
        <div className={`st-root st-bumper ${className}`}>
          {logoUrl && <ImageSlotWrapper imageId="img-faad78" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />}
          <span className="st-bumper-text">Sponsored by</span>
          <span className="st-bumper-name">{sponsorName}</span>
          {tagline && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>· {tagline}</span>}
        </div>
      )}
    </>
  );
};

export default SponsorTile;
