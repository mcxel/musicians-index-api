'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

type ProductType = 'digital' | 'ticket' | 'merch' | 'shoutout' | 'beat' | 'nft';

type ProductDraft = {
  name: string;
  description: string;
  price: string;
  type: ProductType;
  imageUrl: string;
  limited: boolean;
  limitedQty: string;
};

const TYPE_OPTIONS: { value: ProductType; label: string; icon: string; desc: string }[] = [
  { value: 'digital',  label: 'Digital Item',  icon: '💾', desc: 'Song, album, exclusive content' },
  { value: 'beat',     label: 'Beat / Instrumental', icon: '🎹', desc: 'License your beat' },
  { value: 'ticket',   label: 'Ticket',         icon: '🎟️', desc: 'Live event or concert' },
  { value: 'shoutout', label: 'Shoutout',        icon: '📣', desc: 'Personalized video or audio' },
  { value: 'merch',    label: 'Merch',           icon: '👕', desc: 'Shirts, hats, posters' },
  { value: 'nft',      label: 'NFT Drop',        icon: '💎', desc: 'Exclusive digital collectible' },
];

const EMPTY: ProductDraft = { name: '', description: '', price: '', type: 'digital', imageUrl: '', limited: false, limitedQty: '100' };

export default function CreateProductPanel() {
  const [draft, setDraft] = useState<ProductDraft>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof ProductDraft>(key: K, val: ProductDraft[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  function handlePublish() {
    if (!draft.name || !draft.price) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setDraft(EMPTY);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8, color: '#fff', fontSize: 14,
    boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{ background: 'rgba(255,45,170,0.06)', border: '1.5px solid rgba(255,45,170,0.25)', borderRadius: 16, padding: '24px', maxWidth: 560 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 16 }}>
        + CREATE PRODUCT
      </div>

      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '32px 0', color: '#00FF88', fontWeight: 800, fontSize: 16 }}>
          ✓ Product Published!
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type selector */}
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 8 }}>PRODUCT TYPE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => set('type', t.value)}
                  style={{
                    padding: '10px 8px',
                    background: draft.type === t.value ? 'rgba(255,45,170,0.18)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${draft.type === t.value ? 'rgba(255,45,170,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8, color: draft.type === t.value ? '#FF2DAA' : 'rgba(255,255,255,0.55)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
              {TYPE_OPTIONS.find((t) => t.value === draft.type)?.desc}
            </div>
          </div>

          {/* Name */}
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>NAME *</div>
            <input style={inputStyle} value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Summer Anthem (Beat License)" />
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>DESCRIPTION</div>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              placeholder="What does the buyer get?"
            />
          </div>

          {/* Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>PRICE (USD) *</div>
              <input style={inputStyle} type="number" min="0.99" step="0.01" value={draft.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 15.00" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>IMAGE URL</div>
              <input style={inputStyle} value={draft.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://…" />
            </div>
          </div>

          {/* Limited edition */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={draft.limited} onChange={(e) => set('limited', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#FF2DAA' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Limited edition</span>
            {draft.limited && (
              <input style={{ ...inputStyle, width: 80, marginLeft: 8 }} type="number" value={draft.limitedQty} onChange={(e) => set('limitedQty', e.target.value)} placeholder="Qty" />
            )}
          </label>

          {/* Revenue note */}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.6 }}>
            You keep <strong style={{ color: '#00FF88' }}>75–90%</strong> of every sale. TMI takes 10–25% platform fee.
          </div>

          <button
            onClick={handlePublish}
            disabled={!draft.name || !draft.price}
            style={{
              padding: '13px 24px',
              background: draft.name && draft.price ? 'linear-gradient(135deg,#FF2DAA,#AA2DFF)' : 'rgba(255,255,255,0.08)',
              color: draft.name && draft.price ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none', borderRadius: 9, fontWeight: 900, fontSize: 14,
              cursor: draft.name && draft.price ? 'pointer' : 'not-allowed',
              letterSpacing: '0.08em',
            }}
          >
            📤 PUBLISH PRODUCT
          </button>
        </div>
      )}
    </div>
  );
}
