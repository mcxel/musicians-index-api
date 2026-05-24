'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FAN_ITEMS, formatPrice } from '@/lib/store/StoreItemEngine';
import QuickBuyButton from '@/components/store/QuickBuyButton';

const BADGE_COLORS: Record<string, string> = {
  HOT: '#FF2DAA', NEW: '#00FF88', LIMITED: '#FFD700', LAUNCH: '#AA2DFF',
};

export default function FanStorePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '52px 24px 40px' }}>
        <Link href="/store" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>← Back to Store</Link>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#00FFFF', fontWeight: 800, marginBottom: 10 }}>FAN STORE</div>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, margin: '0 0 12px' }}>Show Up. Level Up. Stand Out.</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
          Tips, fan clubs, season passes, VIP memberships. Be part of something real.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
          {FAN_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 14, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 30 }}>{item.icon}</span>
                {item.badge && (
                  <span style={{ fontSize: 9, padding: '3px 8px', background: `${BADGE_COLORS[item.badge]}20`, color: BADGE_COLORS[item.badge], borderRadius: 20, fontWeight: 800, letterSpacing: '0.1em' }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, flex: 1 }}>{item.description}</div>
              {item.creatorSplit && item.creatorSplit > 0 && (
                <div style={{ fontSize: 10, color: '#FF2DAA' }}>♥ {Math.round(item.creatorSplit * 100)}% goes to the artist</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#00FFFF' }}>
                  {formatPrice(item.price)}
                  {item.mode === 'subscription' && <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>/mo</span>}
                </div>
                <QuickBuyButton item={item} accentColor="#00FFFF" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
