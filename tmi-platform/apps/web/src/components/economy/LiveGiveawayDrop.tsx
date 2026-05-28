'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveGiveawayDropProps {
  sponsorName: string;
  prizeName: string;
  accentColor?: string;
  isActive: boolean;
  onClaim?: () => void;
}

/**
 * Live Giveaway Drop
 * Holographic HUD element that animates in during a live stream when an 
 * advertiser or sponsor triggers a surprise giveaway.
 */
export default function LiveGiveawayDrop({ 
  sponsorName, 
  prizeName, 
  accentColor = '#FFD700', 
  isActive,
  onClaim 
}: LiveGiveawayDropProps) {

  useEffect(() => {
    if (isActive) {
      // Trigger high-performance hardware accelerated confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF2DAA', '#00FFFF', '#FFD700', '#AA2DFF']
      });
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 45 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] perspective-1000"
        >
          <div 
            className="relative overflow-hidden bg-black/80 backdrop-blur-xl border-2 rounded-2xl p-6 shadow-2xl flex items-center gap-6 w-full max-w-md"
            style={{ borderColor: accentColor, boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${accentColor}40` }}
          >
            {/* Shimmer effect */}
            <motion.div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ background: `linear-gradient(135deg, transparent, ${accentColor}, transparent)` }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-10 bg-white/10 p-4 rounded-xl border border-white/20">
              <Gift size={40} color={accentColor} className="animate-bounce" />
            </div>
            
            <div className="relative z-10 flex-1">
              <div className="text-[10px] font-black tracking-[0.2em] text-[#00FFFF] mb-1 flex items-center gap-1 uppercase">
                <Zap size={10} /> SPONSOR DROP: {sponsorName}
              </div>
              <h3 className="text-xl font-black text-white leading-tight uppercase tracking-wide mb-3">{prizeName}</h3>
              <button onClick={onClaim} className="w-full py-2 bg-white text-black font-black uppercase tracking-widest text-xs rounded hover:scale-105 transition-transform">Claim Artifact</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}