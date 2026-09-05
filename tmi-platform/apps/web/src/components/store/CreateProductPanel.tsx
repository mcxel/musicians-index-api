'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ARTIST_COMMERCE_PRODUCT_TYPES,
  ARTIST_COMMERCE_TYPE_LABELS,
  type ArtistCommerceProductType,
} from '@/lib/commerce/ArtistCommerceTypes';

type ProductDraft = {
  name: string;
  description: string;
  price: string;
  type: ArtistCommerceProductType;
  imageUrl: string;
  limited: boolean;
  limitedQty: string;
  active: boolean;
};

const TYPE_OPTIONS: { value: ArtistCommerceProductType; label: string; icon: string; desc: string }[] = [
  { value: 'DIGITAL_PRODUCT', label: 'Digital Item', icon: '💾', desc: 'Song, album, exclusive content' },
  { value: 'LICENSING_PACK', label: 'Licensing Pack', icon: '🎹', desc: 'Beat / music license' },
  { value: 'SHOUTOUT', label: 'Shoutout', icon: '📣', desc: 'Personalized video or audio' },
  { value: 'MEET_AND_GREET', label: 'Meet & Greet', icon: '🤝', desc: 'Private session pass' },
  { value: 'VIP_PASS', label: 'VIP Pass', icon: '👑', desc: 'VIP access product' },
  { value: 'MERCH', label: 'Merch', icon: '👕', desc: 'Shirts, hats, posters' },
  { value: 'OTHER', label: 'Other', icon: '🛍️', desc: 'Custom artist product' },
];

const EMPTY: ProductDraft = {
  name: '',
  description: '',
  price: '',
  type: 'SHOUTOUT',
  imageUrl: '',
  limited: false,
  limitedQty: '100',
  active: true,
};

export default function CreateProductPanel() {
  const [draft, setDraft] = useState<ProductDraft>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  function set<K extends keyof ProductDraft>(key: K, val: ProductDraft[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  async function handlePublish() {
    if (!draft.name || !draft.price || busy) return;
    const dollars = Number(draft.price);
    if (!Number.isFinite(dollars) || dollars < 1) {
      setError('Price must be at least $1.00');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const priceCents = Math.round(dollars * 100);
      const payload = {
        id: editingId ?? undefined,
        type: draft.type,
        title: draft.name.trim(),
        description: draft.description.trim() || null,
        priceCents,
        imageUrl: draft.imageUrl.trim() || null,
        active: draft.active,
        inventory: draft.limited ? Math.max(1, Math.floor(Number(draft.limitedQty) || 1)) : null,
      };
      const res = await fetch('/api/commerce/products', {
        method: editingId ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; product?: { id: string } };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Could not save product');
        return;
      }
      setSubmitted(true);
      setEditingId(null);
      setDraft(EMPTY);
      setTimeout(() => setSubmitted(false), 2500);
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
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
        + CREATE / EDIT ARTIST PRODUCT
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 0, marginBottom: 16, lineHeight: 1.5 }}>
        Your prices are yours — saved to your catalog (no Vercel redeploy). Fans check out via Stripe Connect + TMI fee.
      </p>

      {submitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '32px 0', color: '#00FF88', fontWeight: 800, fontSize: 16 }}>
          ✓ Product Saved!
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 8 }}>PRODUCT TYPE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
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
              {TYPE_OPTIONS.find((t) => t.value === draft.type)?.desc ?? ARTIST_COMMERCE_TYPE_LABELS[draft.type]}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>NAME *</div>
            <input style={inputStyle} value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Personalized Shoutout" />
          </div>

          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>DESCRIPTION (OPTIONAL)</div>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              placeholder="What does the buyer get?"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>PRICE (USD) *</div>
              <input style={inputStyle} type="number" min="1" step="0.01" value={draft.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 25.00" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>IMAGE URL (OPTIONAL)</div>
              <input style={inputStyle} value={draft.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://…" />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={draft.active} onChange={(e) => set('active', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#FF2DAA' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Active (visible in fan store)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={draft.limited} onChange={(e) => set('limited', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#FF2DAA' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Limited inventory</span>
            {draft.limited && (
              <input style={{ ...inputStyle, width: 80, marginLeft: 8 }} type="number" value={draft.limitedQty} onChange={(e) => set('limitedQty', e.target.value)} placeholder="Qty" />
            )}
          </label>

          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.6 }}>
            Platform fee follows your membership tier (FREE 20% → DIAMOND 8%). You keep the rest. Types: {ARTIST_COMMERCE_PRODUCT_TYPES.join(', ')}.
          </div>

          {error && <div style={{ fontSize: 12, color: '#FF2DAA', fontWeight: 700 }}>{error}</div>}

          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={!draft.name || !draft.price || busy}
            style={{
              padding: '13px 24px',
              background: draft.name && draft.price && !busy ? 'linear-gradient(135deg,#FF2DAA,#AA2DFF)' : 'rgba(255,255,255,0.08)',
              color: draft.name && draft.price && !busy ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none', borderRadius: 9, fontWeight: 900, fontSize: 14,
              cursor: draft.name && draft.price && !busy ? 'pointer' : 'not-allowed',
              letterSpacing: '0.08em',
            }}
          >
            {busy ? 'SAVING…' : editingId ? '💾 UPDATE PRODUCT' : '📤 PUBLISH PRODUCT'}
          </button>
        </div>
      )}
    </div>
  );
}
