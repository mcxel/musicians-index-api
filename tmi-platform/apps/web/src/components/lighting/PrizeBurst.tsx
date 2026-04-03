"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrizeBurstProps {
  trigger?: boolean;         // set true to fire the burst
  prize?: string;            // prize label shown in burst
  color?: string;
  onComplete?: () => void;
}

const PARTICLES = 24;

export default function PrizeBurst({ trigger = false, prize = '🏆 WINNER!', color = '#FFD700', onComplete }: PrizeBurstProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3200);
    return () => clearTimeout(t);
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          {/* Confetti particles */}
          {Array.from({ length: PARTICLES }, (_, i) => {
            const angle = (i / PARTICLES) * 360;
            const dist = 120 + Math.random() * 80;
            const rad = (angle * Math.PI) / 180;
            const tx = Math.cos(rad) * dist;
            const ty = Math.sin(rad) * dist;
            const particleColors = ['#FFD700', '#FF2DAA', '#00FFFF', '#AA2DFF', '#00FF88', '#FF9500'];
            const pColor = particleColors[i % particleColors.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                animate={{ opacity: [1, 1, 0], x: tx, y: ty, scale: [0, 1, 0.5] }}
                transition={{ duration: 1.8, ease: 'easeOut', delay: Math.random() * 0.3 }}
                style={{
                  position: 'absolute',
                  width: 8, height: 8,
                  background: pColor,
                  borderRadius: i % 3 === 0 ? '50%' : 2,
                  boxShadow: `0 0 6px ${pColor}`,
                }}
              />
            );
          })}

          {/* Central winner label */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'relative',
              padding: '16px 36px',
              background: `linear-gradient(135deg, ${color}22, ${color}44)`,
              border: `3px solid ${color}`,
              borderRadius: 16,
              boxShadow: `0 0 60px ${color}88`,
              textAlign: 'center',
            }}
          >
            <span style={{
              color,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 3,
              textShadow: `0 0 20px ${color}`,
            }}>
              {prize}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
