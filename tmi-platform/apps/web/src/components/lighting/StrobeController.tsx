"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const SAFE_STROBE_MAX = 3;

interface StrobeControllerProps {
  hz: number;
  color?: string;
  active?: boolean;
  /** When true, ignores hz and renders nothing — for photosensitive safety */
  disabled?: boolean;
}

/**
 * Safe strobe component. Automatically caps at SAFE_STROBE_MAX (3 Hz).
 * Renders a screen-flash overlay synced to the strobe frequency.
 */
export default function StrobeController({ hz, color = "#ffffff", active = true, disabled = false }: StrobeControllerProps) {
  const safeHz = Math.min(hz, SAFE_STROBE_MAX);
  const intervalMs = safeHz > 0 ? 1000 / safeHz : null;
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!active || disabled || !intervalMs) return;
    const t = setInterval(() => setFlash(f => !f), intervalMs / 2);
    return () => clearInterval(t);
  }, [active, disabled, intervalMs]);

  if (disabled || !active || !intervalMs) return null;

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          key="strobe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.04 }}
          style={{
            position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200,
            backgroundColor: color,
          }}
        />
      )}
    </AnimatePresence>
  );
}
