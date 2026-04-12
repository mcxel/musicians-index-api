"use client";

import { motion } from 'framer-motion';

interface TickerRibbonProps {
  items: string[];
  accent?: 'cyan' | 'pink' | 'gold';
}

const COLORS = {
  cyan: '#00FFFF',
  pink: '#FF2DAA',
  gold: '#FFD700',
};

export default function TickerRibbon({ items, accent = 'cyan' }: Readonly<TickerRibbonProps>) {
  const color = COLORS[accent];
  const repeatedItems = [...items, ...items];

  return (
    <div
      style={{
        overflow: 'hidden',
        borderTop: `1px solid ${color}33`,
        borderBottom: `1px solid ${color}22`,
        background: 'rgba(5, 7, 18, 0.82)',
      }}
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', width: 'max-content' }}
      >
        {repeatedItems.map((item, index) => (
          <div
            key={`${item}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 18px',
              color: 'rgba(255,255,255,0.72)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color }}>{item}</span>
            <span style={{ color: 'rgba(255,255,255,0.24)' }}>•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}