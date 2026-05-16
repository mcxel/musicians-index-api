// Native sponsor tile — same visual weight as editorial content, not a banner.

import Link from 'next/link';

interface SponsorNativeTileProps {
  brand: string;
  tagline: string;
  label?: string;
  accentColor?: string;
  href?: string;
}

export default function SponsorNativeTile({
  brand, tagline, label = 'Presented by', accentColor = '#00FFFF', href = '#',
}: SponsorNativeTileProps) {
  const accent = accentColor;

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
      <div style={{
        borderRadius: 12,
        border: `1px solid ${accent}25`,
        background: `linear-gradient(135deg, ${accent}0a 0%, rgba(5,6,12,0.6) 60%, rgba(10,10,26,0.4) 100%)`,
        padding: '18px 24px',
        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
      }}>
        <div>
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: accent, letterSpacing: '-0.02em', textShadow: `0 0 20px ${accent}50` }}>
            {brand}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{tagline}</div>
        </div>
        <Link href={href} style={{
          fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
          color: accent, border: `1px solid ${accent}40`,
          borderRadius: 6, padding: '7px 16px',
          textDecoration: 'none', textTransform: 'uppercase',
          background: `${accent}0c`, whiteSpace: 'nowrap',
        }}>
          Learn More →
        </Link>
      </div>
    </section>
  );
}
