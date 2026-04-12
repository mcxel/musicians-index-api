"use client";

import { motion } from 'framer-motion';

export default function CinematicBackdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: 620,
          height: 620,
          borderRadius: '50%',
          border: '1px solid rgba(72,216,255,0.22)',
          top: -260,
          right: -140,
          boxShadow: '0 0 90px rgba(72,216,255,0.2)',
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 46, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          border: '1px solid rgba(255,99,184,0.2)',
          bottom: -180,
          left: -120,
          boxShadow: '0 0 80px rgba(255,99,184,0.16)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 16% 24%, rgba(255,188,68,0.16), transparent 30%), radial-gradient(circle at 86% 14%, rgba(77,220,255,0.14), transparent 34%), radial-gradient(circle at 70% 84%, rgba(152,108,255,0.14), transparent 32%)',
        }}
      />
    </div>
  );
}
