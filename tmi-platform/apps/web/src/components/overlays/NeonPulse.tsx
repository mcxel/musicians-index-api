'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface NeonPulseProps {
  color?: string;
  size?: number;
  duration?: number;
  intensity?: number;
  children?: React.ReactNode;
}

export default function NeonPulse({
  color = '#00FFFF',
  size = 100,
  duration = 2,
  intensity = 0.6,
  children,
}: NeonPulseProps) {
  return (
    <motion.div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer pulsing ring */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 10px ${color}, 0 0 20px ${color}40`,
            `0 0 30px ${color}, 0 0 60px ${color}60`,
            `0 0 10px ${color}, 0 0 20px ${color}40`,
          ],
          opacity: [0.4, intensity, 0.4],
        }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: `2px solid ${color}`,
        }}
      />

      {/* Inner content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}
