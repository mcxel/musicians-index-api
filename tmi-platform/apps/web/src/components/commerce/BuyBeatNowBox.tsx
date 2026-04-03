"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BuyBeatNowBoxProps {
  beatTitle: string;
  artist: string;
  bpm: number;
  key?: string;
  prices: { label: string; price: number; features: string[] }[];
  onPurchase?: (tier: string) => void;
}

export default function BuyBeatNowBox({ beatTitle, artist, bpm, key: beatKey, prices, onPurchase }: BuyBeatNowBoxProps) {
  const [selected, setSelected] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [done, setDone] = useState(false);

  const handleBuy = async () => {
    setPurchasing(true);
    await new Promise(r => setTimeout(r, 1200));
    setPurchasing(false);
    setDone(true);
    onPurchase?.(prices[selected].label);
  };

  return (
    <div style={{
      background: '#070718',
      border: '1px solid #AA2DFF44',
      borderRadius: 14,
      overflow: 'hidden',
      width: '100%', maxWidth: 400,
    }}>
      {/* Track info */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #111', background: '#0A0020' }}>
        <div style={{ color: '#AA2DFF', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>🎵 BUY THIS BEAT</div>
        <div style={{ color: '#FFF', fontWeight: 700, fontSize: 18, marginTop: 4 }}>{beatTitle}</div>
        <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{artist} · {bpm} BPM{beatKey ? ` · Key of ${beatKey}` : ''}</div>
      </div>

      {/* License tiers */}
      <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {prices.map((tier, i) => (
          <motion.button
            key={tier.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(i)}
            style={{
              padding: '10px 14px',
              background: selected === i ? '#AA2DFF22' : '#0A0A1A',
              border: `1px solid ${selected === i ? '#AA2DFF' : '#222'}`,
              borderRadius: 8, cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ color: selected === i ? '#AA2DFF' : '#CCC', fontWeight: 700, fontSize: 13 }}>{tier.label}</div>
              <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{tier.features.join(' · ')}</div>
            </div>
            <div style={{ color: selected === i ? '#FFD700' : '#888', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>
              ${tier.price}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Buy button */}
      <div style={{ padding: '12px 18px' }}>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: 12, background: '#001908', border: '1px solid #00FF8844',
                borderRadius: 8, textAlign: 'center', color: '#00FF88', fontWeight: 700, fontSize: 14,
              }}
            >✅ PURCHASE COMPLETE — Check your email</motion.div>
          ) : (
            <motion.button key="buy"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBuy}
              disabled={purchasing}
              style={{
                width: '100%', padding: '13px',
                background: purchasing ? '#333' : 'linear-gradient(135deg, #AA2DFF, #FF2DAA)',
                border: 'none', borderRadius: 10,
                color: '#FFF', fontWeight: 700, cursor: purchasing ? 'default' : 'pointer',
                fontSize: 14, letterSpacing: 1,
              }}
            >
              {purchasing ? 'PROCESSING...' : `BUY — $${prices[selected].price}`}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
