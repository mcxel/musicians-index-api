'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CREATOR_ITEMS, FAN_ITEMS, VENUE_ITEMS, LOBBY_ITEMS, formatPrice } from '@/lib/store/StoreItemEngine';
import QuickBuyButton from '@/components/store/QuickBuyButton';

const SECTIONS = [
  { label: 'Creator Tools',    items: CREATOR_ITEMS.slice(0, 4),  accent: '#FF2DAA', icon: '🎤', href: '/store/creator' },
  { label: 'Fan Experience',   items: FAN_ITEMS.slice(0, 4),      accent: '#00FFFF', icon: '🎧', href: '/store/fan' },
  { label: 'Performer Venues', items: VENUE_ITEMS.slice(0, 3),    accent: '#AA2DFF', icon: '🏟️', href: '/store/venues' },
  { label: 'Lobby Skins',      items: LOBBY_ITEMS.slice(0, 3),    accent: '#FFD700', icon: '🌆', href: '/store/lobbies' },
];

const BADGE_COLORS: Record<string, string> = {
  HOT: '#FF2DAA', NEW: '#00FF88', LIMITED: '#FFD700', LAUNCH: '#AA2DFF',
};

export default function StorePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, rgba(170,45,255,0.15), transparent 55%), #050510', color: '#fff', paddingBottom: 80 }}>
      {/* Hero */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '52px 24px 36px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#AA2DFF', fontWeight: 800, marginBottom: 12 }}>TMI · STORE</div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, margin: '0 0 14px', lineHeight: 1.1 }}>
            Go Live. Get Seen.<br />
            <span style={{ color: '#FFD700' }}>Own Your World.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Beats, boosts, venues, skins, tickets, tips, fan clubs. Everything to grow, perform, and earn.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/store/flex" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #00E5FF, #FF2DAA)', borderRadius: 10, color: '#000', fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.06em', boxShadow: '0 0 20px rgba(0,229,255,0.6)' }}>
              🏛️ ENTER 3D FLEX STORE SHOWROOM
            </Link>
            {[
              { label: '🎤 Creator Store', href: '/store/creator', accent: '#FF2DAA' },
              { label: '🎧 Fan Store', href: '/store/fan', accent: '#00FFFF' },
              { label: '🏟️ Venues', href: '/store/venues', accent: '#AA2DFF' },
              { label: '🌆 Lobby Skins', href: '/store/lobbies', accent: '#FFD700' },
            ].map((s) => (
              <Link key={s.href} href={s.href} style={{ padding: '10px 20px', background: `${s.accent}18`, border: `1px solid ${s.accent}50`, borderRadius: 8, color: s.accent, fontWeight: 900, fontSize: 12, textDecoration: 'none', letterSpacing: '0.06em' }}>
                {s.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Store sections */}
      {SECTIONS.map((section, si) => (
        <section key={section.label} style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.3em', color: section.accent, fontWeight: 800, marginBottom: 4 }}>
                {section.icon} {section.label.toUpperCase()}
              </div>
            </div>
            <Link href={section.href} style={{ fontSize: 12, color: section.accent, textDecoration: 'none', fontWeight: 700 }}>
              See all →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {section.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.06 + i * 0.04 }}
                style={{ background: `${section.accent}08`, border: `1px solid ${section.accent}28`, borderRadius: 12, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  {item.badge && (
                    <span style={{ fontSize: 9, padding: '3px 8px', background: `${BADGE_COLORS[item.badge] ?? section.accent}20`, color: BADGE_COLORS[item.badge] ?? section.accent, borderRadius: 20, fontWeight: 800, letterSpacing: '0.1em' }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, flex: 1 }}>{item.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: section.accent }}>
                    {formatPrice(item.price)}
                    {item.mode === 'subscription' && <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/mo</span>}
                  </div>
                  <QuickBuyButton item={item} accentColor={section.accent} compact />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      {/* Beat marketplace link */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 48px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 12, padding: '24px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FFD700', fontWeight: 800, marginBottom: 10 }}>🎧 BEAT MARKETPLACE</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 16, lineHeight: 1.6 }}>
            Browse hundreds of beats and instrumentals. License instantly.
          </p>
          <Link href="/beats/marketplace" style={{ padding: '11px 28px', background: '#FFD700', color: '#000', borderRadius: 8, fontWeight: 900, fontSize: 13, textDecoration: 'none' }}>
            Browse Beats →
          </Link>
        </div>
      </section>
    </main>
  );
}
