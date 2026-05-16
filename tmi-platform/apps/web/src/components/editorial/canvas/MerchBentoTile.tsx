'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface MerchItem {
  id: string;
  name: string;
  type: 'shirt' | 'hoodie' | 'nft' | 'beat' | 'ticket';
  price: string;
  emoji: string;
  route?: string;
}

interface MerchBentoTileProps {
  merch: MerchItem[];
  accentColor: string;
  performerSlug: string;
}

const CLIP_PATHS = [
  'polygon(0 0, 97% 0, 100% 3%, 100% 100%, 0 100%)',
  'polygon(3% 0, 100% 0, 100% 100%, 0 100%, 0 3%)',
  'polygon(0 0, 100% 0, 100% 97%, 97% 100%, 0 100%)',
  'polygon(0 3%, 3% 0, 100% 0, 100% 100%, 0 100%)',
];

export default function MerchBentoTile({ merch, accentColor, performerSlug }: MerchBentoTileProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const GOLD   = '#FFD700';
  const accent = accentColor;

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
      {/* Section label — skewed header */}
      <div style={{
        display: 'inline-block', marginBottom: 14,
        padding: '5px 18px 5px 14px',
        background: `${accent}14`,
        border: `1px solid ${accent}35`,
        clipPath: 'polygon(0 0, 100% 0, 96% 100%, 0 100%)',
        borderRadius: '6px 0 0 6px',
      }}>
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.24em', color: accent, textTransform: 'uppercase' }}>
          Merch &amp; Store
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {merch.slice(0, 4).map((item, i) => (
          <div
            key={item.id}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              borderRadius: 12,
              border: `1px solid ${hovered === item.id ? accent : 'rgba(255,255,255,0.08)'}`,
              background: hovered === item.id ? `${accent}0c` : 'rgba(255,255,255,0.03)',
              padding: 16, cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              boxShadow: hovered === item.id ? `0 0 20px ${accent}25` : 'none',
              clipPath: CLIP_PATHS[i % CLIP_PATHS.length],
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: 160,
            }}
          >
            <div>
              <div style={{ fontSize: 32, marginBottom: 8, lineHeight: 1 }}>{item.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
              <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{item.type}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 900, color: GOLD }}>{item.price}</span>
              <Link
                href={item.route ?? `/store/${performerSlug}`}
                style={{
                  fontSize: 8, fontWeight: 900, letterSpacing: '0.1em',
                  background: hovered === item.id ? accent : 'rgba(255,255,255,0.07)',
                  color: hovered === item.id ? '#000' : 'rgba(255,255,255,0.45)',
                  border: 'none', borderRadius: 6, padding: '5px 12px',
                  textDecoration: 'none', textTransform: 'uppercase',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                Buy
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: 10 }}>
        <Link href={`/store/${performerSlug}`} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Full Store →
        </Link>
      </div>
    </section>
  );
}
