'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import SectionTitle from '@/components/ui/SectionTitle';

const STUB_INVENTORY = [
  { id: '1', name: 'Neon Mic', category: 'PROP', emoji: '🎙️', equipped: true, rarity: 'COMMON' },
  { id: '2', name: 'Dab Emote', category: 'EMOTE', emoji: '💃', equipped: false, rarity: 'COMMON' },
  { id: '3', name: 'Street Fit', category: 'CLOTHING', emoji: '👕', equipped: true, rarity: 'COMMON' },
  { id: '4', name: 'Clap It Up', category: 'EMOTE', emoji: '👏', equipped: false, rarity: 'COMMON' },
];

const RARITY_COLORS: Record<string, string> = { COMMON: '#aaa', RARE: '#00FFFF', EPIC: '#AA2DFF', LEGENDARY: '#FFD700' };

export default function AvatarInventoryPage() {
  const [items, setItems] = useState(STUB_INVENTORY);

  const toggleEquip = (id: string) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, equipped: !it.equipped } : it));
  };

  const equipped = items.filter((i) => i.equipped);
  const unequipped = items.filter((i) => !i.equipped);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
          <div style={{ background: 'linear-gradient(160deg, #1a0528 0%, #050510 60%)', padding: '48px 32px 32px', borderBottom: '1px solid #AA2DFF33' }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: '#AA2DFF', marginBottom: 8 }}>AVATAR CENTER</div>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>INVENTORY</h1>
            <p style={{ color: '#aaa', fontSize: 14 }}>All your owned avatar items. Equip or unequip at any time.</p>
          </div>

          <div style={{ padding: '48px 32px 0' }}>
            {/* Equipped */}
            <SectionTitle accent="#00FFFF">EQUIPPED ({equipped.length})</SectionTitle>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, marginBottom: 40 }}>
              {equipped.length === 0 && <div style={{ color: '#555', fontSize: 13 }}>Nothing equipped — equip items below.</div>}
              {equipped.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} style={{ background: '#0a1a0a', border: '1px solid #00FFFF44', borderRadius: 12, padding: '16px 20px', minWidth: 140, textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{item.emoji}</div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: '#555', fontSize: 10, marginBottom: 12 }}>{item.category}</div>
                  <button onClick={() => toggleEquip(item.id)} style={{ width: '100%', background: '#00FFFF22', color: '#00FFFF', fontWeight: 700, fontSize: 10, letterSpacing: 1, padding: '6px', borderRadius: 6, border: '1px solid #00FFFF44', cursor: 'pointer' }}>UNEQUIP</button>
                </motion.div>
              ))}
            </div>

            {/* Unequipped */}
            <SectionTitle accent="#555">UNEQUIPPED ({unequipped.length})</SectionTitle>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
              {unequipped.length === 0 && <div style={{ color: '#555', fontSize: 13 }}>All items equipped!</div>}
              {unequipped.map((item, i) => {
                const rc = RARITY_COLORS[item.rarity] ?? '#aaa';
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} style={{ background: '#0a0a1a', border: '1px solid #1a1a2e', borderRadius: 12, padding: '16px 20px', minWidth: 140, textAlign: 'center', opacity: 0.7 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{item.emoji}</div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ color: '#555', fontSize: 10, marginBottom: 12 }}>{item.category}</div>
                    <button onClick={() => toggleEquip(item.id)} style={{ width: '100%', background: `${rc}22`, color: rc, fontWeight: 700, fontSize: 10, letterSpacing: 1, padding: '6px', borderRadius: 6, border: `1px solid ${rc}44`, cursor: 'pointer' }}>EQUIP</button>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ marginTop: 48, textAlign: 'center' }}>
              <Link href="/avatar/shop" style={{ background: '#AA2DFF', color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: 2, padding: '12px 28px', borderRadius: 8, textDecoration: 'none' }}>GET MORE ITEMS →</Link>
            </div>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
