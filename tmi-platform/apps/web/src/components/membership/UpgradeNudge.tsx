'use client';

/**
 * Role-aware upgrade nudge — amounts from STRIPE_PRODUCTS only.
 * Copy: "Upgrade from $2.99/mo" (Performer) / "Upgrade from $4.99/mo" (Fan).
 * Flow: nudge → /pricing (canonical ascending ladder) → real checkout.
 * No POPULAR / urgency badges. Session dismiss only (no coercion).
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  getSubscriptionOffersLowestFirst,
  getSubscriptionProduct,
  SUBSCRIPTION_TIER_ORDER,
  type SubscriptionTierKey,
} from '@/lib/stripe/products';

export type MemberTier =
  | 'FREE'
  | 'PRO'
  | 'RUBY'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND'
  | 'FOUNDER_DIAMOND';

export type MemberRole = 'FAN' | 'PERFORMER' | 'BAND';

interface UpgradeNudgeProps {
  currentTier: MemberTier;
  role: MemberRole;
  displayName?: string;
}

const TIER_ORDER: MemberTier[] = ['FREE', ...SUBSCRIPTION_TIER_ORDER];

const TIER_COLORS: Record<MemberTier, string> = {
  FREE: 'rgba(255,255,255,0.3)',
  PRO: '#FF6B35',
  RUBY: '#FF4444',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  PLATINUM: '#AA2DFF',
  DIAMOND: '#00FF88',
  FOUNDER_DIAMOND: '#00FF88',
};

function accountTypeFor(role: MemberRole): 'fan' | 'performer' {
  return role === 'FAN' ? 'fan' : 'performer';
}

function entryProCents(role: MemberRole): number {
  return getSubscriptionProduct(accountTypeFor(role), 'PRO').price;
}

function formatMo(cents: number): string {
  return `$${(cents / 100).toFixed(2)}/mo`;
}

export default function UpgradeNudge({ currentTier, role, displayName }: UpgradeNudgeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || currentTier === 'FOUNDER_DIAMOND' || currentTier === 'DIAMOND') return null;

  const accountType = accountTypeFor(role);
  const offers = getSubscriptionOffersLowestFirst(accountType).filter((o) => o.tier !== 'FREE');
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const eligible = offers.filter((o) => {
    const idx = TIER_ORDER.indexOf(o.tier as MemberTier);
    return idx > currentIdx;
  });
  if (eligible.length === 0) return null;

  const entryCents = entryProCents(role);
  const entryLabel = `Upgrade from ${formatMo(entryCents)}`;
  const accent = TIER_COLORS[eligible[0].tier as MemberTier] ?? '#AA2DFF';
  const currentColor = TIER_COLORS[currentTier];
  const pricingHref = `/pricing?role=${accountType}`;

  return (
    <div
      data-upgrade-nudge="role-aware"
      data-upgrade-from-cents={entryCents}
      style={{
        background: 'rgba(5,5,16,0.96)',
        border: `1px solid ${accent}30`,
        borderRadius: 14,
        padding: '20px 22px',
        fontFamily: "'Inter',sans-serif",
        position: 'relative',
      }}
    >
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss upgrade suggestion"
        style={{
          position: 'absolute', top: 12, right: 14,
          background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0,
        }}
      >
        ×
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: currentColor, boxShadow: `0 0 6px ${currentColor}`, flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: currentColor, textTransform: 'uppercase' }}>
          {currentTier === 'FREE' ? 'FREE' : `${currentTier} ${role}`}
          {displayName ? ` · ${displayName}` : ''}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{entryLabel}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.45 }}>
          See every eligible plan lowest-price first, then checkout when you&apos;re ready.
        </div>
      </div>

      <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {eligible.slice(0, 4).map((o) => (
          <li
            key={o.id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 11, color: 'rgba(255,255,255,0.65)',
              borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 4,
            }}
          >
            <span style={{ fontWeight: 700, color: TIER_COLORS[o.tier as MemberTier] ?? '#fff' }}>{o.name}</span>
            <span>{formatMo(o.priceCents)}</span>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link
          href={pricingHref}
          style={{
            padding: '9px 18px', borderRadius: 7, fontSize: 10, fontWeight: 900,
            background: accent, color: '#050510', textDecoration: 'none', letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}
        >
          VIEW PLANS
        </Link>
        {eligible[0]?.priceId && (
          <Link
            href={`/api/stripe/checkout?priceId=${encodeURIComponent(eligible[0].priceId)}&mode=subscription&amount=${eligible[0].priceCents}&productName=${encodeURIComponent(eligible[0].name)}`}
            style={{
              padding: '9px 14px', borderRadius: 7, fontSize: 10, fontWeight: 700,
              background: 'transparent', border: `1px solid ${accent}40`,
              color: accent, textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap',
            }}
          >
            CHECKOUT {String(eligible[0].tier)} ({formatMo(eligible[0].priceCents)})
          </Link>
        )}
        <button
          onClick={() => setDismissed(true)}
          style={{
            padding: '9px 14px', borderRadius: 7, fontSize: 10, fontWeight: 600,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.3)', cursor: 'pointer', letterSpacing: '0.06em',
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
