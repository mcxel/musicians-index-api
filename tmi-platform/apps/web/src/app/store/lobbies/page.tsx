'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LOBBY_ITEMS, formatPrice } from '@/lib/store/StoreItemEngine';
import QuickBuyButton from '@/components/store/QuickBuyButton';

const LOBBY_PREVIEW: Record<string, { bg: string; accent: string }> = {
  'lobby-neon':       { bg: 'linear-gradient(135deg, #0a0018, #12002a)', accent: '#AA2DFF' },
  'lobby-cinema':     { bg: 'linear-gradient(135deg, #0a0808, #150f00)', accent: '#FF6B35' },
  'lobby-futuristic': { bg: 'linear-gradient(135deg, #000818, #001028)', accent: '#00FFFF' },
  'lobby-cypher':     { bg: 'linear-gradient(135deg, #0a0800, #12100a)', accent: '#FFD700' },
  'lobby-chill':      { bg: 'linear-gradient(135deg, #080810, #100a18)', accent: '#00FF88' },
};

export default function LobbyStorePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '52px 24px 40px' }}>
        <Link href="/store" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>← Back to Store</Link>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#FFD700', fontWeight: 800, marginBottom: 10 }}>FAN LOBBY SKINS</div>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, margin: '0 0 12px' }}>Make Your World Yours.</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
          Choose your lobby skin and bring your personal vibe into every room you enter. No two fans have to look the same.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {LOBBY_ITEMS.map((item, i) => {
            const preview = LOBBY_PREVIEW[item.id] ?? { bg: 'linear-gradient(135deg,#0d0d1a,#1a1a2e)', accent: '#FFD700' };
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${preview.accent}25`, display: 'flex', flexDirection: 'column' }}
              >
                {/* Preview window */}
                <div style={{ height: 90, background: preview.bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 36 }}>{item.icon}</span>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 20px, ${preview.accent}06 20px, ${preview.accent}06 21px)` }} />
                </div>
                <div style={{ padding: '14px 16px', background: `${preview.accent}05`, flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, flex: 1 }}>{item.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: preview.accent }}>{formatPrice(item.price)}</div>
                    <QuickBuyButton item={item} accentColor={preview.accent} />
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
