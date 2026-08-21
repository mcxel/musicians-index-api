'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FAN_ITEMS, formatPrice } from '@/lib/store/StoreItemEngine';
import QuickBuyButton from '@/components/store/QuickBuyButton';
import BuyPointsSection from '@/components/store/BuyPointsSection';
import { listFanStoreItems } from '@/lib/xp/FanStoreEngine';
import { BOBBLEHEAD_ACCESSORY_TEMPLATES } from '@/lib/avatars/BobbleheadBaseRegistry';
import {
  FAN_STORE_FILTERS,
  getFanCosmeticCatalogStats,
  getUnifiedFanCosmeticCatalog,
  listFanCosmeticsByStoreFilter,
  type FanCosmeticDef,
  type FanStoreFilterId,
} from '@/lib/avatars/FanCosmeticCatalog';
import RoleGate from '@/components/auth/RoleGate';

const BADGE_COLORS: Record<string, string> = {
  HOT: '#FF2DAA', NEW: '#00FF88', LIMITED: '#FFD700', LAUNCH: '#AA2DFF',
};

function CosmeticCard({ item }: { item: FanCosmeticDef }) {
  const cashDisabled = !item.stripeProductId;
  const kind =
    item.emoteKind === 'action'
      ? 'ACTION'
      : item.emoteKind === 'dance'
        ? 'DANCE'
        : item.emoteKind === 'gesture'
          ? 'GESTURE'
          : item.colorwayOf
            ? 'COLORWAY'
            : null;
  return (
    <div
      style={{
        background: 'rgba(0,255,255,0.05)',
        border: `1px solid ${item.accent}33`,
        borderRadius: 12,
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 26 }}>{item.icon}</span>
        {kind && (
          <span style={{ fontSize: 8, color: '#FFD700', fontWeight: 800 }}>{kind}</span>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800 }}>{item.label}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, flex: 1 }}>
        {item.description}
      </div>
      {item.emoteKind === 'action' && (
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
          cd {(item.cooldownMs ?? 0) / 1000}s · cost {item.performanceCost ?? 0} · r{item.visibilityRadius ?? 0}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#00FFFF' }}>
          {item.pointsCost === 0 ? 'FREE' : `${item.pointsCost} pts`}
        </div>
        <div style={{ fontSize: 8, color: cashDisabled ? 'rgba(255,255,255,0.3)' : '#00FF88', fontWeight: 700 }}>
          {cashDisabled ? 'STRIPE N/A · points only' : 'CASH READY'}
        </div>
      </div>
    </div>
  );
}

export default function FanStorePage() {
  const [filter, setFilter] = useState<FanStoreFilterId | 'ALL'>('ALL');
  const bobbleheadStoreItems = listFanStoreItems().filter((i) => i.itemType === 'avatar-item' || i.itemType === 'emote');
  const catalog = getUnifiedFanCosmeticCatalog();
  const stats = getFanCosmeticCatalogStats();

  const filtered = useMemo(() => {
    if (filter === 'ALL') return catalog;
    return listFanCosmeticsByStoreFilter(filter);
  }, [catalog, filter]);

  return (
    <RoleGate
      allow={['FAN', 'USER', 'ADMIN', 'STAFF']}
      fallback={
        <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 48 }}>
          <div style={{ maxWidth: 560, margin: '0 auto', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Fan Store cosmetics are Fan-only (Rule 26). Sign in as Fan to shop AvatarRig gear.
          </div>
        </main>
      }
    >
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '52px 24px 40px' }}>
        <Link href="/store" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>← Back to Store</Link>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#00FFFF', fontWeight: 800, marginBottom: 10 }}>FAN STORE</div>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, margin: '0 0 12px' }}>Show Up. Level Up. Stand Out.</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.7, marginBottom: 20 }}>
          AvatarRig cosmetics, Dance Emotes, Action Emotes, props, and camp-band instruments — Fan-only. Colorways are separate SKUs. Acquire here · equip in Creation Center.
        </p>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
          Catalog {stats.total} · hair {stats.hair} · eyewear {stats.glasses} · headwear {stats.headwear} ·
          tops {stats.tops} · bottoms {stats.bottoms} · dances {stats.dances} · actions {stats.actionEmotes} ·
          auras {stats.auras} · entrances {stats.entrances} · props {stats.props} · instruments {stats.instruments} ·
          skin stops {stats.skinStops} · colorways {stats.colorwaySkus} · Stripe wired {stats.stripeWired}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '6px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              border: filter === 'ALL' ? '1px solid #00FFFF' : '1px solid rgba(255,255,255,0.12)',
              background: filter === 'ALL' ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === 'ALL' ? '#00FFFF' : 'rgba(255,255,255,0.55)',
            }}
          >
            ALL
          </button>
          {FAN_STORE_FILTERS.map((f) => {
            const active = filter === f.id;
            const count = listFanCosmeticsByStoreFilter(f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  padding: '6px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: active ? '1px solid #FF2DAA' : '1px solid rgba(255,255,255,0.12)',
                  background: active ? 'rgba(255,45,170,0.15)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#FF2DAA' : 'rgba(255,255,255,0.55)',
                }}
              >
                {f.label} · {count}
              </button>
            );
          })}
        </div>

        <BuyPointsSection role="FAN" accent="#00FFFF" showSpendCatalog />

        <div id="cosmetics-catalog" style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 12 }}>
            {filter === 'ALL' ? 'FULL CATALOG' : filter.replace(/_/g, ' ')} · {filtered.length}
          </div>
          {filtered.length === 0 ? (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', padding: '24px 0' }}>
              No SKUs in this filter yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {filtered.map((item) => (
                <CosmeticCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        <div id="bobblehead-accessories" style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#AA2DFF', fontWeight: 800, marginBottom: 8 }}>
            BOBBLEHEAD ACCESSORIES
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.5 }}>
            Fan-only fit templates → AvatarRig socket attachments in lobbies/venues. Procedural 3D — not sticker cutouts. Photoreal GLB pending.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            {BOBBLEHEAD_ACCESSORY_TEMPLATES.map((acc) => (
              <div
                key={acc.id}
                style={{
                  background: 'rgba(170,45,255,0.06)',
                  border: '1px solid rgba(170,45,255,0.25)',
                  borderRadius: 12,
                  padding: '14px 14px',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{acc.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{acc.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4, lineHeight: 1.4 }}>{acc.description}</div>
                <div style={{ fontSize: 11, color: '#00FFFF', marginTop: 8, fontWeight: 700 }}>
                  {acc.pointsCost === 0 ? 'FREE' : `${acc.pointsCost} pts`}
                  {acc.cosmeticSkuId ? ` · SKU ${acc.cosmeticSkuId}` : ''}
                </div>
              </div>
            ))}
          </div>
          {bobbleheadStoreItems.length > 0 && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
              Store engine seeded {bobbleheadStoreItems.length} avatar/emote rows for Fan inventory.
            </div>
          )}
        </div>

        <div id="cosmetics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
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
    </RoleGate>
  );
}
