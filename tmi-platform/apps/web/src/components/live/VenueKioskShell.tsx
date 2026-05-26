'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomepageRotation } from '@/hooks/useHomepageRotation';

interface VenueKioskShellProps {
  venueId: string;
  zone: 'LOBBY' | 'STAGE' | 'VIP_LOUNGE';
}

/**
 * Venue Kiosk Shell
 * Designed exclusively for WPE WebKit / embedded Linux displays inside Brick and Mortar venues.
 * Provides a borderless, continuously rotating digital canvas.
 */
export default function VenueKioskShell({ venueId, zone }: VenueKioskShellProps) {
  // Utilizing the existing rotation engine to flip through high-definition assets
  const { items, pageIndex } = useHomepageRotation('topTen');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Disable context menus and scrolling for physical kiosk lock-down
    document.body.style.overflow = 'hidden';
    document.addEventListener('contextmenu', event => event.preventDefault());
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <main className="fixed inset-0 w-screen h-screen bg-[#050510] flex flex-col items-center justify-center pointer-events-none">
      {/* Kiosk Branding Overlay */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#00FFFF] shadow-[0_0_20px_#00FFFF]" />
        <h1 className="text-3xl font-black text-white uppercase tracking-[0.3em]">TMI LIVE // {zone}</h1>
      </div>

      {/* Rotating Digital Canvas / WebRTC Output Zone */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="w-full h-full border-[6px] border-[#FF2DAA]/30 rounded-3xl"
        />
      </AnimatePresence>
    </main>
  );
}