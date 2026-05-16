'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface MediaItem {
  id: string;
  title: string;
  type: 'clip' | 'audio';
  duration: string;
  views: number;
  thumbnailUrl?: string;
}

interface MediaStripTileProps {
  media: MediaItem[];
  accentColor: string;
  performerSlug: string;
}

const TYPE_ICON = { clip: '🎬', audio: '🎵' };

export default function MediaStripTile({ media, accentColor, performerSlug }: MediaStripTileProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const accent  = accentColor;
  const FUCHSIA = '#FF2DAA';

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 40px' }}>
      {/* Skewed section header */}
      <div style={{
        display: 'inline-block', marginBottom: 14,
        padding: '5px 18px 5px 14px',
        background: `${FUCHSIA}12`, border: `1px solid ${FUCHSIA}30`,
        clipPath: 'polygon(0 0, 100% 0, 96% 100%, 0 100%)',
        borderRadius: '6px 0 0 6px',
      }}>
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.24em', color: FUCHSIA, textTransform: 'uppercase' }}>
          Media &amp; Clips
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {media.slice(0, 4).map((item, i) => (
          <div
            key={item.id}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              borderRadius: 10,
              border: `1px solid ${hovered === item.id ? FUCHSIA : 'rgba(255,255,255,0.07)'}`,
              background: hovered === item.id ? `${FUCHSIA}08` : 'rgba(255,255,255,0.03)',
              overflow: 'hidden', cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
              clipPath: i % 2 === 0
                ? 'polygon(0 0, 97% 0, 100% 3%, 100% 100%, 0 100%)'
                : 'polygon(3% 0, 100% 0, 100% 100%, 0 100%, 0 3%)',
            }}
          >
            {/* Thumbnail */}
            <div style={{
              height: 100,
              background: item.thumbnailUrl
                ? `url(${item.thumbnailUrl}) center/cover no-repeat`
                : `linear-gradient(135deg, ${accent}12, #0a0a1a)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, position: 'relative',
            }}>
              {!item.thumbnailUrl && TYPE_ICON[item.type]}
              {hovered === item.id && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: FUCHSIA, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#000', fontWeight: 900 }}>
                    ▶
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#fff', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{item.duration}</span>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>{item.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: 10 }}>
        <Link href={`/media?performer=${performerSlug}`} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          All Media →
        </Link>
      </div>
    </section>
  );
}
