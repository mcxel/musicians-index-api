'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getRealFoundingPacks, isRealPriceId } from '@/lib/stripe/products';
import {
  listCanonicalPricingByFamily,
  listMembershipOffersLowestFirst,
  type CanonicalPricingEntry,
} from '@/lib/commerce/CanonicalPricingRegistry';

// Membership cards are built only via listMembershipOffersLowestFirst →
// CanonicalPricingRegistry / products.ts (no parallel hard-coded $ ladder).

// ── Founding supporter one-time packs ────────────────────────────────────────

const FOUNDING_PACKS = [
  {
    key: 'supporter',
    name: 'SUPPORTER PACK',
    icon: '🎧',
    price: '$5',
    color: '#00FFFF',
    badge: null as string | null,
    perks: [
      'Beta Architect badge — permanent',
      'Starter TMI Coins',
      'Supporter role on your profile',
      'Season Zero recognition',
    ],
    cta: 'SUPPORT THE BUILD',
    ctaHref: '/api/stripe/checkout?priceId=price_founding_supporter_5&mode=payment&amount=500&productName=Founding+Supporter+Pack',
  },
  {
    key: 'creator',
    name: 'CREATOR PACK',
    icon: '🎙️',
    price: '$15',
    color: '#FF2DAA',
    badge: null as string | null,
    perks: [
      'Everything in Supporter Pack',
      'Extra vibe presets for your lobby',
      'Profile enhancement boost',
      'Creator Founder badge',
      'Bonus TMI Coins',
    ],
    cta: 'JOIN AS CREATOR',
    ctaHref: '/api/stripe/checkout?priceId=price_founding_creator_15&mode=payment&amount=1500&productName=Founding+Creator+Pack',
  },
  {
    key: 'founding',
    name: 'FOUNDING MEMBER',
    icon: '🏛️',
    price: '$25',
    color: '#FFD700',
    badge: null as string | null,
    perks: [
      'Everything in Creator Pack',
      'Founding Member badge — permanent',
      'Priority profile placement',
      'Extra room customization options',
      'Early access to future drops',
    ],
    cta: 'BECOME A FOUNDER',
    ctaHref: '/api/stripe/checkout?priceId=price_founding_member_25&mode=payment&amount=2500&productName=Founding+Member+Pack',
  },
  {
    key: 'diamond',
    name: 'DIAMOND FOUNDER',
    icon: '💎',
    price: '$50',
    color: '#AA2DFF',
    badge: null as string | null,
    perks: [
      'Everything in Founding Member',
      'Diamond Founder badge — permanent',
      'Featured profile placement',
      'Premium vibe packs (all seasons)',
      'Priority triage on feedback',
      'Founder priority in Beta Architect queue',
    ],
    cta: 'GO DIAMOND FOUNDER',
    ctaHref: '/api/stripe/checkout?priceId=price_diamond_founder_50&mode=payment&amount=5000&productName=Diamond+Founder+Pack',
  },
] as const;

// Advertiser entry cards: price/name/priceId come from CanonicalPricingRegistry's
// ONE_TIME_PLATFORM_AD ladder (never a hand-rolled $ table — that's what caused
// the $10-$25/wk mismatch this replaced). Presentation-only fields (icon/color/
// perks/cta copy) are looked up locally by catalogId below.
const ADVERTISER_PRESENTATION: Record<string, { icon: string; color: string; perks: string[]; cta: string }> = {
  "ad.platform.micro": {
    icon: "🎯",
    color: "#00FFFF",
    perks: ["Home banner rotation", "Fan hub bottom slot", "No commitment"],
    cta: "TRY A MICRO SPOT",
  },
  "ad.platform.day": {
    icon: "📣",
    color: "#00FFFF",
    perks: ["Home banner + hub placements", "24-hour run", "Real impression reporting"],
    cta: "RUN A DAY SPOT",
  },
  "ad.platform.week": {
    icon: "📅",
    color: "#FF2DAA",
    perks: ["Home banner + magazine leaderboard", "7-day run", "Real impression reporting"],
    cta: "RUN A WEEK SPOT",
  },
  "ad.platform.feature": {
    icon: "⭐",
    color: "#FFD700",
    perks: ["Featured home banner placement", "Priority rotation", "Real impression reporting"],
    cta: "FEATURE MY BRAND",
  },
  "ad.platform.premium": {
    icon: "💠",
    color: "#AA2DFF",
    perks: ["Top-tier home banner placement", "Maximum rotation priority", "Real impression reporting"],
    cta: "GO PREMIUM",
  },
};

function formatAdPrice(priceCents: number, interval: CanonicalPricingEntry["interval"]): string {
  const dollars = (priceCents / 100).toFixed(2).replace(/\.00$/, "");
  if (interval && interval !== "one_time") return `$${dollars}/${interval}`;
  return `$${dollars}`;
}

// ── Support economy ───────────────────────────────────────────────────────────

const SUPPORT_TIERS = [
  {
    key: 'support-performer',
    name: 'SUPPORT THIS PERFORMER',
    icon: '🤝',
    color: '#FF2DAA',
    price: '$2.99/mo',
    perks: ['Shown on artist profile', 'Supporter badge in live rooms', '90% goes directly to the performer', 'Cancel anytime'],
    cta: 'BECOME A SUPPORTER',
    ctaHref: '/api/stripe/checkout?priceId=price_support_performer&mode=subscription&amount=299&productName=Support+This+Performer',
  },
  {
    key: 'super-supporter',
    name: 'SUPER SUPPORTER',
    icon: '⚡',
    color: '#FFD700',
    price: '$4.99/mo',
    perks: ['Everything in Supporter', 'Super Supporter badge (gold ring)', 'Priority mention in live rooms', 'Monthly thank-you from artist'],
    cta: 'GO SUPER SUPPORTER',
    ctaHref: '/api/stripe/checkout?priceId=price_super_supporter&mode=subscription&amount=499&productName=TMI+Super+Supporter',
  },
] as const;

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
      badge: null as string | null,
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
  // Advertiser cards: price/name/priceId sourced live from the canonical
  // ONE_TIME_PLATFORM_AD ladder — never a hand-rolled $ table (Rule 20).
  const advertiserEntries = listCanonicalPricingByFamily('ONE_TIME_PLATFORM_AD')
    .filter((e) => ADVERTISER_PRESENTATION[e.catalogId])
    .map((e) => ({
      key: e.catalogId,
      name: e.name,
      price: formatAdPrice(e.priceCents, e.interval),
      ctaHref: `/api/stripe/checkout?priceId=${encodeURIComponent(e.priceId)}&mode=payment&amount=${e.priceCents}&productName=${encodeURIComponent(e.name)}`,
      ...ADVERTISER_PRESENTATION[e.catalogId],
    }));

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
                background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.5)', padding: '10px 28px', borderRadius: 30,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer',
              }}
            >
              SEE ALL FAN &amp; PERFORMER PLANS ↓
            </button>
          </div>
        )}

        {/* ── Support Economy ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#FF2DAA', marginBottom: 6 }}>SUPPORT ECONOMY</div>
            <h2 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, margin: '0 0 8px' }}>Support Your Favourite Performer</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
              Shown on artist profiles and live rooms. 90% goes directly to the performer. Cancel anytime.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
            {SUPPORT_TIERS.map((tier) => (
              <div key={tier.key} style={{ background: `${tier.color}08`, border: `1.5px solid ${tier.color}33`, borderRadius: 14, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{tier.icon}</div>
                  <div style={{ color: tier.color, fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 4 }}>{tier.name}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{tier.price}</div>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tier.perks.map((p) => (
                    <li key={p} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, display: 'flex', gap: 7, alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: tier.color, flexShrink: 0, fontWeight: 900 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
                <Link href={tier.ctaHref} style={{ display: 'block', textAlign: 'center', padding: '12px 0', background: `${tier.color}22`, border: `1px solid ${tier.color}55`, borderRadius: 8, color: tier.color, fontWeight: 900, fontSize: 10, letterSpacing: '0.12em', textDecoration: 'none' }}>
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── Advertisers ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: '#00FFFF', marginBottom: 6 }}>ADVERTISE ON TMI</div>
            <h2 style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, margin: '0 0 8px' }}>Start Small. Scale When Ready.</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
              Run a $10 ad this week. See results. Upgrade to billboards, magazine features, and championship sponsorships when you&apos;re ready.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 16 }}>
            {advertiserEntries.map((ad) => (
              <div key={ad.key} style={{ background: `${ad.color}06`, border: `1px solid ${ad.color}25`, borderRadius: 12, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 24, marginBottom: 5 }}>{ad.icon}</div>
                  <div style={{ color: ad.color, fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', marginBottom: 3 }}>{ad.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{ad.price}</div>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {ad.perks.map((p) => (
                    <li key={p} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, display: 'flex', gap: 6, alignItems: 'flex-start', lineHeight: 1.4 }}>
                      <span style={{ color: ad.color, flexShrink: 0, fontWeight: 900, fontSize: 9 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
                <Link href={ad.ctaHref} style={{ display: 'block', textAlign: 'center', padding: '10px 0', background: `${ad.color}15`, border: `1px solid ${ad.color}40`, borderRadius: 7, color: ad.color, fontWeight: 900, fontSize: 9, letterSpacing: '0.12em', textDecoration: 'none' }}>
                  {ad.cta}
                </Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/advertise" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.1em', textDecoration: 'none' }}>
              See billboard, magazine, video &amp; championship sponsorships →
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: 2, marginBottom: 20 }}>
          {/* No trial claim here — checkout never sets trial_period_days, so a
              "free trial" promise would be false (Rule 20). */}
          No contracts · Cancel anytime
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/season-pass" style={{ color: '#AA2DFF', fontSize: 11, letterSpacing: 2, textDecoration: 'none' }}>
            VIEW SEASON PASS OPTIONS →
          </Link>
        </div>

      </div>
    </main>
  );
}
