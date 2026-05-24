'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CurtainState = 'closed' | 'opening' | 'open';

interface VideoCurtainRevealProps {
  children:       ReactNode;
  title?:         string;
  subtitle?:      string;
  accentColor?:   string;
  autoOpen?:      boolean;
  revealDelayMs?: number;
}

export default function VideoCurtainReveal({
  children,
  title     = 'Live Feed',
  subtitle  = 'Tap to reveal',
  accentColor = '#FF2DAA',
  autoOpen  = false,
  revealDelayMs = 0,
}: VideoCurtainRevealProps) {
  const [curtain, setCurtain] = useState<CurtainState>('closed');

  useEffect(() => {
    if (!autoOpen) return;
    const t = setTimeout(() => setCurtain('opening'), revealDelayMs);
    return () => clearTimeout(t);
  }, [autoOpen, revealDelayMs]);

  useEffect(() => {
    if (curtain === 'opening') {
      const t = setTimeout(() => setCurtain('open'), 900);
      return () => clearTimeout(t);
    }
  }, [curtain]);

  const open = () => { if (curtain === 'closed') setCurtain('opening'); };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      {/* The actual content sits underneath */}
      {children}

      {/* Curtain layer */}
      <AnimatePresence>
        {curtain !== 'open' && (
          <motion.div
            key="curtain"
            initial={false}
            exit={{ opacity: 0 }}
            onClick={open}
            style={{
              position:   'absolute',
              inset:      0,
              display:    'flex',
              overflow:   'hidden',
              cursor:     curtain === 'closed' ? 'pointer' : 'default',
              zIndex:     10,
            }}
          >
            {/* Left curtain panel */}
            <motion.div
              animate={curtain === 'opening' ? { x: '-100%' } : { x: '0%' }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{
                flex: 1, height: '100%',
                background: `linear-gradient(135deg, #0a0018 0%, #12001e 50%, ${accentColor}22 100%)`,
                borderRight: `2px solid ${accentColor}55`,
                position: 'relative',
              }}
            >
              {/* Neon trim vertical lines */}
              {[15, 35, 55, 75].map(pct => (
                <div key={pct} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 1, background: `${accentColor}18` }} />
              ))}
            </motion.div>

            {/* Right curtain panel */}
            <motion.div
              animate={curtain === 'opening' ? { x: '100%' } : { x: '0%' }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{
                flex: 1, height: '100%',
                background: `linear-gradient(225deg, #0a0018 0%, #12001e 50%, ${accentColor}22 100%)`,
                borderLeft: `2px solid ${accentColor}55`,
                position: 'relative',
              }}
            >
              {[25, 45, 65, 85].map(pct => (
                <div key={pct} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 1, background: `${accentColor}18` }} />
              ))}
            </motion.div>

            {/* Center overlay text (only when fully closed) */}
            {curtain === 'closed' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none' }}>
                <motion.div
                  animate={{ boxShadow: [`0 0 20px ${accentColor}44`, `0 0 40px ${accentColor}88`, `0 0 20px ${accentColor}44`] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 48, height: 48, borderRadius: '50%', background: `${accentColor}22`, border: `1px solid ${accentColor}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}
                >
                  ▶
                </motion.div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '0.12em', textShadow: `0 0 12px ${accentColor}` }}>{title}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>{subtitle}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
