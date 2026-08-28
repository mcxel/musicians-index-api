// apps/web/src/components/admin/DeckSlot.tsx
//
// Small presentational primitive (glassmorphic slide/fade, reduced-motion
// aware). Its only current consumer, OverseerDeck.tsx, is LEGACY/unmounted.
// Safe to reuse elsewhere as a transition wrapper if needed — it owns no
// routing/telemetry/state authority.
import React, { useEffect, useState } from 'react';
import styles from './DeckSlot.module.css';
import { motion } from 'framer-motion';

type DeckSlotProps = {
  slotName: string;
  children: React.ReactNode;
};

const SLOT_MOTION_MS = 210;

// Determine initial slide direction based on slot name
const getInitialOffset = (slotName: string) => {
  if (slotName.includes('LEFT')) return { x: -30, y: 0 };
  if (slotName.includes('RIGHT')) return { x: 30, y: 0 };
  if (slotName.includes('BOTTOM')) return { x: 0, y: 30 };
  return { x: 0, y: 0 };
};

export const DeckSlot: React.FC<DeckSlotProps> = ({ slotName, children }) => {
  const initial = getInitialOffset(slotName);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div className={styles.slot} data-slot={slotName}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={styles.slot}
      data-slot={slotName}
      initial={{ opacity: 0, ...initial }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: SLOT_MOTION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

