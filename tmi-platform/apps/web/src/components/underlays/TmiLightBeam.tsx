'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface TmiLightBeamProps {
  color?: string;
  angle?: number;
  width?: number;
  intensity?: number;
}

export default function TmiLightBeam({
  color = '#00FFFF',
  angle = 45,
  width = 200,
  intensity = 0.3,
}: TmiLightBeamProps) {
  return (
    <motion.div
      animate={{
        opacity: [intensity * 0.2, intensity, intensity * 0.2],
        x: [-100, 100],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(${angle}deg, transparent 0%, ${color}40 50%, transparent 100%)`,
        width: width,
        height: '100%',
        pointerEvents: 'none',
        filter: `blur(30px)`,
      }}
    />
  );
}
