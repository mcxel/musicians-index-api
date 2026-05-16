import React from 'react';
import TMIOverlaySystem from './TMIOverlaySystem';

/**
 * Dynamic Stage effects mapped from TMI PDF live show specs.
 * Generates parallax environments for 3D avatars and live video blocks to sit on top of.
 */
export default function StageBackgroundLayer({ activeEffect = 'none', shapeOverlay }: { activeEffect?: 'none' | 'laser-grid' | 'smoke' | 'strobe', shapeOverlay?: 'angled-cut' | 'cinematic-vignette' }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {activeEffect === 'laser-grid' && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom animate-pulse" />
      )}
      {activeEffect === 'smoke' && (
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white/10 to-transparent blur-2xl animate-pulse" />
      )}
      {activeEffect === 'strobe' && (
        <div className="absolute inset-0 bg-white/5 animate-ping mix-blend-overlay opacity-50" />
      )}
      
      {/* TMI PDF Mapped Overlay & Feathering Layer */}
      {shapeOverlay && <TMIOverlaySystem shape={shapeOverlay} opacity={40} />}
    </div>
  );
}
