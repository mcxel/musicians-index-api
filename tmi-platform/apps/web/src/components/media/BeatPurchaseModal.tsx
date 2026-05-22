'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type BeatListing = {
  id: string;
  title: string;
  producer: string;
  genre: string;
  bpm: number;
  key: string;
  priceCents: number;
  licenseType: 'basic' | 'premium' | 'exclusive';
  previewUrl?: string;
  coverImg?: string;
  tags: string[];
};

type BeatPurchaseModalProps = {
  beat: BeatListing;
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (beat: BeatListing, license: string) => void;
};

const LICENSE_OPTIONS = [
  { key: 'basic',     label: 'Basic',     desc: 'MP3 only · 5,000 streams · Non-exclusive', multiplier: 1 },
  { key: 'premium',   label: 'Premium',   desc: 'MP3 + WAV stems · 50,000 streams · Non-exclusive', multiplier: 2 },
  { key: 'exclusive', label: 'Exclusive', desc: 'All files · Unlimited · Full ownership transfer', multiplier: 5 },
];

export default function BeatPurchaseModal({ beat, isOpen, onClose, onPurchase }: BeatPurchaseModalProps) {
  const [selectedLicense, setSelectedLicense] = useState<'basic' | 'premium' | 'exclusive'>('basic');
  const [previewing, setPreviewing] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [done, setDone] = useState(false);

  const license = LICENSE_OPTIONS.find((l) => l.key === selectedLicense)!;
  const price = (beat.priceCents * license.multiplier / 100).toFixed(2);

  async function handlePurchase() {
    setPurchasing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPurchasing(false);
    setDone(true);
    onPurchase?.(beat, selectedLicense);
    setTimeout(() => { setDone(false); onClose(); }, 2000);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(5,5,16,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#0d0d22', border: '1px solid rgba(170,45,255,0.35)', borderRadius: 16, padding: 28, maxWidth: 480, width: '100%' }}
          >
            {done ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
                <div style={{ color: '#00FF88', fontWeight: 800, fontSize: 18 }}>Purchase Complete!</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 6 }}>Check your email for download links.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 70, height: 70, borderRadius: 10, background: '#AA2DFF33', backgroundImage: beat.coverImg ? `url('${beat.coverImg}')` : undefined, backgroundSize: 'cover', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: '#fff' }}>{beat.title}</div>
                    <div style={{ fontSize: 13, color: '#AA2DFF', marginTop: 2 }}>by {beat.producer}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{beat.genre} · {beat.bpm} BPM · Key of {beat.key}</div>
                  </div>
                </div>

                <div style={{ fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>SELECT LICENSE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {LICENSE_OPTIONS.map((l) => (
                    <div
                      key={l.key}
                      onClick={() => setSelectedLicense(l.key as 'basic' | 'premium' | 'exclusive')}
                      style={{
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${selectedLicense === l.key ? '#AA2DFF' : 'rgba(255,255,255,0.1)'}`,
                        background: selectedLicense === l.key ? 'rgba(170,45,255,0.14)' : 'rgba(255,255,255,0.03)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>{l.label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{l.desc}</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: selectedLicense === l.key ? '#AA2DFF' : '#fff' }}>
                        ${(beat.priceCents * l.multiplier / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: 13 }}>
                    Cancel
                  </button>
                  <button
                    onClick={() => void handlePurchase()}
                    disabled={purchasing}
                    style={{ flex: 2, padding: '12px', background: '#AA2DFF', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: 14, letterSpacing: '0.08em' }}
                  >
                    {purchasing ? 'Processing...' : `BUY ${license.label.toUpperCase()} — $${price}`}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
