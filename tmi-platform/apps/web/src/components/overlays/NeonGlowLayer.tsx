'use client';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

interface NeonGlowLayerProps {
  color?: string;
  intensity?: number;
  children?: React.ReactNode;
  blur?: number;
  particleCount?: number;
}

export default function NeonGlowLayer({
  color = '#00FFFF',
  intensity = 0.4,
  children,
  blur = 20,
  particleCount = 0,
}: NeonGlowLayerProps) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    if (particleCount > 0) {
      const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        id: i,
      }));
      setParticles(newParticles);
    }
  }, [particleCount]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Background glow */}
      <motion.div
        animate={{
          opacity: [intensity * 0.3, intensity, intensity * 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${color}30 0%, transparent 70%)`,
          filter: `blur(${blur}px)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          animate={{
            opacity: [0, intensity, 0],
            y: [particle.y - 20, particle.y + 20],
            x: [particle.x - 10, particle.x + 10],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 4px ${color}, 0 0 8px ${color}60`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
