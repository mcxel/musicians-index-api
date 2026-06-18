"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

interface TipArtistBoxProps {
  artistName: string;
  artistSlug?: string;
  avatarEmoji?: string;
  onTip?: (amount: number) => void;
}

const PRESET_TIPS = [1, 5, 10, 25, 50, 100];

export default function TipArtistBox({ artistName, artistSlug, avatarEmoji = '🎤', onTip }: TipArtistBoxProps) {
  const [amount, setAmount] = useState(5);
  const [custom, setCustom] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [sending, setSending] = useState(false);

  const finalAmount = isCustom ? parseFloat(custom) || 0 : amount;
  const slug = artistSlug ?? artistName.toLowerCase().replace(/\s+/g, '-');

  const handleTip = async () => {
    if (finalAmount <= 0) return;
    setSending(true);
    onTip?.(finalAmount);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'TIP', artistSlug: slug, amount: Math.round(finalAmount * 100) }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) { window.location.href = data.url; return; }
      throw new Error(data.error ?? 'No session URL');
    } catch {
      setSending(false);
    }
  };

  return (
    <div style={{
      background: '#070718',
      border: '1px solid #FF2DAA44',
      borderRadius: 14,
      overflow: 'hidden',
      width: '100%', maxWidth: 320,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #111',
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#100010',
      }}>
        <span style={{ fontSize: 24 }}>{avatarEmoji}</span>
        <div>
          <div style={{ color: '#FF2DAA', fontSize: 10, letterSpacing: 1, fontWeight: 700 }}>TIP THE ARTIST</div>
          <div style={{ color: '#FFF', fontWeight: 700, fontSize: 14 }}>{artistName}</div>
        </div>
      </div>

      {/* Amounts */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {PRESET_TIPS.map(t => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => { setAmount(t); setIsCustom(false); }}
              style={{
                padding: '7px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: !isCustom && amount === t ? '#FF2DAA' : '#0A0A1A',
                color: !isCustom && amount === t ? '#FFF' : '#888',
                fontWeight: 700, fontSize: 13,
              }}
            >${t}</motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsCustom(true)}
            style={{
              padding: '7px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: isCustom ? '#FF2DAA' : '#0A0A1A',
              color: isCustom ? '#FFF' : '#888',
              fontWeight: 700, fontSize: 13,
            }}
          >OTHER</motion.button>
        </div>

        {isCustom && (
          <input
            type="number"
            min={1}
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="Enter amount"
            style={{
              width: '100%', padding: '9px 12px', marginBottom: 10,
              background: '#0A0A1A', border: '1px solid #FF2DAA66',
              borderRadius: 7, color: '#FFF', fontSize: 14, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        )}

        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => void handleTip()}
          disabled={sending || finalAmount <= 0}
          style={{
            width: '100%', padding: '11px',
            background: sending ? '#333' : 'linear-gradient(135deg, #FF2DAA, #FF9500)',
            border: 'none', borderRadius: 8,
            color: '#FFF', fontWeight: 700, cursor: sending ? 'default' : 'pointer',
            fontSize: 14, letterSpacing: 1,
          }}
        >
          {sending ? 'REDIRECTING TO STRIPE...' : `💸 TIP $${finalAmount}`}
        </motion.button>
      </div>
    </div>
  );
}
