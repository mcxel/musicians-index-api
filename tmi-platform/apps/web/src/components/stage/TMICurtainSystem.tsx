'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TMICurtainSystemProps {
  isOpen: boolean;
  venueTitle?: string;
  onCurtainOpen?: () => void;
}

export default function TMICurtainSystem({ isOpen, venueTitle = "TMI STAGE", onCurtainOpen }: TMICurtainSystemProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (onCurtainOpen) onCurtainOpen();
      }, 3000); // 3 seconds for the cinematic opening
      return () => clearTimeout(timer);
    }
  }, [isOpen, onCurtainOpen]);

  return (
    <AnimatePresence>
      {(!isOpen || isAnimating) && (
        <motion.div
          className="absolute inset-0 z-[100] flex overflow-hidden pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 2 }}
        >
          {/* Left Curtain */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isOpen ? "-100%" : 0 }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-1/2 h-full bg-red-900 border-r-8 border-yellow-500/50 shadow-[10px_0_30px_rgba(0,0,0,0.8)] flex items-center justify-end pr-8"
            style={{
              backgroundImage: "linear-gradient(90deg, #4a0000 0%, #8a0000 50%, #4a0000 100%)",
              backgroundSize: "20% 100%"
            }}
          >
            <div className="absolute right-0 w-2 h-full bg-gradient-to-b from-yellow-300 via-yellow-600 to-yellow-900 shadow-[0_0_15px_#FFD700]" />
          </motion.div>

          {/* Center Logo/Title (Splits and fades) */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 1.5 : 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
          >
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>
              {venueTitle}
            </h1>
            <p className="text-yellow-500/80 tracking-[0.4em] text-sm mt-4 font-bold uppercase">
              Standby for Broadcast
            </p>
          </motion.div>

          {/* Right Curtain */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isOpen ? "100%" : 0 }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-1/2 h-full bg-red-900 border-l-8 border-yellow-500/50 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] flex items-center justify-start pl-8"
            style={{
              backgroundImage: "linear-gradient(90deg, #4a0000 0%, #8a0000 50%, #4a0000 100%)",
              backgroundSize: "20% 100%"
            }}
          >
            <div className="absolute left-0 w-2 h-full bg-gradient-to-b from-yellow-300 via-yellow-600 to-yellow-900 shadow-[0_0_15px_#FFD700]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}