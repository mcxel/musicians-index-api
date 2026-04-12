"use client";

import { motion } from 'framer-motion';

interface LivePulseBadgeProps {
  label: string;
  accent?: 'cyan' | 'pink' | 'gold';
}

const COLORS = {
  cyan: '#00FFFF',
  pink: '#FF2DAA',
  gold: '#FFD700',
};

export default function LivePulseBadge({ label, accent = 'cyan' }: Readonly<LivePulseBadgeProps>) {
  const color = COLORS[accent];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        border: `1px solid ${color}55`,
        background: `${color}12`,
        color,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
        <motion.span
          aria-hidden
          animate={{ scale: [1, 2.2, 1], opacity: [0.65, 0, 0.65] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: color,
          }}
        />
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 2,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </span>
      {label}
    </div>
  );
}