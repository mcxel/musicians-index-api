'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import QuickBuyButton from '@/components/store/QuickBuyButton';
import { CREATOR_ITEMS, FAN_ITEMS, type StoreItem, formatPrice } from '@/lib/store/StoreItemEngine';

type Props = {
  performerName?: string;
  performerSlug?: string;
  accentColor?: string;
};

const QUICK_ITEMS: StoreItem[] = [
  FAN_ITEMS.find((i) => i.id === 'tip-small')!,
  FAN_ITEMS.find((i) => i.id === 'tip-medium')!,
  FAN_ITEMS.find((i) => i.id === 'tip-large')!,
  CREATOR_ITEMS.find((i) => i.id === 'shoutout')!,
  CREATOR_ITEMS.find((i) => i.id === 'meet-greet')!,
  FAN_ITEMS.find((i) => i.id === 'fan-club-silver')!,
].filter(Boolean);

export default function LiveStoreOverlay({ performerName, performerSlug, accentColor = '#FF2DAA' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger tab */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '8px 14px',
          background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}18)`,
          border: `1px solid ${accentColor}60`,
          borderRadius: 8,
          color: accentColor,
          fontWeight: 900,
          fontSize: 12,
          cursor: 'pointer',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        🛍️ SUPPORT {open ? '▲' : '▼'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              bottom: '110%',
              right: 0,
              width: 'min(94vw, 340px)',
              background: 'linear-gradient(135deg, #0d0d1a, #100f1f)',
              border: `1.5px solid ${accentColor}40`,
              borderRadius: 14,
              padding: '16px',
              boxShadow: `0 12px 48px rgba(0,0,0,0.7), 0 0 40px ${accentColor}18`,
              zIndex: 100,
            }}
          >
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: accentColor, fontWeight: 800, marginBottom: 10 }}>
              🔴 LIVE — SUPPORT {performerName?.toUpperCase() ?? 'THIS ARTIST'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {QUICK_ITEMS.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 9, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{item.icon}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    </div>
                    {item.creatorSplit && item.creatorSplit > 0 && (
                      <div style={{ fontSize: 9, color: '#00FF88', marginTop: 2 }}>
                        {Math.round(item.creatorSplit * 100)}% to artist
                      </div>
                    )}
                  </div>
                  <QuickBuyButton item={item} accentColor={accentColor} compact />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
              <Link
                href={performerSlug ? `/profile/performer/${performerSlug}/store` : '/store'}
                style={{ flex: 1, padding: '9px 12px', background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30`, borderRadius: 7, fontWeight: 800, fontSize: 11, textDecoration: 'none', textAlign: 'center', letterSpacing: '0.08em' }}
              >
                FULL STORE →
              </Link>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
