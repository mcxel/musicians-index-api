'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import SectionTitle from '@/components/ui/SectionTitle';

type ShopItem = {
  id: string;
  name: string;
  price: number;
  category: 'CLOTHING' | 'PROP' | 'EMOTE' | 'BACKGROUND' | 'EFFECT';
  emoji: string;
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
};

const RARITY_COLORS: Record<string, string> = { COMMON: '#aaa', RARE: '#00FFFF', EPIC: '#AA2DFF', LEGENDARY: '#FFD700' };

const STUB_SHOP: ShopItem[] = [
  { id: '1', name: 'Gold Chain', price: 2.99, category: 'PROP', emoji: '📿', rarity: 'RARE' },
  { id: '2', name: 'Neon Mic', price: 1.99, category: 'PROP', emoji: '🎙️', rarity: 'COMMON' },
  { id: '3', name: 'Crown Hat', price: 4.99, category: 'CLOTHING', emoji: '👑', rarity: 'LEGENDARY' },
  { id: '4', name: 'Producer Headphones', price: 3.49, category: 'PROP', emoji: '🎧', rarity: 'RARE' },
  { id: '5', name: 'Cypher Jacket', price: 5.99, category: 'CLOTHING', emoji: '🥼', rarity: 'EPIC' },
  { id: '6', name: 'Stage Fire Effect', price: 2.49, category: 'EFFECT', emoji: '🔥', rarity: 'EPIC' },
  { id: '7', name: 'Dab Emote', price: 0.99, category: 'EMOTE', emoji: '💃', rarity: 'COMMON' },
  { id: '8', name: 'Studio Background', price: 3.99, category: 'BACKGROUND', emoji: '🎚️', rarity: 'RARE' },
  { id: '9', name: 'Neon City Background', price: 4.49, category: 'BACKGROUND', emoji: '🌆', rarity: 'EPIC' },
  { id: '10', name: 'Clap It Up Emote', price: 0.99, category: 'EMOTE', emoji: '👏', rarity: 'COMMON' },
  { id: '11', name: 'Diamond Grills', price: 6.99, category: 'CLOTHING', emoji: '💎', rarity: 'LEGENDARY' },
  { id: '12', name: 'Smoke Effect', price: 1.99, category: 'EFFECT', emoji: '💨', rarity: 'RARE' },
];

const CATS = ['ALL', 'CLOTHING', 'PROP', 'EMOTE', 'BACKGROUND', 'EFFECT'];

export default function AvatarShopPage() {
  const [items, setItems] = useState<ShopItem[]>(STUB_SHOP);
  const [filter, setFilter] = useState('ALL');
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/avatar/shop')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length) setItems(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? items : items.filter((i) => i.category === filter);
  const purchase = (id: string) => {
    // TODO: Stripe checkout
    setOwned((prev) => [...prev, id]);
  };

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
          <div style={{ background: 'linear-gradient(160deg, #1a0528 0%, #050510 60%)', padding: '48px 32px 32px', borderBottom: '1px solid #FFD70033' }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: '#FFD700', marginBottom: 8 }}>AVATAR CENTER</div>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>AVATAR SHOP</h1>
            <p style={{ color: '#aaa', fontSize: 14 }}>Props, clothing, emotes, backgrounds and effects for your avatar.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24 }}>
              {CATS.map((c) => (
                <button key={c} onClick={() => setFilter(c)} style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${filter === c ? '#FFD700' : '#333'}`, background: filter === c ? '#FFD70022' : 'transparent', color: filter === c ? '#FFD700' : '#888', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontWeight: 700 }}>{c}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '48px 32px 0' }}>
            <SectionTitle accent="#FFD700">SHOP ITEMS</SectionTitle>
            {loading && <div style={{ color: '#555', padding: '40px 0' }}>Loading shop…</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginTop: 24 }}>
              {filtered.map((item, i) => {
                const rarityColor = RARITY_COLORS[item.rarity ?? 'COMMON'];
                const isOwned = owned.includes(item.id);
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} style={{ background: '#0a0a1a', border: `1px solid #1a1a2e`, borderTop: `2px solid ${rarityColor}`, borderRadius: 12, overflow: 'hidden', textAlign: 'center' }}>
                    <div style={{ height: 100, background: `linear-gradient(135deg, ${rarityColor}22 0%, #050510 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                      {item.emoji}
                    </div>
                    <div style={{ padding: '12px 14px 16px' }}>
                      <div style={{ color: rarityColor, fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>{item.rarity}</div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ color: '#555', fontSize: 10, marginBottom: 12 }}>{item.category}</div>
                      <div style={{ color: '#fff', fontWeight: 900, fontSize: 16, marginBottom: 10 }}>${item.price.toFixed(2)}</div>
                      <button onClick={() => purchase(item.id)} disabled={isOwned} style={{ width: '100%', background: isOwned ? '#222' : '#FFD700', color: isOwned ? '#555' : '#000', fontWeight: 800, fontSize: 11, letterSpacing: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: isOwned ? 'default' : 'pointer' }}>
                        {isOwned ? 'OWNED' : 'BUY'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <Link href="/avatar/inventory" style={{ color: '#AA2DFF', fontSize: 13, letterSpacing: 1 }}>View your inventory →</Link>
            </div>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
