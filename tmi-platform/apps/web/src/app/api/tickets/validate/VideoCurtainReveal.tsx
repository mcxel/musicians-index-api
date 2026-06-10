'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoCurtainRevealProps {
  title?: string;
  subtitle?: string;
  accentColor?: string;
  autoOpen?: boolean;
  revealDelayMs?: number;
  children: React.ReactNode;
}

export default function VideoCurtainReveal({
  title = "LIVE STAGE",
  subtitle = "Initializing Stream...",
  accentColor = "#FF2DAA",
  autoOpen = false,
  revealDelayMs = 1000,
  children
}: VideoCurtainRevealProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (autoOpen) {
      const timer = setTimeout(() => setIsOpen(true), revealDelayMs);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, revealDelayMs]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '340px', backgroundColor: '#050510', overflow: 'hidden', borderRadius: '12px' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>{children}</div>

      <AnimatePresence>
        {!isOpen && (
          <>
            <motion.div initial={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 1.4, ease: [0.7, 0, 0.2, 1] }} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', background: `linear-gradient(90deg, #0a0a0f, #1a1a24)`, borderRight: `4px solid ${accentColor}`, zIndex: 10, boxShadow: `10px 0 30px rgba(0,0,0,0.9)` }} />
            <motion.div initial={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 1.4, ease: [0.7, 0, 0.2, 1] }} style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', background: `linear-gradient(-90deg, #0a0a0f, #1a1a24)`, borderLeft: `4px solid ${accentColor}`, zIndex: 10, boxShadow: `-10px 0 30px rgba(0,0,0,0.9)` }} />
            
            <motion.div initial={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} transition={{ duration: 0.6 }} onClick={() => !autoOpen && setIsOpen(true)} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, textAlign: 'center', cursor: autoOpen ? 'default' : 'pointer' }}>
              <div style={{ background: '#050510', border: `2px solid ${accentColor}`, padding: '20px 40px', borderRadius: '8px', boxShadow: `0 0 40px ${accentColor}aa` }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '0.15em', fontFamily: 'Impact, sans-serif' }}>{title}</div>
                <div style={{ fontSize: 12, color: accentColor, marginTop: 8, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{subtitle}</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}