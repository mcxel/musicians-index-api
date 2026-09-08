'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubscriptionOffersLowestFirst } from '@/lib/stripe/products';

// ── Founding supporter one-time packs (already lowest→highest) ───────────────

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
    badge: 'POPULAR',
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
    badge: 'ELITE',
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
        : `/api/stripe/checkout?priceId=${o.priceId}&mode=subscription&amount=${o.priceCents}&productName=${productName}`,
      highlighted: idx === 1,
    };
  });
}

const FAN_TIERS = buildMembershipTiers('fan');
const PERFORMER_TIERS = buildMembershipTiers('performer');

// ── Advertiser entry-level products ──────────────────────────────────────────

const ADVERTISER_ENTRY = [
  {
    key: 'ad-micro',
    name: 'MICRO AD',
    icon: '📣',
    color: '#00FFFF',
    price: '$10/wk',
    amount: 1000,
    perks: ['1 ad slot for 7 days', 'Reaches active listeners', 'Basic impression report'],
    cta: 'RUN MICRO AD',
    ctaHref: '/api/stripe/checkout?priceId=price_ad_micro_weekly&mode=payment&amount=1000&productName=TMI+Micro+Ad',
  },
  {
    key: 'ad-local',
    name: 'LOCAL SHOUTOUT',
    icon: '📍',
    color: '#00FF88',
    price: '$15/wk',
    amount: 1500,
    perks: ['Shoutout on 3 active rooms', 'Fan chat mentions', 'Weekly reach summary'],
    cta: 'GET SHOUTOUT',
    ctaHref: '/api/stripe/checkout?priceId=price_ad_local_weekly&mode=payment&amount=1500&productName=TMI+Local+Shoutout',
  },
  {
    key: 'ad-playlist',
    name: 'PLAYLIST BOOST',
    icon: '🎵',
    color: '#FF2DAA',
    price: '$20/wk',
    amount: 2000,
    perks: ['Song featured in 2 TMI playlists', 'Artist discovery boost', 'Play count report'],
    cta: 'BOOST PLAYLIST',
    ctaHref: '/api/stripe/checkout?priceId=price_ad_playlist_weekly&mode=payment&amount=2000&productName=TMI+Playlist+Boost',
  },
  {
    key: 'ad-sidebar',
    name: 'SIDEBAR AD',
    icon: '🖼️',
    color: '#FFD700',
    price: '$25/wk',
    amount: 2500,
    perks: ['Sidebar placement across live rooms', 'Click-through tracking', 'Weekly impression report'],
    cta: 'PLACE SIDEBAR AD',
    ctaHref: '/api/stripe/checkout?priceId=price_ad_sidebar_weekly&mode=payment&amount=2500&productName=TMI+Sidebar+Ad',
  },
] as const;

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


export default function PricingPage() {
  const [segment, setSegment] = useState<'fans' | 'performers'>('fans');
  const [showAll, setShowAll] = useState(false);

  const tiers = segment === 'fans' ? FAN_TIERS : PERFORMER_TIERS;
  // Always show FREE + first paid tier upfront. Show rest on demand.
  const visibleTiers = showAll ? tiers : tiers.slice(0, 2);

  return (
    <main style={{ minHeight: '100vh', background: '#060410', color: '#fff', padding: '60px 20px 80px', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: '#AA2DFF', fontSize: 10, letterSpacing: 4, marginBottom: 8, fontWeight: 900 }}>TMI MEMBERSHIP</div>
          <h1 style={{ fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900, letterSpacing: 2, margin: 0 }}>START FOR FREE</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 10 }}>Join free. Upgrade when you&apos;re ready. Cancel anytime.</p>
        </div>

        {/* ── Founding Supporters ───────────────────────────────────────────── */}
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
            {FOUNDING_PACKS.map((pack) => (
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

        {/* Toggle — Fans | Performers */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 40, padding: 4, gap: 4 }}>
            {(['fans', 'performers'] as const).map((seg) => (
              <button
                key={seg}
                onClick={() => { setSegment(seg); setShowAll(false); }}
                style={{
                  padding: '10px 28px', borderRadius: 36, border: 'none', cursor: 'pointer',
                  fontWeight: 900, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
                  background: segment === seg
                    ? (seg === 'fans' ? 'linear-gradient(135deg,#00FFFF,#00DDFF)' : 'linear-gradient(135deg,#FF2DAA,#AA2DFF)')
                    : 'transparent',
                  color: segment === seg ? '#050510' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.2s',
                }}
              >
                {seg === 'fans' ? '👤 Fans' : '🎤 Performers'}
              </button>
            ))}
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
              SEE ALL {segment === 'fans' ? 'FAN' : 'PERFORMER'} PLANS ↓
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
            {ADVERTISER_ENTRY.map((ad) => (
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
