"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';
import BubbleCharacterComp from '@/components/avatar/BubbleCharacter';
import type { BubbleCharacter } from '@/lib/avatar/bubbleEngine';

const SPONSOR_ITEMS = [
  { id: 'hype-crown', label: 'Hype Crown', color: '#FFD700', icon: '👑' },
  { id: 'neon-chain', label: 'Neon Chain', color: '#00FFFF', icon: '⛓️' },
  { id: 'fire-badge', label: 'Fire Badge', color: '#FF2200', icon: '🔥' },
  { id: 'star-aura', label: 'Star Aura', color: '#AA2DFF', icon: '✨' },
  { id: 'golden-mic', label: 'Golden Mic', color: '#FFD700', icon: '🎤' },
  { id: 'diamond-ring', label: 'Diamond Ring', color: '#00FFFF', icon: '💎' },
];

export default function BubbleCustomizePage() {
  const router = useRouter();
  const [bubble, setBubble] = useState<BubbleCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { loadBubble } = await import('@/lib/avatar/bubbleEngine');
        const b = await loadBubble('me');
        setBubble(b);
      } catch {
        /* no bubble yet */
      }
      setLoading(false);
    }
    load();
  }, []);

  function toggleSponsorItem(itemId: string) {
    if (!bubble) return;
    const current = bubble.sponsorItems ?? [];
    const next = current.includes(itemId)
      ? current.filter(i => i !== itemId)
      : [...current, itemId];
    setBubble({ ...bubble, sponsorItems: next });
  }

  async function handleSave() {
    if (!bubble) return;
    const { saveBubble } = await import('@/lib/avatar/bubbleEngine');
    await saveBubble(bubble, 'me');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '24px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: '#AA2DFF', margin: 0 }}
            >
              BUBBLE COSMETICS
            </motion.h1>
            <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
              Sponsor items · Collectibles · Cosmetic layers
            </p>
          </div>

          {loading && <p style={{ color: '#555', textAlign: 'center', marginTop: 60 }}>Loading…</p>}

          {!loading && !bubble && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <p style={{ color: '#888' }}>No bubble character found.</p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/bubble-builder')}
                style={{
                  marginTop: 16, padding: '10px 28px',
                  background: 'linear-gradient(135deg,#FF2DAA,#AA2DFF)',
                  border: 'none', borderRadius: 8, color: '#fff',
                  fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                BUILD BUBBLE FIRST
              </motion.button>
            </div>
          )}

          {!loading && bubble && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
              {/* Preview */}
              <div style={{ flex: '0 0 180px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <BubbleCharacterComp bubble={bubble} size={130} showNameTag showRankBadge isActive />
                <div style={{ color: '#555', fontSize: 11, letterSpacing: 2 }}>PREVIEW</div>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid #222',
                  borderRadius: 8, padding: '8px 14px', textAlign: 'center',
                }}>
                  <div style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>ACTIVE ITEMS</div>
                  {(bubble.sponsorItems ?? []).length === 0
                    ? <span style={{ color: '#333', fontSize: 11 }}>none</span>
                    : (bubble.sponsorItems ?? []).map(id => {
                        const item = SPONSOR_ITEMS.find(s => s.id === id);
                        return item
                          ? <div key={id} style={{ fontSize: 16 }}>{item.icon}</div>
                          : null;
                      })
                  }
                </div>
              </div>

              {/* Sponsor items */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ color: '#FFD700', fontSize: 13, letterSpacing: 3, marginBottom: 14 }}>
                  SPONSOR ITEMS
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                  {SPONSOR_ITEMS.map(item => {
                    const active = (bubble.sponsorItems ?? []).includes(item.id);
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleSponsorItem(item.id)}
                        style={{
                          padding: '12px',
                          background: active ? `rgba(${hexToRgb(item.color)},0.12)` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${active ? item.color : '#222'}`,
                          borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
                        <div style={{ color: active ? item.color : '#666', fontSize: 12, fontWeight: 700 }}>
                          {item.label}
                        </div>
                        <div style={{ color: '#333', fontSize: 10, marginTop: 2 }}>
                          {active ? '✓ EQUIPPED' : 'tap to equip'}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSave}
                  style={{
                    width: '100%', padding: '13px 0',
                    background: saved ? '#00FF88' : 'linear-gradient(135deg,#AA2DFF,#FF2DAA)',
                    border: 'none', borderRadius: 10,
                    color: saved ? '#050510' : '#fff',
                    fontSize: 14, fontWeight: 800, letterSpacing: 3, cursor: 'pointer',
                  }}
                >
                  {saved ? '✓ SAVED' : 'SAVE COSMETICS'}
                </motion.button>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button
                    onClick={() => router.push('/bubble-builder')}
                    style={{
                      background: 'none', border: 'none', color: '#444',
                      fontSize: 12, cursor: 'pointer', textDecoration: 'underline',
                    }}
                  >
                    ← Back to Bubble Builder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
