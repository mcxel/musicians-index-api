'use client';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

interface TmiConfettiFieldProps {
  colors?: string[];
  count?: number;
  duration?: number;
}

export default function TmiConfettiField({
  colors = ['#00FFFF', '#FF2DAA', '#FFD700', '#AA2DFF', '#00FF88'],
  count = 20,
  duration = 3,
}: TmiConfettiFieldProps) {
  const [confetti, setConfetti] = useState<Array<{ x: number; id: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const newConfetti = Array.from({ length: count }).map((_, i) => ({
      x: Math.random() * 100,
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3,
    }));
    setConfetti(newConfetti);
  }, [count, colors]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          initial={{ y: -10, opacity: 1 }}
          animate={{ y: '100vh', opacity: 0, rotate: 360 }}
          transition={{ duration, delay: c.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: c.color,
            boxShadow: `0 0 10px ${c.color}`,
          }}
        />
      ))}
    </div>
  );
}
