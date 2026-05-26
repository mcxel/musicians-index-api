'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';

interface TheaterCurtainShellProps {
  children: ReactNode;
  isReady: boolean; // Triggers the curtain opening
  accentColor?: string;
}

export default function TheaterCurtainShell({ children, isReady, accentColor = '#FFD700' }: TheaterCurtainShellProps) {
  const [showCurtains, setShowCurtains] = useState(true);

  useEffect(() => {
    if (isReady) {
      // Keep the component mounted long enough for the animation to finish
      const t = setTimeout(() => setShowCurtains(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isReady]);

  return (
    <div className="relative w-full h-full min-h-[60vh] bg-black overflow-hidden rounded-xl border border-white/10">
      {/* The Actual Stage Content (WebRTC Stream) */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>

      {/* Left Curtain */}
      <AnimatePresence>
        {showCurtains && (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isReady ? '-100%' : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.7, 0, 0.3, 1] }}
            className="absolute top-0 left-0 bottom-0 w-1/2 z-20 flex justify-end"
            style={{
              background: 'linear-gradient(90deg, #050510 0%, #111 80%, #000 100%)',
              borderRight: `2px solid ${accentColor}88`,
              boxShadow: `10px 0 30px rgba(0,0,0,0.8), 2px 0 10px ${accentColor}44`,
            }}
          >
            {/* Center seam detail */}
            <div className="h-full w-4 bg-gradient-to-r from-transparent to-black/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Curtain */}
      <AnimatePresence>
        {showCurtains && (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isReady ? '100%' : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.7, 0, 0.3, 1] }}
            className="absolute top-0 right-0 bottom-0 w-1/2 z-20 flex justify-start"
            style={{
              background: 'linear-gradient(270deg, #050510 0%, #111 80%, #000 100%)',
              borderLeft: `2px solid ${accentColor}88`,
              boxShadow: `-10px 0 30px rgba(0,0,0,0.8), -2px 0 10px ${accentColor}44`,
            }}
          >
            {/* Center seam detail */}
            <div className="h-full w-4 bg-gradient-to-l from-transparent to-black/50" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cinematic Lighting Wash */}
      <div className="absolute inset-0 pointer-events-none z-30" 
           style={{ background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)` }} />
    </div>
  );
}