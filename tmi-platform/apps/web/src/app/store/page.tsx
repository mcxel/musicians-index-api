'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import SectionTitle from '@/components/ui/SectionTitle';

type StoreItem = {
  id: string;
  name: string;
  price: number;
  type: 'MERCH' | 'DIGITAL' | 'AVATAR' | 'TICKET';
  description?: string;
  imageEmoji?: string;
  stock?: number | null;
};

const STUB_ITEMS: StoreItem[] = [
  { id: '1', name: 'TMI Crown Hoodie', price: 49.99, type: 'MERCH', description: 'Premium heavyweight hoodie — limited run', imageEmoji: '👑', stock: 14 },
  { id: '2', name: 'Cypher Champion Tee', price: 29.99, type: 'MERCH', description: 'Official Cypher Arena competitor tee', imageEmoji: '🎤', stock: 32 },
  { id: '3', name: 'Beat Pack Vol. 1', price: 19.99, type: 'DIGITAL', description: '12 exclusive producer beats — instant download', imageEmoji: '🎵', stock: null },
  { id: '4', name: 'Magazine Issue #001', price: 4.99, type: 'DIGITAL', description: 'Inaugural digital magazine — collector edition', imageEmoji: '📰', stock: null },
  { id: '5', name: 'Gold Chain Avatar Prop', price: 2.99, type: 'AVATAR', description: 'Equip in your avatar loadout', imageEmoji: '🏆', stock: null },
  { id: '6', name: 'Neon Mic Avatar Prop', price: 1.99, type: 'AVATAR', description: 'Mic with neon glow effect', imageEmoji: '🎙️', stock: null },
  { id: '7', name: 'Crown Night VIP Ticket', price: 75.00, type: 'TICKET', description: 'VIP access — Crown Night Live, Atlanta', imageEmoji: '🎟️', stock: 8 },
  { id: '8', name: 'TMI Cap', price: 34.99, type: 'MERCH', description: 'Structured snapback — embroidered logo', imageEmoji: '🧢', stock: 27 },
];

const TYPE_COLORS: Record<string, string> = { MERCH: '#FF2DAA', DIGITAL: '#00FFFF', AVATAR: '#AA2DFF', TICKET: '#FFD700' };
const FILTERS = ['ALL', 'MERCH', 'DIGITAL', 'AVATAR', 'TICKET'];

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>(STUB_ITEMS);
  const [filter, setFilter] = useState('ALL');
  const [cart, setCart] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/store/items?limit=24')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length) setItems(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? items : items.filter((item) => item.type === filter);
  const addToCart = (id: string) => setCart((prev) => prev.includes(id) ? prev : [...prev, id]);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
          {/* Hero */}
          <div style={{ background: 'linear-gradient(160deg, #1a0514 0%, #050510 60%)', padding: '64px 32px 48px', borderBottom: '1px solid #FF2DAA33' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: '#FF2DAA', textTransform: 'uppercase', marginBottom: 12 }}>TMI OFFICIAL STORE</div>
                  <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>STORE</h1>
                  <p style={{ color: '#aaa', fontSize: 16, maxWidth: 480 }}>Merch, digital drops, avatar props, and event tickets — all in one place.</p>
                </div>
                {cart.length > 0 && (
                  <div style={{ background: '#FF2DAA22', border: '1px solid #FF2DAA', borderRadius: 12, padding: '14px 20px', textAlign: 'center' }}>
                    <div style={{ color: '#FF2DAA', fontWeight: 900, fontSize: 22 }}>{cart.length}</div>
                    <div style={{ color: '#FF2DAA88', fontSize: 11, letterSpacing: 1 }}>IN CART</div>
                    <button style={{ marginTop: 8, background: '#FF2DAA', color: '#000', fontWeight: 800, fontSize: 11, letterSpacing: 2, padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer' }} onClick={() => alert('Stripe checkout — coming soon!')}>CHECKOUT</button>
                  </div>
                )}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 32 }}>
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${filter === f ? '#FF2DAA' : '#333'}`, background: filter === f ? '#FF2DAA22' : 'transparent', color: filter === f ? '#FF2DAA' : '#888', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontWeight: 700 }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '48px 32px 0' }}>
            <SectionTitle accent="#FF2DAA">{filter === 'ALL' ? 'ALL ITEMS' : filter}</SectionTitle>
            {loading && <div style={{ color: '#555', padding: '40px 0' }}>Loading store…</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginTop: 24 }}>
              {filtered.map((item, i) => {
                const accent = TYPE_COLORS[item.type] ?? '#00FFFF';
                const inCart = cart.includes(item.id);
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: '#0a0a1a', border: '1px solid #1a1a2e', borderTop: `2px solid ${accent}`, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ height: 140, background: `linear-gradient(135deg, ${accent}22 0%, #050510 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                      {item.imageEmoji ?? '📦'}
                    </div>
                    <div style={{ padding: '14px 16px 18px' }}>
                      <div style={{ fontSize: 10, letterSpacing: 2, color: accent, marginBottom: 6, fontWeight: 700 }}>{item.type}</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{item.name}</div>
                      {item.description && <div style={{ color: '#666', fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>{item.description}</div>}
                      {item.stock !== null && item.stock !== undefined && (
                        <div style={{ color: item.stock < 10 ? '#FF4444' : '#555', fontSize: 11, marginBottom: 10 }}>{item.stock < 10 ? `⚠ Only ${item.stock} left` : `${item.stock} in stock`}</div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>${item.price.toFixed(2)}</span>
                        <button onClick={() => addToCart(item.id)} style={{ background: inCart ? '#333' : accent, color: inCart ? '#888' : '#000', fontWeight: 800, fontSize: 11, letterSpacing: 1, padding: '8px 14px', borderRadius: 6, border: 'none', cursor: inCart ? 'default' : 'pointer' }}>
                          {inCart ? 'IN CART' : 'ADD TO CART'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
