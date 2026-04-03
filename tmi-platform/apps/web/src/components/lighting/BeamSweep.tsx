"use client";
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BeamSweepProps {
  active?: boolean;
  color?: string;
  count?: number;
  speed?: number;   // seconds per full sweep
}

export default function BeamSweep({ active = true, color = '#00FFFF', count = 3, speed = 3 }: BeamSweepProps) {
  if (!active) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${20 + (i * 60 / count)}%`,
            width: 3,
            height: '80%',
            background: `linear-gradient(to top, ${color}CC, transparent)`,
            transformOrigin: 'bottom center',
            opacity: 0.6,
            filter: `blur(2px) drop-shadow(0 0 8px ${color})`,
          }}
          animate={{ rotateZ: [-35 + i * 5, 35 - i * 5, -35 + i * 5] }}
          transition={{
            repeat: Infinity,
            duration: speed + i * 0.4,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
