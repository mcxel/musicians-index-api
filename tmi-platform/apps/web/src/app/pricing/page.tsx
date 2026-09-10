'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getRealFoundingPacks, getSubscriptionProduct, isRealPriceId } from '@/lib/stripe/products';
import { listMembershipOffersLowestFirst } from '@/lib/commerce/CanonicalPricingRegistry';

type TierCard = {
  key: string;
  name: string;
  icon: string;
  color: string;
  price: string;
  badge: string | null;
  perks: readonly string[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
};

const FAN_VISUAL: Record<string, { icon: string; color: string; shortName: string; badge: string | null; cta: string }> = {
  FREE: { icon: '👤', color: '#00FFFF', shortName: 'FREE', badge: null, cta: 'JOIN FREE' },
  PRO: { icon: '⭐', color: '#FF6B35', shortName: 'PRO FAN', badge: 'START HERE', cta: 'GET PRO' },
  RUBY: { icon: '🔴', color: '#FF4444', shortName: 'RUBY FAN', badge: null, cta: 'GET RUBY' },
  SILVER: { icon: '🥈', color: '#C0C0C0', shortName: 'SILVER FAN', badge: null, cta: 'UPGRADE TO SILVER' },
  GOLD: { icon: '🥇', color: '#FFD700', shortName: 'GOLD FAN', badge: null, cta: 'UPGRADE TO GOLD' },
  PLATINUM: { icon: '💠', color: '#AA2DFF', shortName: 'PLATINUM FAN', badge: null, cta: 'UPGRADE TO PLATINUM' },
  DIAMOND: { icon: '💎', color: '#00FF88', shortName: 'DIAMOND FAN', badge: null, cta: 'GO DIAMOND' },
  FAMILY: { icon: '👨‍👩‍👧', color: '#00FFFF', shortName: 'FAMILY PLAN', badge: 'BEST VALUE', cta: 'GET FAMILY PLAN' },
};

const PERF_VISUAL: Record<string, { icon: string; color: string; shortName: string; badge: string | null; cta: string }> = {
  FREE: { icon: '🎤', color: '#FF2DAA', shortName: 'FREE', badge: null, cta: 'JOIN FREE' },
  PRO: { icon: '🎧', color: '#FF6B35', shortName: 'PRO PERFORMER', badge: 'START HERE', cta: 'GET PRO' },
  RUBY: { icon: '🎙️', color: '#FF2DAA', shortName: 'RUBY PERFORMER', badge: null, cta: 'GET RUBY' },
  SILVER: { icon: '🥈', color: '#C0C0C0', shortName: 'SILVER PERFORMER', badge: null, cta: 'UPGRADE TO SILVER' },
  GOLD: { icon: '🏆', color: '#FFD700', shortName: 'GOLD PERFORMER', badge: null, cta: 'UPGRADE TO GOLD' },
  PLATINUM: { icon: '🎖️', color: '#AA2DFF', shortName: 'PLATINUM PERFORMER', badge: null, cta: 'UPGRADE TO PLATINUM' },
  DIAMOND: { icon: '💎', color: '#00FF88', shortName: 'DIAMOND PERFORMER', badge: null, cta: 'GO DIAMOND' },
  BAND: { icon: '🎸', color: '#FF9500', shortName: 'BAND / GROUP', badge: 'GROUPS', cta: 'REGISTER YOUR GROUP' },
};

const FOUNDING_VISUAL: Record<string, { icon: string; color: string; shortName: string; badge: string | null; cta: string; perks: readonly string[] }> = {
  FOUNDING_SUPPORTER: {
    icon: '🎧',
    color: '#00FFFF',
    shortName: 'SUPPORTER PACK',
    badge: null,
    cta: 'SUPPORT THE BUILD',
    perks: ['Beta Architect badge — permanent', 'Starter TMI Coins', 'Supporter role on your profile', 'Season Zero recognition'],
  },
  FOUNDING_CREATOR: {
    icon: '🎙️',
    color: '#FF2DAA',
    shortName: 'CREATOR PACK',
    badge: null,
    cta: 'JOIN AS CREATOR',
    perks: ['Everything in Supporter Pack', 'Extra vibe presets for your lobby', 'Profile enhancement boost', 'Creator Founder badge', 'Bonus TMI Coins'],
  },
  FOUNDING_MEMBER: {
    icon: '🏛️',
    color: '#FFD700',
    shortName: 'FOUNDING MEMBER',
    badge: null,
    cta: 'BECOME A FOUNDER',
    perks: ['Everything in Creator Pack', 'Founding Member badge — permanent', 'Priority profile placement', 'Extra room customization options', 'Early access to future drops'],
  },
  FOUNDING_DIAMOND: {
    icon: '💎',
    color: '#AA2DFF',
    shortName: 'DIAMOND FOUNDER',
    badge: 'ELITE',
    cta: 'GO DIAMOND FOUNDER',
    perks: ['Everything in Founding Member', 'Diamond Founder badge — permanent', 'Featured profile placement', 'Premium vibe packs (all seasons)', 'Priority triage on feedback', 'Founder priority in Beta Architect queue'],
  },
};

function buildMembershipTiers(accountType: 'fan' | 'performer'): TierCard[] {
  const visual = accountType === 'fan' ? FAN_VISUAL : PERF_VISUAL;
  const offers = getSubscriptionOffersLowestFirst(accountType);
  return offers.map((o, idx) => {
    const v = visual[o.tier] ?? { icon: '⭐', color: '#00FFFF', shortName: o.name, badge: null, cta: 'SELECT' };
    const isFree = o.priceCents === 0;
    const productName = encodeURIComponent(o.name);
    return {
      key: o.id,
      name: v.shortName,
      icon: v.icon,
      color: v.color,
      price: isFree ? '$0' : `$${(o.priceCents / 100).toFixed(2)}/mo`,
      badge: idx === 1 ? (v.badge ?? 'START HERE') : v.badge,
      perks: o.features,
      cta: v.cta,
      ctaHref: isFree
        ? accountType === 'fan'
          ? '/signup'
          : '/signup?role=performer'
        : `/api/stripe/checkout?priceId=${encodeURIComponent(o.priceId)}&mode=subscription&amount=${o.priceCents}&productName=${productName}`,
      highlighted: idx === 1,
    };
  });
}

const FAN_TIERS = buildMembershipTiers('fan');
const PERFORMER_TIERS = buildMembershipTiers('performer');

/** Only packs with a real Stripe Price ID — never invent IDs or price_data-only CTAs for founder SKUs. */
const REAL_FOUNDING_PACKS = getRealFoundingPacks().map((pack) => {
  const v = FOUNDING_VISUAL[pack.key] ?? {
    icon: '⭐',
    color: '#AA2DFF',
    shortName: pack.name,
    badge: null as string | null,
    cta: 'SUPPORT TMI',
    perks: [] as readonly string[],
  };
  const productName = encodeURIComponent(pack.name);
  return {
    key: pack.key,
    name: v.shortName,
    icon: v.icon,
    price: `$${(pack.priceCents / 100).toFixed(0)}`,
    color: v.color,
    badge: v.badge,
    perks: v.perks,
    cta: v.cta,
    ctaHref: `/api/stripe/checkout?priceId=${encodeURIComponent(pack.priceId)}&mode=payment&amount=${pack.priceCents}&productName=${productName}`,
  };
});

const SUPPORT_BASIC = STRIPE_PRODUCTS.SUPPORT_PERFORMER_MONTHLY;
const SUPPORT_SUPER = STRIPE_PRODUCTS.SUPER_SUPPORTER_MONTHLY;
const REAL_SUPPORT_TIERS = [
  {
    key: 'SUPPORT_PERFORMER_MONTHLY',
    name: SUPPORT_BASIC.name.toUpperCase(),
    icon: '🤝',
    color: '#FF2DAA',
    price: `$${(SUPPORT_BASIC.price / 100).toFixed(2)}/mo`,
    perks: ['Shown on artist profile', 'Supporter badge in live rooms', '90% goes directly to the performer', 'Cancel anytime'] as const,
    cta: 'BECOME A SUPPORTER',
    ctaHref: `/api/stripe/checkout?priceId=${encodeURIComponent(SUPPORT_BASIC.priceId)}&mode=subscription&amount=${SUPPORT_BASIC.price}&productName=${encodeURIComponent(SUPPORT_BASIC.name)}`,
    priceId: SUPPORT_BASIC.priceId,
  },
  {
    key: 'SUPER_SUPPORTER_MONTHLY',
    name: SUPPORT_SUPER.name.toUpperCase(),
    icon: '⚡',
    color: '#FFD700',
    price: `$${(SUPPORT_SUPER.price / 100).toFixed(2)}/mo`,
    perks: ['Everything in Supporter', 'Super Supporter badge (gold ring)', 'Priority mention in live rooms', 'Monthly thank-you from artist'] as const,
    cta: 'GO SUPER SUPPORTER',
    ctaHref: `/api/stripe/checkout?priceId=${encodeURIComponent(SUPPORT_SUPER.priceId)}&mode=subscription&amount=${SUPPORT_SUPER.price}&productName=${encodeURIComponent(SUPPORT_SUPER.name)}`,
    priceId: SUPPORT_SUPER.priceId,
  },
].filter((t) => isRealPriceId(t.priceId));

const MEMBERSHIP_COLORS = {
  FREE: '#00FFFF',
  PRO: '#FF6B35',
  RUBY: '#FF4444',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  PLATINUM: '#AA2DFF',
  DIAMOND: '#00FF88',
  FAMILY: '#00FFFF',
  BAND: '#FF9500',
} as const;

const MEMBERSHIP_ICONS = {
  FREE: '👤',
  PRO: '⭐',
  RUBY: '🔴',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💠',
  DIAMOND: '💎',
  FAMILY: '👨‍👩‍👧',
  BAND: '🎸',
} as const;

function getMembershipTierCards(accountType: 'fan' | 'performer') {
  return listMembershipOffersLowestFirst(accountType).map((offer) => {
    const isFree = offer.tier === 'FREE';
    const roleLabel = accountType === 'fan' ? 'FAN' : 'PERFORMER';
    return {
      key: offer.id,
      name: isFree ? 'FREE' : `${offer.tier} ${roleLabel}`,
      icon: MEMBERSHIP_ICONS[offer.tier],
      color: MEMBERSHIP_COLORS[offer.tier],
      price: isFree ? '$0' : `$${(offer.priceCents / 100).toFixed(2)}/mo`,
      badge: offer.tier === 'PRO' ? 'START HERE' : offer.tier === 'FAMILY' ? 'BEST VALUE' : offer.tier === 'BAND' ? 'GROUPS' : null,
      perks: offer.features,
      cta: isFree ? 'JOIN FREE' : offer.tier === 'PRO' ? 'GET PRO' : `UPGRADE TO ${offer.tier}`,
      ctaHref: isFree
        ? accountType === 'fan' ? '/signup' : '/signup?role=performer'
        : `/api/stripe/checkout?priceId=${encodeURIComponent(offer.priceId!)}&mode=subscription&amount=${offer.priceCents}&productName=${encodeURIComponent(offer.name)}`,
      highlighted: offer.tier === 'PRO',
    };
  });
}

export default function PricingPage() {
  const [showAll, setShowAll] = useState(false);

  const fanTiers = getMembershipTierCards('fan');
  const performerTiers = getMembershipTierCards('performer');
  // Both paths stay visible: a Fan can discover Performer creation without
  // hiding their existing Fan path, and vice versa.
  const visibleTiers = showAll
    ? [...fanTiers, ...performerTiers]
    : [...fanTiers.slice(0, 2), ...performerTiers.slice(0, 2)];
  // Founder packs stay hidden until registry SKUs have real Stripe Price IDs.
  const realFounding = getRealFoundingPacks();
  const purchasableFoundingPacks =
    realFounding.length === 0
      ? []
      : FOUNDING_PACKS.filter((pack) => {
          const m = pack.ctaHref.match(/priceId=([^&]+)/);
          return Boolean(m && isRealPriceId(decodeURIComponent(m[1])));
        });

  return (
    <main style={{ minHeight: '100vh', background: '#060410', color: '#fff', padding: '60px 20px 80px', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: '#AA2DFF', fontSize: 10, letterSpacing: 4, marginBottom: 8, fontWeight: 900 }}>TMI MEMBERSHIP</div>
          <h1 style={{ fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900, letterSpacing: 2, margin: 0 }}>START FOR FREE</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 10 }}>Join free. Upgrade when you&apos;re ready. Cancel anytime.</p>
        </div>

        {/* ── Founding Supporters (only when real Stripe Price IDs exist) ── */}
        {purchasableFoundingPacks.length > 0 && (
        <div style={{
          marginBottom: 52,
          padding: '28px 24px 32px',
          background: 'linear-gradient(135deg, rgba(170,45,255,0.08), rgba(5,5,16,0.95))',
          border: '1px solid rgba(170,45,255,0.3)',
          borderRadius: 16,
        }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#AA2DFF', marginBottom: 8 }}>
              🚧 TMI BETA SEASON · WAVE 1
            </div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,32px)', fontWeight: 900, margin: '0 0 10px', letterSpacing: 1 }}>
              Become a Founding Builder
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
              You are one of the first people helping shape the future of live performance and fan interaction.
              Support the build and earn permanent recognition — your badge, status, and perks never expire.
            </p>
          </div>

          {/* Pack cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
            {purchasableFoundingPacks.map((pack) => (
              <div
                key={pack.key}
                style={{
                  position: 'relative',
                  background: `${pack.color}08`,
                  border: `1.5px solid ${pack.color}44`,
                  borderRadius: 12,
                  padding: '22px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  boxShadow: `0 0 20px ${pack.color}10`,
                }}
              >
                {pack.badge && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: pack.color, color: '#050510', fontSize: 8, fontWeight: 900,
                    letterSpacing: '0.14em', padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap',
                  }}>
                    {pack.badge}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 28, marginBottom: 5 }}>{pack.icon}</div>
                  <div style={{ color: pack.color, fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 4 }}>{pack.name}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{pack.price} <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>one-time</span></div>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pack.perks.map((p) => (
                    <li key={p} style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, display: 'flex', gap: 7, alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: pack.color, flexShrink: 0, fontWeight: 900, fontSize: 10 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
                <Link
                  href={pack.ctaHref}
                  style={{
                    display: 'block', textAlign: 'center', padding: '12px 0',
                    background: `linear-gradient(135deg,${pack.color}44,${pack.color}22)`,
                    border: `1px solid ${pack.color}66`,
                    borderRadius: 8, color: pack.color,
                    fontWeight: 900, fontSize: 10, letterSpacing: '0.12em', textDecoration: 'none',
                  }}
                >
                  {pack.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Economy disclosure */}
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', color: '#00FF88', marginBottom: 5 }}>PERMANENTLY YOURS</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Badges · Supporter status · Cosmetics · Diamond perks · All purchases
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', color: '#FFD700', marginBottom: 5 }}>MAY RESET AT V1</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Beta XP · Leaderboard rankings · Temporary achievements
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            Need to report a bug or request a feature? Use the <strong style={{ color: '#AA2DFF' }}>📡 BETA FEEDBACK</strong> beacon (bottom-right)
            so your input routes directly into live triage.
          </div>
        </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, margin: '0 auto 28px', maxWidth: 720 }}>
          <div style={{ borderBottom: '2px solid #00FFFF', paddingBottom: 8, color: '#00FFFF', fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textAlign: 'center' }}>
            FAN MEMBERSHIP
          </div>
          <div style={{ borderBottom: '2px solid #FF2DAA', paddingBottom: 8, color: '#FF2DAA', fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textAlign: 'center' }}>
            PERFORMER MEMBERSHIP
          </div>
        </div>

        {/* Tier cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginBottom: 28 }}>
          {/* initial={false}: the tier cards present on first page load render
              immediately with no enter-animation delay — real pricing must
              never be gated behind requestAnimationFrame timing (found stuck
              invisible for ~10s under main-thread contention, Lane A A5/A8
              2026-09-01). Segment/showAll changes after mount still animate. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleTiers.map((tier, i) => (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ delay: i * 0.06, duration: 0.22 }}
                style={{
                  position: 'relative',
                  background: tier.highlighted
                    ? `linear-gradient(160deg,${tier.color}22,rgba(6,4,16,0.98))`
                    : 'rgba(255,255,255,0.02)',
                  border: tier.highlighted ? `1.5px solid ${tier.color}88` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: '28px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: tier.highlighted ? `0 0 32px ${tier.color}22` : 'none',
                }}
              >
                {/* Badge */}
                {tier.badge && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: tier.color, color: '#050510', fontSize: 8, fontWeight: 900,
                    letterSpacing: '0.12em', padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap',
                  }}>
                    {tier.badge}
                  </div>
                )}

                {/* Tier header */}
                <div>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{tier.icon}</div>
                  <div style={{ color: tier.color, fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 4 }}>{tier.name}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{tier.price}</div>
                </div>

                {/* Perks */}
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                  {tier.perks.map((p) => (
                    <li key={p} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: tier.color, flexShrink: 0, fontWeight: 900 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.ctaHref}
                  style={{
                    display: 'block', textAlign: 'center', padding: '13px 0',
                    background: tier.highlighted ? `linear-gradient(135deg,${tier.color},${tier.color}99)` : 'rgba(255,255,255,0.06)',
                    border: tier.highlighted ? 'none' : `1px solid rgba(255,255,255,0.12)`,
                    borderRadius: 8, color: tier.highlighted ? '#050510' : 'rgba(255,255,255,0.7)',
                    fontWeight: 900, fontSize: 11, letterSpacing: '0.12em', textDecoration: 'none',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show full ladder CTA */}
        {!showAll && (
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button
              onClick={() => setShowAll(true)}
              style={{
                display: 'inline-flex',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 40,
                padding: 4,
                gap: 4,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              SEE ALL FAN &amp; PERFORMER PLANS ↓
            </button>
          </div>

          {/* Recurring membership ladder — Free + Pro first */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
              gap: 16,
              marginBottom: 28,
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleTiers.map((tier, i) => (
                <motion.div
                  key={tier.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ delay: i * 0.06, duration: 0.22 }}
                  style={{
                    position: 'relative',
                    background: tier.highlighted
                      ? `linear-gradient(160deg,${tier.color}22,rgba(6,4,16,0.98))`
                      : 'rgba(255,255,255,0.02)',
                    border: tier.highlighted ? `1.5px solid ${tier.color}88` : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '28px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    boxShadow: tier.highlighted ? `0 0 32px ${tier.color}22` : 'none',
                  }}
                >
                  {tier.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: tier.color,
                        color: '#050510',
                        fontSize: 8,
                        fontWeight: 900,
                        letterSpacing: '0.12em',
                        padding: '3px 12px',
                        borderRadius: 20,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tier.badge}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{tier.icon}</div>
                    <div style={{ color: tier.color, fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 4 }}>
                      {tier.name}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{tier.price}</div>
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                    {tier.perks.map((p) => (
                      <li
                        key={p}
                        style={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: 12,
                          display: 'flex',
                          gap: 8,
                          alignItems: 'flex-start',
                          lineHeight: 1.4,
                        }}
                      >
                        <span style={{ color: tier.color, flexShrink: 0, fontWeight: 900 }}>✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.ctaHref}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '13px 0',
                      background: tier.highlighted
                        ? `linear-gradient(135deg,${tier.color},${tier.color}99)`
                        : 'rgba(255,255,255,0.06)',
                      border: tier.highlighted ? 'none' : '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8,
                      color: tier.highlighted ? '#050510' : 'rgba(255,255,255,0.7)',
                      fontWeight: 900,
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      textDecoration: 'none',
                    }}
                  >
                    {tier.cta}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {!showAll && (
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <button
                type="button"
                onClick={() => setShowAll(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.5)',
                  padding: '10px 28px',
                  borderRadius: 30,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                }}
              >
                SEE ALL {segment === 'fans' ? 'FAN' : 'PERFORMER'} PLANS ↓
              </button>
            </div>
          )}

          {/* Support TMI / Founder Packs — secondary, only when Stripe Price IDs are real */}
          {REAL_FOUNDING_PACKS.length > 0 && (
            <div
              style={{
                marginBottom: 52,
                padding: '28px 24px 32px',
                background: 'linear-gradient(135deg, rgba(170,45,255,0.08), rgba(5,5,16,0.95))',
                border: '1px solid rgba(170,45,255,0.3)',
                borderRadius: 16,
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#AA2DFF', marginBottom: 8 }}>
                  SUPPORT TMI / FOUNDER PACKS
                </div>
                <h2 style={{ fontSize: 'clamp(18px,3vw,28px)', fontWeight: 900, margin: '0 0 10px', letterSpacing: 1 }}>
                  One-time support packs
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
                  Optional one-time support — separate from recurring memberships above.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                {REAL_FOUNDING_PACKS.map((pack) => (
                  <div
                    key={pack.key}
                    style={{
                      position: 'relative',
                      background: `${pack.color}08`,
                      border: `1.5px solid ${pack.color}44`,
                      borderRadius: 12,
                      padding: '22px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    {pack.badge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -10,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: pack.color,
                          color: '#050510',
                          fontSize: 8,
                          fontWeight: 900,
                          letterSpacing: '0.14em',
                          padding: '3px 12px',
                          borderRadius: 20,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {pack.badge}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 5 }}>{pack.icon}</div>
                      <div style={{ color: pack.color, fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 4 }}>
                        {pack.name}
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>
                        {pack.price}{' '}
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>one-time</span>
                      </div>
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {pack.perks.map((p) => (
                        <li
                          key={p}
                          style={{
                            color: 'rgba(255,255,255,0.65)',
                            fontSize: 11,
                            display: 'flex',
                            gap: 7,
                            alignItems: 'flex-start',
                            lineHeight: 1.4,
                          }}
                        >
                          <span style={{ color: pack.color, flexShrink: 0, fontWeight: 900, fontSize: 10 }}>✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={pack.ctaHref}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '12px 0',
                        background: `linear-gradient(135deg,${pack.color}44,${pack.color}22)`,
                        border: `1px solid ${pack.color}66`,
                        borderRadius: 8,
                        color: pack.color,
                        fontWeight: 900,
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textDecoration: 'none',
                      }}
                    >
                      {pack.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {REAL_SUPPORT_TIERS.length > 0 && (
            <div style={{ marginBottom: 52 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#FF2DAA', marginBottom: 6 }}>
                  SUPPORT ECONOMY
                </div>
                <h2 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, margin: '0 0 8px' }}>
                  Support Your Favourite Performer
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
                {REAL_SUPPORT_TIERS.map((tier) => (
                  <div
                    key={tier.key}
                    style={{
                      background: `${tier.color}08`,
                      border: `1.5px solid ${tier.color}33`,
                      borderRadius: 14,
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{tier.icon}</div>
                      <div style={{ color: tier.color, fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 4 }}>
                        {tier.name}
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{tier.price}</div>
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {tier.perks.map((p) => (
                        <li
                          key={p}
                          style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: 11,
                            display: 'flex',
                            gap: 7,
                            alignItems: 'flex-start',
                            lineHeight: 1.4,
                          }}
                        >
                          <span style={{ color: tier.color, flexShrink: 0, fontWeight: 900 }}>✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.ctaHref}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '12px 0',
                        background: `${tier.color}22`,
                        border: `1px solid ${tier.color}55`,
                        borderRadius: 8,
                        color: tier.color,
                        fontWeight: 900,
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textDecoration: 'none',
                      }}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: 2, marginBottom: 20 }}>
            No contracts · Cancel anytime
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/advertise" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: 2, textDecoration: 'none', marginRight: 20 }}>
              ADVERTISE ON TMI →
            </Link>
            <Link href="/season-pass" style={{ color: '#AA2DFF', fontSize: 11, letterSpacing: 2, textDecoration: 'none' }}>
              VIEW SEASON PASS OPTIONS →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <>
          <GlobalTmiHeader />
          <main style={{ minHeight: '100vh', background: '#060410', color: '#fff', padding: 48 }}>
            <div style={{ textAlign: 'center', opacity: 0.5 }}>Loading membership plans…</div>
          </main>
        </>
      }
    >
      <PricingPageInner />
    </Suspense>
  );
}
