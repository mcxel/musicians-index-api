'use client';
import { motion, AnimatePresence } from 'framer-motion';

type CurtainTransitionProps = {
  open: boolean;
  color?: string;
  accentColor?: string;
  label?: string;
  children?: React.ReactNode;
};

export default function CurtainTransition({ open, color = '#0d0020', accentColor = '#AA2DFF', label, children }: CurtainTransitionProps) {
  return (
    <>
      {children}
      <AnimatePresence>
        {!open && (
          <>
            {/* Left curtain panel */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
              style={{
                position: 'fixed', inset: '0 50% 0 0', zIndex: 9998,
                background: `linear-gradient(to right, ${color}, ${color}dd)`,
                borderRight: `2px solid ${accentColor}60`,
                boxShadow: `4px 0 40px ${accentColor}30`,
              }}
            >
              {/* Curtain fabric fold lines */}
              {[20, 40, 60, 80].map((pct) => (
                <div key={pct} style={{
                  position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 1,
                  background: `linear-gradient(to bottom, transparent, ${accentColor}20, transparent)`,
                }} />
              ))}
            </motion.div>

            {/* Right curtain panel */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
              style={{
                position: 'fixed', inset: '0 0 0 50%', zIndex: 9998,
                background: `linear-gradient(to left, ${color}, ${color}dd)`,
                borderLeft: `2px solid ${accentColor}60`,
                boxShadow: `-4px 0 40px ${accentColor}30`,
              }}
            >
              {[20, 40, 60, 80].map((pct) => (
                <div key={pct} style={{
                  position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 1,
                  background: `linear-gradient(to bottom, transparent, ${accentColor}20, transparent)`,
                }} />
              ))}
            </motion.div>

            {/* Center logo/label */}
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.4em', color: accentColor, fontWeight: 800 }}>
                THE MUSICIAN&apos;S INDEX
              </div>
              {label && <div style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}>{label}</div>}
              <motion.div
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 60, height: 2, background: accentColor, borderRadius: 2 }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
