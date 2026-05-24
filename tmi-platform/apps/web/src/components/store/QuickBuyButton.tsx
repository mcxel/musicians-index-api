'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoreItem } from '@/lib/store/StoreItemEngine';
import { formatPrice, getCheckoutUrl } from '@/lib/store/StoreItemEngine';

const BADGE_COLORS: Record<string, string> = {
  HOT: '#FF2DAA', NEW: '#00FF88', LIMITED: '#FFD700', LAUNCH: '#AA2DFF',
};

type Props = {
  item: StoreItem;
  accentColor?: string;
  compact?: boolean;
};

export default function QuickBuyButton({ item, accentColor = '#AA2DFF', compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const accent = accentColor;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: compact ? '7px 14px' : '10px 20px',
          background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
          color: accent === '#FFD700' || accent === '#00FFFF' || accent === '#00FF88' ? '#000' : '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 900,
          fontSize: compact ? 11 : 13,
          cursor: 'pointer',
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}
      >
        {compact ? `${item.icon} Buy` : `${item.icon} ${formatPrice(item.price)}`}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9998, backdropFilter: 'blur(4px)' }}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                background: 'linear-gradient(135deg, #0d0d1a, #10101f)',
                border: `1.5px solid ${accent}50`,
                borderRadius: 16,
                padding: '28px 28px 24px',
                width: 'min(92vw, 440px)',
                boxShadow: `0 0 60px ${accent}25`,
                color: '#fff',
              }}
            >
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>

              {/* Badge */}
              {item.badge && (
                <div style={{ fontSize: 9, letterSpacing: '0.3em', color: BADGE_COLORS[item.badge] ?? accent, fontWeight: 800, marginBottom: 10 }}>
                  ● {item.badge}
                </div>
              )}

              <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: '#fff' }}>{item.name}</h2>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{item.description}</p>

              {/* Price */}
              <div style={{ background: `${accent}12`, border: `1px solid ${accent}30`, borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: accent }}>
                  {formatPrice(item.price)}
                  {item.mode === 'subscription' && <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>/mo</span>}
                </div>
                {item.creatorSplit && item.creatorSplit > 0 && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                    {Math.round(item.creatorSplit * 100)}% goes directly to the creator
                  </div>
                )}
              </div>

              {/* Launch note */}
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 18, lineHeight: 1.5 }}>
                Secure checkout via Stripe · No account required · Cancel anytime
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href={getCheckoutUrl(item)}
                  style={{
                    flex: 1,
                    padding: '13px 20px',
                    background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                    color: accent === '#FFD700' || accent === '#00FFFF' ? '#000' : '#fff',
                    borderRadius: 8,
                    fontWeight: 900,
                    fontSize: 14,
                    textDecoration: 'none',
                    textAlign: 'center',
                    letterSpacing: '0.08em',
                    display: 'block',
                  }}
                >
                  BUY NOW →
                </a>
                <button
                  onClick={() => setOpen(false)}
                  style={{ padding: '13px 16px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
