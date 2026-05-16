'use client';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

interface TmiPolygonFieldProps {
  color?: string;
  intensity?: number;
  count?: number;
}

export default function TmiPolygonField({ color = '#AA2DFF', intensity = 0.15, count = 6 }: TmiPolygonFieldProps) {
  const [polygons, setPolygons] = useState<Array<{ x: number; y: number; id: number; size: number }>>([]);

  useEffect(() => {
    const newPolygons = Array.from({ length: count }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      id: i,
      size: 40 + Math.random() * 80,
    }));
    setPolygons(newPolygons);
  }, [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {polygons.map((poly) => (
        <motion.div
          key={poly.id}
          animate={{
            opacity: [intensity * 0.2, intensity, intensity * 0.2],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8 + Math.random() * 12,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: `${poly.x}%`,
            top: `${poly.y}%`,
            width: poly.size,
            height: poly.size,
            background: `linear-gradient(135deg, ${color}40 0%, ${color}10 100%)`,
            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            filter: `blur(1px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
