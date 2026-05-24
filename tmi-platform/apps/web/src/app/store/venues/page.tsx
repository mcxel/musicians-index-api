'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { VENUE_ITEMS, formatPrice } from '@/lib/store/StoreItemEngine';
import QuickBuyButton from '@/components/store/QuickBuyButton';

const BADGE_COLORS: Record<string, string> = {
  HOT: '#FF2DAA', NEW: '#00FF88', LIMITED: '#FFD700', LAUNCH: '#AA2DFF',
};

const VENUE_PREVIEW: Record<string, { bg: string; scanlines: string }> = {
  'venue-club':      { bg: 'linear-gradient(135deg, #0a0010, #1a0030)',    scanlines: '#AA2DFF' },
  'venue-theater':   { bg: 'linear-gradient(135deg, #0d0808, #1a0a00)',    scanlines: '#FF6B35' },
  'venue-arena':     { bg: 'linear-gradient(135deg, #001020, #001a35)',    scanlines: '#00FFFF' },
  'venue-outdoor':   { bg: 'linear-gradient(135deg, #051005, #0a1a0a)',    scanlines: '#00FF88' },
  'venue-cypher':    { bg: 'linear-gradient(135deg, #100800, #1a0f00)',    scanlines: '#FFD700' },
};

export default function VenueStorePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '52px 24px 40px' }}>
        <Link href="/store" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>← Back to Store</Link>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#AA2DFF', fontWeight: 800, marginBottom: 10 }}>PERFORMER VENUES</div>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, margin: '0 0 12px' }}>Own Your Stage.</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
          Every performer deserves a unique world. Buy your venue — it becomes your live stage that fans step into every time you go live.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {VENUE_ITEMS.map((item, i) => {
            const preview = VENUE_PREVIEW[item.id] ?? { bg: 'linear-gradient(135deg,#0d0d1a,#1a1a2e)', scanlines: '#AA2DFF' };
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${preview.scanlines}30`, display: 'flex', flexDirection: 'column' }}
              >
                {/* Venue preview window */}
                <div style={{ height: 100, background: preview.bg, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${preview.scanlines}08 3px, ${preview.scanlines}08 4px)` }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 16, fontSize: 28 }}>{item.icon}</div>
                  {item.badge && (
                    <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, padding: '3px 8px', background: `${BADGE_COLORS[item.badge]}90`, color: BADGE_COLORS[item.badge] === '#FFD700' ? '#000' : '#fff', borderRadius: 20, fontWeight: 800, letterSpacing: '0.1em' }}>
                      {item.badge}
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px', background: `${preview.scanlines}06`, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, flex: 1 }}>{item.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: preview.scanlines }}>{formatPrice(item.price)}</div>
                    <QuickBuyButton item={item} accentColor={preview.scanlines} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
