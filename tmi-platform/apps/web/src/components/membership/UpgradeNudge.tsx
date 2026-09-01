'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TIER_CAPACITY, type PerformerTier } from '@/lib/commerce/SponsorshipCapacityEngine';
import { getSubscriptionProduct, SUBSCRIPTION_TIER_ORDER, type SubscriptionTierKey } from '@/lib/stripe/products';

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

// Real price/priceId/checkout URL for every tier are built from the
// canonical registry (@/lib/stripe/products.ts), not hand-maintained here —
// this component previously used literal placeholder price IDs
// (`price_fan_ruby`, etc.) that would have failed at Stripe outright had a
// real checkout ever been attempted through it (Lane A A8, 2026-09-01).
const TIER_ORDER: MemberTier[] = ['FREE', ...SUBSCRIPTION_TIER_ORDER];

const TIER_COLORS: Record<MemberTier, string> = {
  FREE:            'rgba(255,255,255,0.3)',
  PRO:             '#FF6B35',
  RUBY:            '#FF4444',
  SILVER:          '#C0C0C0',
  GOLD:            '#FFD700',
  PLATINUM:        '#AA2DFF',
  DIAMOND:         '#00FF88',
  FOUNDER_DIAMOND: '#00FF88',
};

function buildTierPrices(accountType: 'fan' | 'performer'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const tier of SUBSCRIPTION_TIER_ORDER) {
    out[tier] = `$${(getSubscriptionProduct(accountType, tier).price / 100).toFixed(2)}/mo`;
  }
  return out;
}

function buildTierCheckout(accountType: 'fan' | 'performer', productLabel: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const tier of SUBSCRIPTION_TIER_ORDER) {
    const product = getSubscriptionProduct(accountType, tier);
    const params = new URLSearchParams({
      priceId: product.priceId,
      mode: 'subscription',
      amount: String(product.price),
      productName: `TMI ${productLabel} ${tier}`,
    });
    out[tier] = `/api/stripe/checkout?${params.toString()}`;
  }
  return out;
}

const FAN_TIER_PRICES = buildTierPrices('fan');
const FAN_TIER_CHECKOUT = buildTierCheckout('fan', 'Fan');

const PERFORMER_TIER_PRICES = buildTierPrices('performer');
const PERFORMER_TIER_CHECKOUT = buildTierCheckout('performer', 'Performer');

const TIER_PERKS: Record<string, string[]> = {
  PRO:      ['All live rooms', 'Chat + reactions', 'Tip performers', 'Monthly magazine', 'XP + achievements'],
  RUBY:     ['Everything in Pro', 'Early access drops', 'Fan leaderboard placement', 'Ruby avatar glow'],
  SILVER:   ['Everything in Ruby', 'Early access drops', 'Leaderboard placement', 'Silver avatar glow'],
  GOLD:     ['Everything in Silver', 'Exclusive rooms', 'Gold avatar glow', 'Priority drops'],
  PLATINUM: ['Everything in Gold', 'Backstage passes', 'Direct artist DMs', 'Platinum badge'],
  DIAMOND:  ['All Platinum perks', 'NFT access', 'VIP front-row seats', 'Diamond avatar glow'],
};

const PERFORMER_PERKS: Record<string, string[]> = {
  PRO:      ['Go live anytime', 'Beat marketplace access', 'Booking requests', 'Analytics dashboard'],
  RUBY:     ['Everything in Pro', 'Fan club tools', 'Tipping enabled', 'Ruby badge'],
  SILVER:   ['Everything in Ruby', 'Fan club tools', 'Tipping enabled', 'Merch store access'],
  GOLD:     ['Everything in Silver', 'Priority placement', 'Billboard rotation', 'Gold badge'],
  PLATINUM: ['Everything in Gold', 'NFT minting', 'Unlimited uploads', 'Tour booking tools'],
  DIAMOND:  ['All Platinum perks', 'Priority booking', 'Full revenue split', 'Diamond badge'],
};

export default function UpgradeNudge({ currentTier, role, displayName }: UpgradeNudgeProps) {
  const [dismissed, setDismissed] = useState(false);

  // Never show for Founding Diamond or Diamond
  if (dismissed || currentTier === 'FOUNDER_DIAMOND' || currentTier === 'DIAMOND') return null;

  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const nextTiers = TIER_ORDER.slice(currentIdx + 1);
  if (nextTiers.length === 0) return null;

  const nextTier = nextTiers[0];
  const skipTier = nextTiers[1];
  const prices = role === 'PERFORMER' || role === 'BAND' ? PERFORMER_TIER_PRICES : FAN_TIER_PRICES;
  const checkouts = role === 'PERFORMER' || role === 'BAND' ? PERFORMER_TIER_CHECKOUT : FAN_TIER_CHECKOUT;
  const perks = role === 'PERFORMER' || role === 'BAND' ? PERFORMER_PERKS : TIER_PERKS;

  const currentColor = TIER_COLORS[currentTier];
  const nextColor = TIER_COLORS[nextTier as MemberTier] ?? '#AA2DFF';

  return (
    <div style={{
      background: 'rgba(5,5,16,0.96)',
      border: `1px solid ${nextColor}30`,
      borderRadius: 14,
      padding: '20px 22px',
      fontFamily: "'Inter',sans-serif",
      position: 'relative',
    }}>
      {/* Dismiss */}
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

      {/* Current status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: currentColor, boxShadow: `0 0 6px ${currentColor}`, flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: currentColor, textTransform: 'uppercase' }}>
          {currentTier === 'FREE' ? 'FREE' : `${currentTier} ${role}`}
          {displayName ? ` · ${displayName}` : ''}
        </span>
      </div>

      {/* Next tier pitch */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
          Unlock more with{' '}
          <span style={{ color: nextColor }}>{nextTier} {role}</span>
          {prices[nextTier] ? ` — ${prices[nextTier]}` : ''}
        </div>

        {/* Sponsor slot hook for performers */}
        {(role === 'PERFORMER' || role === 'BAND') && (() => {
          const curTier = currentTier.toLowerCase() as PerformerTier;
          const nxtTier = nextTier.toLowerCase() as PerformerTier;
          const curCap = TIER_CAPACITY[curTier] ?? TIER_CAPACITY['free'];
          const nxtCap = TIER_CAPACITY[nxtTier] ?? curCap;
          const gain = nxtCap.local - curCap.local;
          return (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 6, marginBottom: 8,
              background: `${nextColor}10`, border: `1px solid ${nextColor}30`,
            }}>
              <span style={{ fontSize: 16 }}>💼</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: nextColor }}>
                  +{gain} more sponsor slots
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                  {nxtCap.local} Local + {nxtCap.major} Major at {nextTier}
                </div>
              </div>
            </div>
          );
        })()}

        {perks[nextTier] && (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
            {perks[nextTier].map((p) => (
              <li key={p} style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ color: nextColor, fontSize: 9, fontWeight: 900 }}>✓</span>{p}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {checkouts[nextTier] && (
          <Link
            href={checkouts[nextTier]}
            style={{
              padding: '9px 18px', borderRadius: 7, fontSize: 10, fontWeight: 900,
              background: nextColor, color: '#050510', textDecoration: 'none', letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}
          >
            UPGRADE TO {nextTier}
          </Link>
        )}
        {skipTier && checkouts[skipTier] && (
          <Link
            href={checkouts[skipTier]}
            style={{
              padding: '9px 14px', borderRadius: 7, fontSize: 10, fontWeight: 700,
              background: 'transparent', border: `1px solid ${TIER_COLORS[skipTier as MemberTier] ?? '#fff'}40`,
              color: TIER_COLORS[skipTier as MemberTier] ?? 'rgba(255,255,255,0.5)',
              textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap',
            }}
          >
            OR JUMP TO {skipTier} {prices[skipTier] ? `(${prices[skipTier]})` : ''}
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
          Stay on {currentTier === 'FREE' ? 'Free' : currentTier}
        </button>
        <Link href="/pricing" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', marginLeft: 4 }}>
          View all plans →
        </Link>
      </div>
    </div>
  );
}
