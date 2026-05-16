'use client';
import React from 'react';

interface TmiGridFogProps {
  color?: string;
  opacity?: number;
  gridSize?: number;
}

export default function TmiGridFog({
  color = '#00FFFF',
  opacity = 0.03,
  gridSize = 40,
}: TmiGridFogProps) {
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
        backgroundImage: `
          linear-gradient(${color}${Math.round(opacity * 255).toString(16).padStart(2,'0')} 1px, transparent 1px),
          linear-gradient(90deg, ${color}${Math.round(opacity * 255).toString(16).padStart(2,'0')} 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    />
  );
}
