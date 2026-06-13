'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';

type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
type Category = 'PROP' | 'EMOTE' | 'CLOTHING' | 'BACKGROUND' | 'EFFECT';

interface AvatarItem {
  id: string; name: string; category: Category;
  emoji: string; equipped: boolean; rarity: Rarity;
  acquiredAt: string;
}

const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: '#9ca3af', RARE: '#00FFFF', EPIC: '#AA2DFF', LEGENDARY: '#FFD700',
};

const SEED_INVENTORY: AvatarItem[] = [
  { id: 'i01', name: 'Neon Mic',           category: 'PROP',       emoji: '🎙️', equipped: true,  rarity: 'COMMON',    acquiredAt: 'Jan 2026' },
  { id: 'i02', name: 'Dab Emote',          category: 'EMOTE',      emoji: '💃',  equipped: false, rarity: 'COMMON',    acquiredAt: 'Jan 2026' },
  { id: 'i03', name: 'Street Fit',         category: 'CLOTHING',   emoji: '👕',  equipped: true,  rarity: 'COMMON',    acquiredAt: 'Feb 2026' },
  { id: 'i04', name: 'Clap It Up',         category: 'EMOTE',      emoji: '👏',  equipped: false, rarity: 'COMMON',    acquiredAt: 'Feb 2026' },
  { id: 'i05', name: 'Gold Chain',         category: 'PROP',       emoji: '📿',  equipped: true,  rarity: 'RARE',      acquiredAt: 'Feb 2026' },
  { id: 'i06', name: 'Producer Cans',      category: 'PROP',       emoji: '🎧',  equipped: false, rarity: 'RARE',      acquiredAt: 'Mar 2026' },
  { id: 'i07', name: 'Cypher Jacket',      category: 'CLOTHING',   emoji: '🥼',  equipped: true,  rarity: 'EPIC',      acquiredAt: 'Mar 2026' },
  { id: 'i08', name: 'Stage Fire',         category: 'EFFECT',     emoji: '🔥',  equipped: false, rarity: 'EPIC',      acquiredAt: 'Apr 2026' },
  { id: 'i09', name: 'Studio Backdrop',    category: 'BACKGROUND', emoji: '🎚️',  equipped: true,  rarity: 'RARE',      acquiredAt: 'Apr 2026' },
  { id: 'i10', name: 'Crown Hat',          category: 'CLOTHING',   emoji: '👑',  equipped: false, rarity: 'LEGENDARY', acquiredAt: 'May 2026' },
  { id: 'i11', name: 'Diamond Grills',     category: 'CLOTHING',   emoji: '💎',  equipped: false, rarity: 'LEGENDARY', acquiredAt: 'May 2026' },
  { id: 'i12', name: 'Smoke Effect',       category: 'EFFECT',     emoji: '💨',  equipped: false, rarity: 'RARE',      acquiredAt: 'May 2026' },
  { id: 'i13', name: 'Neon City BG',       category: 'BACKGROUND', emoji: '🌆',  equipped: false, rarity: 'EPIC',      acquiredAt: 'Jun 2026' },
  { id: 'i14', name: 'OG Battle Fit',      category: 'CLOTHING',   emoji: '⚔️',  equipped: false, rarity: 'EPIC',      acquiredAt: 'Jun 2026' },
  { id: 'i15', name: 'Mic Drop Emote',     category: 'EMOTE',      emoji: '🎤',  equipped: false, rarity: 'RARE',      acquiredAt: 'Jun 2026' },
];

const CATS: (Category | 'ALL')[] = ['ALL', 'CLOTHING', 'PROP', 'EMOTE', 'BACKGROUND', 'EFFECT'];

export default function AvatarInventoryPage() {
  const [items, setItems] = useState<AvatarItem[]>(SEED_INVENTORY);
  const [filter, setFilter]         = useState<Category | 'ALL'>('ALL');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'ALL'>('ALL');
  const [view, setView]             = useState<'equipped' | 'all'>('all');

  const toggleEquip = (id: string) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, equipped: !it.equipped } : it));

  const displayed = items.filter(i =>
    (filter === 'ALL'       || i.category === filter) &&
    (rarityFilter === 'ALL' || i.rarity === rarityFilter) &&
    (view === 'all'         || i.equipped)
  );

  const equippedCount  = items.filter(i => i.equipped).length;
  const totalCount     = items.length;
  const legendaryCount = items.filter(i => i.rarity === 'LEGENDARY').length;
  const epicCount      = items.filter(i => i.rarity === 'EPIC').length;

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 100 }}>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

          {/* Header */}
          <div style={{ background: 'linear-gradient(160deg, #1a0528 0%, #050510 70%)', padding: '48px 32px 28px', borderBottom: '1px solid rgba(170,45,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Link href="/home/1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>TMI</Link>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>›</span>
                  <Link href="/avatar/shop" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Avatar Shop</Link>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>›</span>
                  <span style={{ fontSize: 10, color: '#AA2DFF' }}>Inventory</span>
                </div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: '#AA2DFF', marginBottom: 6, fontWeight: 800 }}>AVATAR CENTER</div>
                <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 6px' }}>My Inventory</h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0 }}>All your avatar items. Equip, swap, and customize your look.</p>
              </div>
              <Link href="/avatar/shop" style={{ padding: '10px 22px', borderRadius: 9, background: '#AA2DFF', color: '#fff', fontWeight: 900, fontSize: 11, textDecoration: 'none', letterSpacing: '0.08em' }}>+ GET MORE ITEMS</Link>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Items',  value: totalCount,     color: '#AA2DFF' },
                { label: 'Equipped',     value: equippedCount,  color: '#00FFFF' },
                { label: 'Legendary',    value: legendaryCount, color: '#FFD700' },
                { label: 'Epic',         value: epicCount,      color: '#AA2DFF' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 18px', background: `${s.color}10`, border: `1px solid ${s.color}25`, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '28px 32px' }}>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setFilter(c)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter === c ? '#AA2DFF' : '#333'}`, background: filter === c ? '#AA2DFF22' : 'transparent', color: filter === c ? '#AA2DFF' : '#888', fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', fontWeight: 700 }}>{c}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {(['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map(r => {
                const c = r === 'ALL' ? 'rgba(255,255,255,0.5)' : RARITY_COLORS[r as Rarity];
                return (
                  <button key={r} onClick={() => setRarityFilter(r)} style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${rarityFilter === r ? c : '#333'}`, background: rarityFilter === r ? `${c}20` : 'transparent', color: rarityFilter === r ? c : '#666', fontSize: 9, letterSpacing: '0.12em', cursor: 'pointer', fontWeight: 700 }}>{r}</button>
                );
              })}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {(['all', 'equipped'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${view === v ? '#00FFFF' : '#333'}`, background: view === v ? '#00FFFF15' : 'transparent', color: view === v ? '#00FFFF' : '#666', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer', fontWeight: 700 }}>{v.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
              <AnimatePresence>
                {displayed.map((item, i) => {
                  const rc = RARITY_COLORS[item.rarity];
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.04 }}
                      style={{ background: item.equipped ? `${rc}0A` : '#0a0a1a', border: `1px solid ${item.equipped ? rc + '40' : '#1a1a2e'}`, borderTop: `2px solid ${rc}`, borderRadius: 12, overflow: 'hidden', textAlign: 'center', position: 'relative' }}>
                      {item.equipped && <div style={{ position: 'absolute', top: 6, right: 6, fontSize: 7, fontWeight: 900, color: '#00FFFF', background: 'rgba(0,255,255,0.15)', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.1em' }}>ON</div>}
                      <div style={{ height: 90, background: `linear-gradient(135deg, ${rc}18 0%, rgba(5,5,16,0.95) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{item.emoji}</div>
                      <div style={{ padding: '10px 12px 14px' }}>
                        <div style={{ color: rc, fontSize: 8, letterSpacing: '0.15em', fontWeight: 800, marginBottom: 3 }}>{item.rarity}</div>
                        <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
                        <div style={{ color: '#555', fontSize: 9, marginBottom: 10 }}>{item.category} · {item.acquiredAt}</div>
                        <button onClick={() => toggleEquip(item.id)} style={{ width: '100%', background: item.equipped ? '#00FFFF1A' : `${rc}1A`, color: item.equipped ? '#00FFFF' : rc, fontWeight: 800, fontSize: 10, letterSpacing: '0.06em', padding: '7px', borderRadius: 6, border: `1px solid ${item.equipped ? '#00FFFF44' : rc + '44'}`, cursor: 'pointer', transition: 'all .15s' }}>
                          {item.equipped ? 'UNEQUIP' : 'EQUIP'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {displayed.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                  No items match this filter.
                </div>
              )}
            </div>

            <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/avatar/shop" style={{ padding: '11px 28px', borderRadius: 9, background: '#AA2DFF', color: '#fff', fontWeight: 900, fontSize: 12, textDecoration: 'none' }}>GET MORE ITEMS →</Link>
              <Link href="/settings" style={{ padding: '11px 20px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>AVATAR SETTINGS</Link>
            </div>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
