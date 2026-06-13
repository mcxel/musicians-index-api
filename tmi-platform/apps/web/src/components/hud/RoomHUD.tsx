"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivityTimelineCanister } from './ActivityTimelineCanister';
import { SponsorStampWallCanister } from './SponsorStampWallCanister';
import { SponsorBubbleOrbitCanister } from './SponsorBubbleOrbitCanister';
import { CheckoutPaymentEngine } from '../../lib/stripe/CheckoutPaymentEngine';

interface RoomHUDProps {
  venueId: string;
  venueClass: string;
}

const PRESET_TIPS = [5, 10, 25, 50, 100];

export const RoomHUD: React.FC<RoomHUDProps> = ({ venueId, venueClass }) => {
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [customTip, setCustomTip] = useState('');
  const [sending, setSending] = useState(false);

  const triggerTip = async (amountInCents: number) => {
    if (sending || amountInCents < 100) return;
    setSending(true);
    try {
      await CheckoutPaymentEngine.triggerCheckout({
        type: 'TIP',
        itemId: venueId,
        amountInCents,
        metadata: { venueClass },
      });
    } finally {
      setSending(false);
      setTipModalOpen(false);
      setCustomTip('');
    }
  };

  const handleCustomTip = () => {
    const cents = Math.round(parseFloat(customTip) * 100);
    if (!isNaN(cents) && cents >= 100) triggerTip(cents);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6"
      >
        {/* Top Bar: Venue Info & Sponsors */}
        <div className="flex justify-between items-start pointer-events-none">
          <div className="bg-black/70 backdrop-blur-lg border border-[#00FFFF]/20 rounded-lg px-6 py-3 pointer-events-auto shadow-[0_0_30px_rgba(0,255,255,0.1)]">
            <div className="text-white font-bold text-xl tracking-widest uppercase drop-shadow-md">
              {venueClass}
            </div>
            <div className="text-xs text-[#00FFFF] font-mono mt-1">
              [{venueId.replace('-', ' ')}]
            </div>
          </div>
          <SponsorStampWallCanister />
        </div>

        {/* Center/Right 3D Orbit Overlay */}
        <SponsorBubbleOrbitCanister />

        {/* Bottom Bar: Activity Timeline & Controls */}
        <div className="flex justify-between items-end pointer-events-none">
          <ActivityTimelineCanister />

          <div className="flex gap-4 items-center pointer-events-auto">
            <button className="bg-gray-900/80 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-bold border border-gray-500 backdrop-blur-md transition-all uppercase text-xs tracking-widest shadow-lg min-h-[44px]">
              Share Stream
            </button>
            <button
              onClick={() => setTipModalOpen(true)}
              className="bg-gradient-to-r from-[#FF2DAA] to-[#AA2DFF] hover:scale-105 text-white px-8 py-3 rounded-full font-bold border border-[#FF2DAA]/50 backdrop-blur-md shadow-[0_0_20px_rgba(255,45,170,0.5)] transition-all uppercase text-xs tracking-widest min-h-[44px]"
            >
              Tip / Support
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tip Amount Modal */}
      <AnimatePresence>
        {tipModalOpen && (
          <motion.div
            key="tip-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setTipModalOpen(false)}
          >
            <motion.div
              key="tip-modal-panel"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              className="bg-[#07060f] border border-[#FF2DAA]/30 rounded-2xl p-6 w-80 mx-4 shadow-[0_0_60px_rgba(255,45,170,0.2)]"
            >
              {/* Header */}
              <div className="text-center mb-5">
                <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#FF2DAA', fontWeight: 800 }}>
                  SEND A TIP
                </div>
                <div className="text-white font-bold text-lg mt-1">Choose Your Amount</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                  100% goes to the performer
                </div>
              </div>

              {/* Preset amounts */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRESET_TIPS.map(amt => (
                  <button
                    key={amt}
                    disabled={sending}
                    onClick={() => triggerTip(amt * 100)}
                    className="rounded-xl font-bold text-sm transition-all min-h-[44px]"
                    style={{
                      background: 'rgba(255,45,170,0.08)',
                      border: '1px solid rgba(255,45,170,0.3)',
                      color: '#FF2DAA',
                      opacity: sending ? 0.5 : 1,
                      cursor: sending ? 'wait' : 'pointer',
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Custom $"
                  value={customTip}
                  onChange={e => setCustomTip(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustomTip()}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
                <button
                  disabled={sending || !customTip}
                  onClick={handleCustomTip}
                  className="min-h-[44px] px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  style={{
                    background: customTip ? 'linear-gradient(135deg,#FF2DAA,#AA2DFF)' : 'rgba(255,255,255,0.06)',
                    color: customTip ? '#fff' : 'rgba(255,255,255,0.3)',
                    border: 'none',
                    cursor: customTip && !sending ? 'pointer' : 'not-allowed',
                  }}
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>

              {/* Cancel */}
              <button
                onClick={() => setTipModalOpen(false)}
                className="w-full py-2 rounded-xl transition-all min-h-[40px]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
