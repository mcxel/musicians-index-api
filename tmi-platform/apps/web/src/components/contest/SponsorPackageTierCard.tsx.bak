/**
 * SponsorPackageTierCard.tsx
 * TMI Grand Platform Contest — Sponsor Package Tier Cards
 * BerntoutGlobal XXL
 *
 * Repo path: apps/web/src/components/contest/SponsorPackageTierCard.tsx
 */

'use client';

import { Check, Star, Crown, Zap } from 'lucide-react';

type PackageTier = 'local-bronze' | 'local-silver' | 'local-gold' | 'major-bronze' | 'major-silver' | 'major-gold' | 'title';

interface SponsorPackage {
  id: PackageTier;
  label: string;
  type: 'local' | 'major';
  price: number;
  tier: 'bronze' | 'silver' | 'gold' | 'title';
  benefits: string[];
}

const PACKAGES: SponsorPackage[] = [
  {
    id: 'local-bronze',
    label: 'Local Bronze',
    type: 'local',
    price: 50,
    tier: 'bronze',
    benefits: ['Name on artist profile', 'Contest entry acknowledgment'],
  },
  {
    id: 'local-silver',
    label: 'Local Silver',
    type: 'local',
    price: 100,
    tier: 'silver',
    benefits: ['Name + logo on artist profile', 'Contest entry acknowledgment', 'Fan page visibility'],
  },
  {
    id: 'local-gold',
    label: 'Local Gold',
    type: 'local',
    price: 250,
    tier: 'gold',
    benefits: ['Logo + profile placement', 'Stage mention during performance', 'Fan page visibility', 'Sponsor analytics'],
  },
  {
    id: 'major-bronze',
    label: 'Major Bronze',
    type: 'major',
    price: 1000,
    tier: 'bronze',
    benefits: ['Logo + profile placement', 'Stage mention', 'Sponsor analytics dashboard', 'Brand safety controls'],
  },
  {
    id: 'major-silver',
    label: 'Major Silver',
    type: 'major',
    price: 5000,
    tier: 'silver',
    benefits: ['Logo + stage overlay', 'Priority stage mention', 'Deep analytics', 'Fan page featured placement', 'Email spotlight'],
  },
  {
    id: 'major-gold',
    label: 'Major Gold',
    type: 'major',
    price: 10000,
    tier: 'gold',
    benefits: ['All surfaces placement', 'Pre-performance sponsor slate', 'Priority everything', 'Full analytics access', 'Monthly sponsor report'],
  },
  {
    id: 'title',
    label: 'Title Sponsor',
    type: 'major',
    price: 25000,
    tier: 'title',
    benefits: ['Full naming rights', 'Exclusive overlays', 'All surfaces exclusive', 'Co-branding on contest', 'Live event sponsor stage', 'Season archive permanent placement', 'Direct analytics API'],
  },
];

const TIER_COLORS = {
  bronze: { color: '#cd7f32', glow: 'rgba(205,127,50,0.2)', border: 'rgba(205,127,50,0.3)' },
  silver: { color: '#c0c0c0', glow: 'rgba(192,192,192,0.15)', border: 'rgba(192,192,192,0.3)' },
  gold: { color: '#ffd700', glow: 'rgba(255,215,0,0.2)', border: 'rgba(255,215,0,0.35)' },
  title: { color: '#00e5ff', glow: 'rgba(0,229,255,0.2)', border: 'rgba(0,229,255,0.4)' },
};

interface SponsorPackageTierCardProps {
  packageId?: PackageTier;
  showAll?: boolean;
  filterType?: 'local' | 'major' | 'all';
  selected?: PackageTier;
  onSelect?: (pkg: SponsorPackage) => void;
  highlighted?: PackageTier;
}

function PackageCard({
  pkg,
  selected,
  highlighted,
  onSelect,
}: {
  pkg: SponsorPackage;
  selected?: PackageTier;
  highlighted?: PackageTier;
  onSelect?: (pkg: SponsorPackage) => void;
}) {
  const colors = TIER_COLORS[pkg.tier];
  const isSelected = selected === pkg.id;
  const isHighlighted = highlighted === pkg.id;

  const TierIcon = pkg.tier === 'title' ? Crown : pkg.tier === 'gold' ? Star : Zap;

  return (
    <div
      className={`pkg-card ${isSelected ? 'pkg-selected' : ''} ${isHighlighted ? 'pkg-highlighted' : ''}`}
      style={{
        '--tier-color': colors.color,
        '--tier-glow': colors.glow,
        '--tier-border': colors.border,
      } as React.CSSProperties}
      onClick={() => onSelect?.(pkg)}
    >
      {pkg.tier === 'title' && (
        <div className="pkg-popular-badge">MOST EXCLUSIVE</div>
      )}
      {isHighlighted && pkg.tier !== 'title' && (
        <div className="pkg-popular-badge">POPULAR</div>
      )}

      <div className="pkg-header">
        <div className="pkg-type-badge">
          {pkg.type.toUpperCase()}
        </div>
        <TierIcon size={16} className="pkg-tier-icon" />
      </div>

      <h3 className="pkg-label">{pkg.label}</h3>
      <div className="pkg-price">
        <span className="price-dollar">$</span>
        <span className="price-amount">{pkg.price.toLocaleString()}</span>
      </div>

      <ul className="pkg-benefits">
        {pkg.benefits.map((b) => (
          <li key={b} className="benefit-item">
            <Check size={12} className="benefit-check" />
            {b}
          </li>
        ))}
      </ul>

      {onSelect && (
        <button className="pkg-cta">
          {isSelected ? '✓ Selected' : 'Choose Package'}
        </button>
      )}

      <style jsx>{`
        .pkg-card {
          position: relative;
          background: #0d1117;
          border: 1px solid var(--tier-border);
          border-radius: 14px;
          padding: 24px;
          cursor: ${onSelect ? 'pointer' : 'default'};
          transition: all 0.25s;
          overflow: hidden;
        }

        .pkg-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--tier-color);
          opacity: 0.7;
        }

        .pkg-card:hover {
          background: var(--tier-glow);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px var(--tier-glow);
        }

        .pkg-selected {
          background: var(--tier-glow) !important;
          border-color: var(--tier-color) !important;
          box-shadow: 0 0 0 2px var(--tier-color);
        }

        .pkg-highlighted {
          border-color: var(--tier-color);
        }

        .pkg-popular-badge {
          position: absolute;
          top: -1px;
          right: 16px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #000;
          background: var(--tier-color);
          padding: 4px 10px;
          border-radius: 0 0 6px 6px;
        }

        .pkg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .pkg-type-badge {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--tier-color);
          background: rgba(var(--tier-color), 0.08);
          border: 1px solid var(--tier-border);
          padding: 3px 8px;
          border-radius: 4px;
        }

        .pkg-tier-icon { color: var(--tier-color); }

        .pkg-label {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
        }

        .pkg-price {
          display: flex;
          align-items: baseline;
          gap: 2px;
          margin-bottom: 20px;
        }

        .price-dollar {
          font-size: 16px;
          color: var(--tier-color);
          font-weight: 600;
        }

        .price-amount {
          font-size: 32px;
          font-weight: 900;
          color: var(--tier-color);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .pkg-benefits {
          list-style: none;
          margin: 0 0 20px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
        }

        .benefit-check { color: var(--tier-color); flex-shrink: 0; }

        .pkg-cta {
          width: 100%;
          padding: 11px;
          background: var(--tier-color);
          border: none;
          border-radius: 8px;
          color: #000;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .pkg-cta:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}

export function SponsorPackageTierCard({
  packageId,
  showAll = false,
  filterType = 'all',
  selected,
  onSelect,
  highlighted,
}: SponsorPackageTierCardProps) {
  const displayed = packageId
    ? PACKAGES.filter((p) => p.id === packageId)
    : showAll
    ? filterType === 'all' ? PACKAGES : PACKAGES.filter((p) => p.type === filterType)
    : PACKAGES;

  if (displayed.length === 1) {
    return (
      <PackageCard
        pkg={displayed[0]}
        selected={selected}
        highlighted={highlighted}
        onSelect={onSelect}
      />
    );
  }

  return (
    <div className="packages-grid">
      {displayed.map((pkg) => (
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          selected={selected}
          highlighted={highlighted}
          onSelect={onSelect}
        />
      ))}
      <style jsx>{`
        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
      `}</style>
    </div>
  );
}

export default SponsorPackageTierCard;
