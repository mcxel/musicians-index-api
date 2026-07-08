'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dispatchSoundEvent } from '@/lib/sound/AudioDirector';

interface TMICurtainSystemProps {
  isOpen: boolean;
  venueTitle?: string;
  onCurtainOpen?: () => void;
}

export default function TMICurtainSystem({ isOpen, venueTitle = 'TMI STAGE', onCurtainOpen }: TMICurtainSystemProps) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatchSoundEvent('tmi:venue_curtain_open');
      setAnimating(true);
      const t = setTimeout(() => {
        setAnimating(false);
        onCurtainOpen?.();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isOpen, onCurtainOpen]);

  const EASE = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {(!isOpen || animating) && (
        <motion.div
          style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', overflow: 'hidden', pointerEvents: 'none' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 2 }}
        >
          {/* Left curtain */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isOpen ? '-100%' : 0 }}
            transition={{ duration: 2.5, ease: EASE }}
            style={{ position: 'relative', width: '50%', height: '100%', background: 'linear-gradient(90deg,#4a0000 0%,#8a0000 50%,#4a0000 100%)', borderRight: '6px solid rgba(255,215,0,0.4)', boxShadow: '10px 0 40px rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <div style={{ position: 'absolute', right: 0, width: 4, height: '100%', background: 'linear-gradient(180deg,#FFD700,#B8860B,#FFD700)', boxShadow: '0 0 20px #FFD700' }} />
          </motion.div>

          {/* Center title */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 1.5 : 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 110, textAlign: 'center' }}
          >
            <h1 style={{ fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 900, background: 'linear-gradient(180deg,#FFD700,#B8860B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.2em', fontFamily: 'var(--font-orbitron,sans-serif)', textTransform: 'uppercase', margin: 0 }}>
              {venueTitle}
            </h1>
            <p style={{ color: 'rgba(255,215,0,0.7)', letterSpacing: '0.4em', fontSize: 11, marginTop: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              Standby for Broadcast
            </p>
          </motion.div>

          {/* Right curtain */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isOpen ? '100%' : 0 }}
            transition={{ duration: 2.5, ease: EASE }}
            style={{ position: 'relative', width: '50%', height: '100%', background: 'linear-gradient(90deg,#4a0000 0%,#8a0000 50%,#4a0000 100%)', borderLeft: '6px solid rgba(255,215,0,0.4)', boxShadow: '-10px 0 40px rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
          >
            <div style={{ position: 'absolute', left: 0, width: 4, height: '100%', background: 'linear-gradient(180deg,#FFD700,#B8860B,#FFD700)', boxShadow: '0 0 20px #FFD700' }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
