'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TIER_CAPACITY, type PerformerTier } from '@/lib/commerce/SponsorshipCapacityEngine';

export type MemberTier =
  | 'FREE'
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

const TIER_ORDER: MemberTier[] = ['FREE', 'RUBY', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

const TIER_COLORS: Record<MemberTier, string> = {
  FREE:            'rgba(255,255,255,0.3)',
  RUBY:            '#FF4444',
  SILVER:          '#C0C0C0',
  GOLD:            '#FFD700',
  PLATINUM:        '#AA2DFF',
  DIAMOND:         '#00FF88',
  FOUNDER_DIAMOND: '#00FF88',
};

const FAN_TIER_PRICES: Record<string, string> = {
  RUBY: '$4.99/mo', SILVER: '$9.99/mo', GOLD: '$14.99/mo',
  PLATINUM: '$24.99/mo', DIAMOND: '$49.99/mo',
};
const FAN_TIER_CHECKOUT: Record<string, string> = {
  RUBY:     '/api/stripe/checkout?priceId=price_fan_ruby&mode=subscription&amount=499&productName=TMI+Fan+Ruby',
  SILVER:   '/api/stripe/checkout?priceId=price_fan_silver&mode=subscription&amount=999&productName=TMI+Fan+Silver',
  GOLD:     '/api/stripe/checkout?priceId=price_fan_gold&mode=subscription&amount=1499&productName=TMI+Fan+Gold',
  PLATINUM: '/api/stripe/checkout?priceId=price_fan_platinum&mode=subscription&amount=2499&productName=TMI+Fan+Platinum',
  DIAMOND:  '/api/stripe/checkout?priceId=price_fan_diamond&mode=subscription&amount=4999&productName=TMI+Fan+Diamond',
};

const PERFORMER_TIER_PRICES: Record<string, string> = {
  RUBY: '$2.99/mo', SILVER: '$4.99/mo', GOLD: '$9.99/mo',
  PLATINUM: '$19.99/mo', DIAMOND: '$29.99/mo',
};
const PERFORMER_TIER_CHECKOUT: Record<string, string> = {
  RUBY:     '/api/stripe/checkout?priceId=price_performer_ruby&mode=subscription&amount=299&productName=TMI+Performer+Ruby',
  SILVER:   '/api/stripe/checkout?priceId=price_performer_silver&mode=subscription&amount=499&productName=TMI+Performer+Silver',
  GOLD:     '/api/stripe/checkout?priceId=price_performer_gold&mode=subscription&amount=999&productName=TMI+Performer+Gold',
  PLATINUM: '/api/stripe/checkout?priceId=price_performer_platinum&mode=subscription&amount=1999&productName=TMI+Performer+Platinum',
  DIAMOND:  '/api/stripe/checkout?priceId=price_performer_diamond&mode=subscription&amount=2999&productName=TMI+Performer+Diamond',
};

const TIER_PERKS: Record<string, string[]> = {
  RUBY:     ['All live rooms', 'Chat + reactions', 'Tip performers', 'XP + achievements'],
  SILVER:   ['Everything in Ruby', 'Early access drops', 'Leaderboard placement', 'Silver avatar glow'],
  GOLD:     ['Everything in Silver', 'Exclusive rooms', 'Gold avatar glow', 'Priority drops'],
  PLATINUM: ['Everything in Gold', 'Backstage passes', 'Direct artist DMs', 'Platinum badge'],
  DIAMOND:  ['All Platinum perks', 'NFT access', 'VIP front-row seats', 'Diamond avatar glow'],
};

const PERFORMER_PERKS: Record<string, string[]> = {
  RUBY:     ['Go live anytime', 'Beat marketplace', 'Booking requests', 'Analytics dashboard'],
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
