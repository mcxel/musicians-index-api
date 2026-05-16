import React from 'react';

export type TMIOverlayShape = 'angled-cut' | 'magazine-feather' | 'cinematic-vignette' | 'hologram-grid';

interface TMIOverlaySystemProps {
  shape: TMIOverlayShape;
  color?: 'cyan' | 'fuchsia' | 'gold' | 'emerald';
  opacity?: number;
}

/**
 * TMIOverlaySystem: Generates the exact PDF-matched overlay shapes, cuts, and feathered edges.
 * Wraps around or layers over cards, videos, and backgrounds to enforce the TMI Visual Canon.
 */
export default function TMIOverlaySystem({ shape, color = 'cyan', opacity = 20 }: TMIOverlaySystemProps) {
  const colorMap = {
    cyan: `rgba(34, 211, 238, ${opacity / 100})`,
    fuchsia: `rgba(217, 70, 239, ${opacity / 100})`,
    gold: `rgba(250, 204, 21, ${opacity / 100})`,
    emerald: `rgba(16, 185, 129, ${opacity / 100})`
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" data-visual-canon="overlay">
      {shape === 'angled-cut' && (
        <div className="absolute inset-0 bg-black" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)', opacity: opacity / 100 }} />
      )}
      {shape === 'magazine-feather' && (
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] mix-blend-multiply" />
      )}
      {shape === 'cinematic-vignette' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)]" />
      )}
      {shape === 'hologram-grid' && (
        <div className="absolute inset-0 bg-[url('/effects/scanline.png')] mix-blend-overlay opacity-30 animate-pulse-slow" />
      )}
    </div>
  );
}