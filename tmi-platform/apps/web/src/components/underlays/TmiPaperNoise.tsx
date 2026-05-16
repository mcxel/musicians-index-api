'use client';
import React, { useMemo } from 'react';

interface TmiPaperNoiseProps {
  opacity?: number;
  color?: string;
}

export default function TmiPaperNoise({ opacity = 0.025, color = '#fff' }: TmiPaperNoiseProps) {
  const id = useMemo(() => `paper-noise-${Math.random().toString(36).slice(2, 7)}`, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: 'inherit',
      }}
    >
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} fill={color} />
      </svg>
    </div>
  );
}
