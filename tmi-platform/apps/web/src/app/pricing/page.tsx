'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
    ctaHref: '/api/stripe/checkout?priceId=price_founding_supporter_5&mode=payment',
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
    ctaHref: '/api/stripe/checkout?priceId=price_founding_creator_15&mode=payment',
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
    ctaHref: '/api/stripe/checkout?priceId=price_founding_member_25&mode=payment',
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
    ctaHref: '/api/stripe/checkout?priceId=price_diamond_founder_50&mode=payment',
  },
] as const;

// ── Tier data (lowest price first, free always first) ─────────────────────────

const FAN_TIERS = [
  {
    key: 'fan-free',
    name: 'FREE',
    icon: '👤',
    color: '#00FFFF',
    price: '$0',
    priceId: null,
    badge: null,
    perks: ['Read TMI magazine', 'Browse profiles', 'Watch public streams', 'Create fan account'],
    cta: 'JOIN FREE',
    ctaHref: '/signup',
    highlighted: false,
  },
  {
    key: 'fan-pro',
    name: 'PRO FAN',
    icon: '🎧',
    color: '#00FFFF',
    price: '$2.99/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_TIER_1 ?? 'price_fan_monthly',
    badge: 'MOST POPULAR',
    perks: ['All live rooms', 'Chat + reactions', 'Tip performers', 'Monthly magazine', 'XP + achievements', '7-day free trial'],
    cta: 'START FREE TRIAL',
    ctaHref: '/api/stripe/checkout?priceId=price_fan_monthly&mode=subscription',
    highlighted: true,
  },
  {
    key: 'fan-gold',
    name: 'GOLD FAN',
    icon: '🥇',
    color: '#FFD700',
    price: '$4.99/mo',
    priceId: null,
    badge: null,
    perks: ['Everything in Pro', 'Early access drops', 'Fan leaderboard placement', 'Gold avatar glow', 'Exclusive fan rooms'],
    cta: 'UPGRADE',
    ctaHref: '/signup?tier=gold',
    highlighted: false,
  },
  {
    key: 'fan-platinum',
    name: 'PLATINUM FAN',
    icon: '💠',
    color: '#AA2DFF',
    price: '$7.99/mo',
    priceId: null,
    badge: null,
    perks: ['Everything in Gold', 'Backstage passes', 'Priority merch drops', 'Platinum badge', 'Direct artist DMs'],
    cta: 'UPGRADE',
    ctaHref: '/signup?tier=platinum',
    highlighted: false,
  },
  {
    key: 'fan-diamond',
    name: 'DIAMOND FAN',
    icon: '💎',
    color: '#00FF88',
    price: '$12.99/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP_TIER_1 ?? 'price_vip_monthly',
    badge: null,
    perks: ['All Platinum perks', 'NFT access', 'VIP front-row seats', 'Lifetime pass option', 'Diamond avatar glow'],
    cta: 'GO DIAMOND',
    ctaHref: '/api/stripe/checkout?priceId=price_vip_monthly&mode=subscription',
    highlighted: false,
  },
];

const PERFORMER_TIERS = [
  {
    key: 'perf-free',
    name: 'FREE',
    icon: '🎤',
    color: '#FF2DAA',
    price: '$0',
    priceId: null,
    badge: null,
    perks: ['Performer profile', 'Basic bio + links', 'Submit to magazine', 'Audience discovery'],
    cta: 'JOIN FREE',
    ctaHref: '/signup?role=performer',
    highlighted: false,
  },
  {
    key: 'perf-pro',
    name: 'PRO PERFORMER',
    icon: '🎙️',
    color: '#FF2DAA',
    price: '$1.99/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ARTIST_TIER_1 ?? 'price_artist_monthly',
    badge: 'START HERE',
    perks: ['Go live anytime', 'Beat marketplace access', 'Booking requests', 'Analytics dashboard', '7-day free trial'],
    cta: 'START FREE TRIAL',
    ctaHref: '/api/stripe/checkout?priceId=price_artist_monthly&mode=subscription',
    highlighted: true,
  },
  {
    key: 'perf-gold',
    name: 'GOLD PERFORMER',
    icon: '🏆',
    color: '#FFD700',
    price: '$3.99/mo',
    priceId: null,
    badge: null,
    perks: ['Everything in Pro', 'Fan club tools', 'Tipping enabled', 'Merch store access', 'Gold performer badge'],
    cta: 'UPGRADE',
    ctaHref: '/signup?role=performer&tier=gold',
    highlighted: false,
  },
  {
    key: 'perf-platinum',
    name: 'PLATINUM PERFORMER',
    icon: '🎖️',
    color: '#AA2DFF',
    price: '$6.99/mo',
    priceId: null,
    badge: null,
    perks: ['Everything in Gold', 'Priority placement', 'Billboard rotation', 'Platinum badge', 'Tour booking tools'],
    cta: 'UPGRADE',
    ctaHref: '/signup?role=performer&tier=platinum',
    highlighted: false,
  },
  {
    key: 'perf-diamond',
    name: 'DIAMOND PERFORMER',
    icon: '💎',
    color: '#00FF88',
    price: '$11.99/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP_TIER_1 ?? 'price_vip_monthly',
    badge: null,
    perks: ['All Platinum perks', 'NFT minting rights', 'Unlimited uploads', 'Priority booking', 'Full revenue split access'],
    cta: 'GO DIAMOND',
    ctaHref: '/api/stripe/checkout?priceId=price_vip_monthly&mode=subscription',
    highlighted: false,
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

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
          <AnimatePresence mode="popLayout">
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
              SEE ALL PLANS ↓ (up to $12.99/mo)
            </button>
          </div>
        )}

        {/* Footer note */}
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: 2, marginBottom: 20 }}>
          All paid plans include a 7-day free trial · No contracts · Cancel anytime
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
