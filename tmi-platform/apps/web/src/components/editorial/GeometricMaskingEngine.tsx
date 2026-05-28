'use client';

import type { ReactNode, CSSProperties } from 'react';

export type GeometricShape =
  | 'hexagon'
  | 'star'
  | 'blob'
  | 'octagon'
  | 'diamond'
  | 'torn-edge'
  | 'pentagon'
  | 'slash'
  | 'circle'
  | 'glitch-rect';

const CLIP_PATHS: Record<GeometricShape, string> = {
  hexagon:      'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  star:         'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  blob:         'polygon(38% 0%, 74% 7%, 100% 34%, 96% 68%, 75% 95%, 42% 100%, 12% 85%, 0% 56%, 6% 25%, 24% 7%)',
  octagon:      'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  diamond:      'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  'torn-edge':  'polygon(0% 8%, 7% 0%, 14% 6%, 20% 1%, 28% 7%, 35% 2%, 44% 8%, 52% 3%, 60% 7%, 67% 2%, 74% 6%, 80% 1%, 87% 5%, 93% 0%, 100% 4%, 100% 92%, 93% 100%, 87% 94%, 79% 100%, 73% 95%, 66% 100%, 58% 94%, 50% 100%, 42% 95%, 35% 100%, 27% 95%, 20% 100%, 13% 94%, 6% 100%, 0% 95%)',
  pentagon:     'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  slash:        'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
  circle:       'circle(50% at 50% 50%)',
  'glitch-rect':'polygon(0% 0%, 100% 0%, 100% 85%, 97% 85%, 97% 90%, 100% 90%, 100% 100%, 0% 100%, 0% 15%, 3% 15%, 3% 10%, 0% 10%)',
};

export interface GeometricMaskedContainerProps {
  shape?: GeometricShape;
  children: ReactNode;
  width?: number | string;
  height?: number | string;
  accentColor?: string;
  glowIntensity?: 'none' | 'soft' | 'strong';
  className?: string;
  style?: CSSProperties;
  /** Ink block underlay — tabloid color field behind the shape */
  underlayColor?: string;
  /** Paper texture overlay — adds print/newsprint grit */
  paperTexture?: boolean;
}

/**
 * GeometricMaskedContainer
 *
 * Clips any content (image, video, text, avatar) into a geometric shape.
 * Supports ink-block underlays and a paper-texture multiply pass for the
 * "tabloid magazine cutout" aesthetic.
 */
export default function GeometricMaskedContainer({
  shape = 'hexagon',
  children,
  width = 200,
  height = 200,
  accentColor = '#00FFFF',
  glowIntensity = 'soft',
  className = '',
  style,
  underlayColor,
  paperTexture = false,
}: GeometricMaskedContainerProps) {
  const clipPath = CLIP_PATHS[shape];
  const glowSize = glowIntensity === 'strong' ? 24 : glowIntensity === 'soft' ? 12 : 0;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        display: 'inline-block',
        ...style,
      }}
    >
      {/* Ink-block underlay (z-index 0) */}
      {underlayColor && (
        <div
          style={{
            position: 'absolute',
            inset: -6,
            background: underlayColor,
            clipPath,
            zIndex: 0,
            opacity: 0.85,
            transform: 'translate(4px, 4px)',
          }}
        />
      )}

      {/* Glow halo */}
      {glowIntensity !== 'none' && (
        <div
          style={{
            position: 'absolute',
            inset: -glowSize,
            background: `radial-gradient(ellipse at center, ${accentColor}55 0%, transparent 70%)`,
            clipPath,
            zIndex: 1,
            pointerEvents: 'none',
            filter: `blur(${glowSize * 0.6}px)`,
          }}
        />
      )}

      {/* Main clipped container (z-index 2) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          clipPath,
          overflow: 'hidden',
          zIndex: 2,
          border: `2px solid ${accentColor}66`,
          boxSizing: 'border-box',
        }}
      >
        {children}

        {/* Paper texture multiply layer (z-index 3) */}
        {paperTexture && (
          <div
            className="tmi-paper-texture"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              opacity: 0.18,
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Convenience exports ───────────────────────────────────────────────────────

/** Pre-built cutout for performer portraits — hexagon + torn-edge underlay */
export function PerformerSpotlightCutout({
  children,
  size = 220,
  accentColor = '#FF2DAA',
}: {
  children: ReactNode;
  size?: number;
  accentColor?: string;
}) {
  return (
    <GeometricMaskedContainer
      shape="hexagon"
      width={size}
      height={size}
      accentColor={accentColor}
      underlayColor="#FF4081"
      glowIntensity="strong"
      paperTexture
    >
      {children}
    </GeometricMaskedContainer>
  );
}

/** Pre-built cutout for battle/cypher recap tiles — torn-edge */
export function BattleRecapCutout({
  children,
  width = 280,
  height = 200,
  accentColor = '#FFD700',
}: {
  children: ReactNode;
  width?: number;
  height?: number;
  accentColor?: string;
}) {
  return (
    <GeometricMaskedContainer
      shape="torn-edge"
      width={width}
      height={height}
      accentColor={accentColor}
      underlayColor="#FFEB3B"
      glowIntensity="soft"
      paperTexture
    >
      {children}
    </GeometricMaskedContainer>
  );
}

/** Pre-built for star-shaped featured article hero images */
export function StarFeatureCutout({
  children,
  size = 200,
  accentColor = '#AA2DFF',
}: {
  children: ReactNode;
  size?: number;
  accentColor?: string;
}) {
  return (
    <GeometricMaskedContainer
      shape="star"
      width={size}
      height={size}
      accentColor={accentColor}
      underlayColor="#7B1FA2"
      glowIntensity="strong"
      paperTexture
    >
      {children}
    </GeometricMaskedContainer>
  );
}
