'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CREATOR_ITEMS, formatPrice } from '@/lib/store/StoreItemEngine';
import QuickBuyButton from '@/components/store/QuickBuyButton';
import BuyPointsSection from '@/components/store/BuyPointsSection';
import CreateProductPanel from '@/components/store/CreateProductPanel';
import { StoreCanister } from '@/components/canisters/StoreCanister';

const BADGE_COLORS: Record<string, string> = {
  HOT: '#FF2DAA', NEW: '#00FF88', LIMITED: '#FFD700', LAUNCH: '#AA2DFF',
};

export default function CreatorStorePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '52px 24px 40px' }}>
        <Link href="/store" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>← Back to Store</Link>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#FF2DAA', fontWeight: 800, marginBottom: 10 }}>CREATOR STORE</div>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, margin: '0 0 12px' }}>Perform Better. Grow Faster.</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
          Boosts, beats, spotlights, venues, shoutouts, NFTs — everything a performer needs to level up and earn more.
        </p>

        {/* Revenue split callout — seller tier ladder; Big Ace 0 */}
        <div style={{ background: 'rgba(255,45,170,0.08)', border: '1px solid rgba(255,45,170,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'inline-block' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FF2DAA', fontWeight: 800, marginBottom: 4 }}>CREATOR PLATFORM FEE (BY TIER)</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            FREE <strong style={{ color: '#FF2DAA' }}>20%</strong> · PRO <strong style={{ color: '#FF2DAA' }}>18%</strong> · RUBY <strong style={{ color: '#FF2DAA' }}>16%</strong> · SILVER <strong style={{ color: '#FF2DAA' }}>14%</strong><br />
            GOLD <strong style={{ color: '#FF2DAA' }}>12%</strong> · PLATINUM <strong style={{ color: '#FF2DAA' }}>10%</strong> · DIAMOND <strong style={{ color: '#FF2DAA' }}>8%</strong><br />
            You keep the rest on tips, beats, merch, NFT, shoutouts. Big Ace = 0. Artist store prices are set per-product in your catalog below — not via STRIPE_PRICE_* env.
          </div>
        </div>

        <BuyPointsSection role="PERFORMER" accent="#FF2DAA" showSpendCatalog />

        <div style={{ marginBottom: 36 }}>
          <CreateProductPanel />
        </div>

        <div style={{ marginBottom: 36 }}>
          <StoreCanister
            entityId="me"
            entityName="Your Catalog"
            storeType="performer"
            accentColor="#FF2DAA"
            manageHref="/store/creator"
          />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 10 }}>
            Your live catalog loads from your artist account after you publish products above. Fans buy via /api/commerce/checkout — not STRIPE_PRICE_* env vars.
          </p>
        </div>

        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 14 }}>
          PLATFORM TOOLS (TMI-OWNED — SEPARATE FROM YOUR ARTIST STORE)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
          {CREATOR_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'rgba(255,45,170,0.06)', border: '1px solid rgba(255,45,170,0.22)', borderRadius: 14, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}
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
                <div style={{ fontSize: 10, color: '#00FF88' }}>↑ {Math.round(item.creatorSplit * 100)}% goes to creator</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#FF2DAA' }}>
                  {formatPrice(item.price)}
                  {item.mode === 'subscription' && <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>/mo</span>}
                </div>
                <QuickBuyButton item={item} accentColor="#FF2DAA" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
