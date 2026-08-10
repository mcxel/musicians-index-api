'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface DepthLayer {
  id: string;
  imageUrl: string;
  label?: string;
  /** Perceived depth: -100 = far background, 0 = flat, +100 = very close foreground */
  depthZ: number;
  /** 0..1 — how much this layer shifts on mouse move. Background gets less, foreground gets more. */
  parallaxStrength: number;
  /** CSS blur for depth-of-field effect on background layers (px) */
  depthBlur: number;
  scale: number;
  xOffset: number;
  yOffset: number;
  opacity: number;
}

interface YoPhoDepthParallaxCanvasProps {
  layers: DepthLayer[];
  width?: number | string;
  height?: number | string;
  /** Max tilt angle in degrees for the full 3D card tilt */
  maxTilt?: number;
  /** Max parallax shift in px at full mouse-edge position */
  maxShift?: number;
  accentColor?: string;
  /** Show the depth ruler overlay for the editor */
  showDepthRuler?: boolean;
}

/**
 * YoPho Depth Parallax Canvas
 *
 * Renders two or more image layers at different perceived Z-depths.
 * Background layers shift less on mouse move; foreground layers shift more.
 * Result: viewer can clearly see one image "in front of" another — the
 * parallax depth / "closer vs further" effect creators are looking for.
 *
 * The entire card also tilts with CSS perspective for a holographic card feel.
 */
export default function YoPhoDepthParallaxCanvas({
  layers,
  width = '100%',
  height = 500,
  maxTilt = 12,
  maxShift = 28,
  accentColor = '#00FFFF',
  showDepthRuler = false,
}: YoPhoDepthParallaxCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 }); // normalized -1..1
  const [gyro, setGyro] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  // Smooth lerp toward target mouse position
  const animate = useCallback(() => {
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08;
    setMouse({ x: currentRef.current.x, y: currentRef.current.y });
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    targetRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
  }, []);

  // Gyroscope support for mobile
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      setGyro({
        x: Math.max(-1, Math.min(1, (e.gamma ?? 0) / 30)),
        y: Math.max(-1, Math.min(1, ((e.beta ?? 0) - 30) / 30)),
      });
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Combine mouse and gyro input
  const input = {
    x: mouse.x + gyro.x * 0.5,
    y: mouse.y + gyro.y * 0.5,
  };

  // Card-level tilt (holographic card feel)
  const cardRotateY = input.x * maxTilt;
  const cardRotateX = -input.y * maxTilt;

  // Sorted by depthZ ascending so background layers render first
  const sortedLayers = [...layers].sort((a, b) => a.depthZ - b.depthZ);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'crosshair',
        /* CSS 3D perspective — the parent space that makes Z-depth real */
        perspective: '800px',
        perspectiveOrigin: '50% 50%',
        background: '#04020a',
        border: `2px solid ${accentColor}44`,
        boxShadow: `0 0 40px ${accentColor}22, inset 0 0 20px rgba(0,0,0,0.6)`,
        userSelect: 'none',
      }}
    >
      {/* Card tilt shell — entire composition tilts as one unit */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateY(${cardRotateY}deg) rotateX(${cardRotateX}deg)`,
          transition: 'transform 0.05s linear',
          willChange: 'transform',
        }}
      >
        {sortedLayers.map((layer) => {
          // Per-layer parallax offset: deeper back = less shift, closer front = more shift
          const strength = layer.parallaxStrength ?? 1;
          const shiftX = input.x * maxShift * strength;
          const shiftY = input.y * maxShift * strength;

          // CSS translateZ — background layers go negative (further), foreground positive (closer)
          const translateZ = (layer.depthZ / 100) * 120; // map -100..100 → -120px..+120px

          // Depth-of-field: background layers get blur proportional to how far back they are
          const blur = layer.depthBlur ?? (layer.depthZ < -20 ? Math.abs(layer.depthZ + 20) * 0.04 : 0);

          // Shadow: foreground layers get a drop-shadow to reinforce "closer" feel
          const shadow =
            layer.depthZ > 20
              ? `drop-shadow(${-shiftX * 0.15}px ${shiftY * 0.15 + 8}px ${14 + layer.depthZ * 0.1}px rgba(0,0,0,0.55))`
              : 'none';

          return (
            <div
              key={layer.id}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformStyle: 'preserve-3d',
                transform: `translateZ(${translateZ}px) translate(${shiftX}px, ${shiftY}px)`,
                willChange: 'transform',
              }}
            >
              <img
                src={layer.imageUrl}
                alt={layer.label ?? 'layer'}
                draggable={false}
                style={{
                  width: `${(layer.scale ?? 1) * 100}%`,
                  height: `${(layer.scale ?? 1) * 100}%`,
                  objectFit: 'contain',
                  opacity: layer.opacity ?? 1,
                  filter: [
                    blur > 0 ? `blur(${blur}px)` : '',
                    shadow !== 'none' ? shadow : '',
                  ]
                    .filter(Boolean)
                    .join(' ') || 'none',
                  transform: `translate(${layer.xOffset ?? 0}px, ${layer.yOffset ?? 0}px)`,
                  pointerEvents: 'none',
                  transition: 'filter 0.1s ease',
                }}
              />
            </div>
          );
        })}

        {/* Specular sheen overlay — moves opposite to tilt for holographic gloss */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at ${50 + input.x * 30}% ${50 + input.y * 30}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 9998,
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Depth ruler — editor-only overlay showing each layer's Z position */}
      {showDepthRuler && (
        <div
          style={{
            position: 'absolute',
            right: 10,
            top: 10,
            bottom: 10,
            width: 28,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 7, color: accentColor, fontWeight: 900, letterSpacing: 1 }}>FRONT</span>
          <div style={{ flex: 1, width: 2, background: `linear-gradient(to bottom, ${accentColor}, #FF2DAA55)`, borderRadius: 2, margin: '4px 0', position: 'relative' }}>
            {sortedLayers.map((layer) => {
              const pct = 50 - layer.depthZ * 0.48; // 0 = top (front), 100 = bottom (back)
              return (
                <div
                  key={layer.id}
                  title={layer.label}
                  style={{
                    position: 'absolute',
                    top: `${pct}%`,
                    left: -4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: layer.depthZ > 0 ? accentColor : '#FF2DAA',
                    border: '2px solid #fff',
                    transform: 'translateY(-50%)',
                    boxShadow: `0 0 6px ${accentColor}`,
                  }}
                />
              );
            })}
          </div>
          <span style={{ fontSize: 7, color: '#FF2DAA', fontWeight: 900, letterSpacing: 1 }}>BACK</span>
        </div>
      )}

      {/* Corner label */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          zIndex: 9999,
          fontSize: 8,
          fontWeight: 900,
          color: `${accentColor}99`,
          letterSpacing: '0.1em',
          pointerEvents: 'none',
        }}
      >
        DEPTH PARALLAX · {layers.length} LAYER{layers.length !== 1 ? 'S' : ''}
      </div>
    </div>
  );
}

/** Build a default two-layer depth setup from two image URLs */
export function createDepthLayerPair(
  foregroundUrl: string,
  backgroundUrl: string,
): DepthLayer[] {
  return [
    {
      id: 'background',
      imageUrl: backgroundUrl,
      label: 'Background',
      depthZ: -60,       // far back
      parallaxStrength: 0.3,
      depthBlur: 1.5,
      scale: 1.12,       // slightly larger to prevent edge gaps during shift
      xOffset: 0,
      yOffset: 0,
      opacity: 0.85,
    },
    {
      id: 'foreground',
      imageUrl: foregroundUrl,
      label: 'Foreground',
      depthZ: +55,       // in front
      parallaxStrength: 1.4,
      depthBlur: 0,
      scale: 0.88,       // slightly smaller — the perspective already makes it look bigger/closer
      xOffset: 0,
      yOffset: 0,
      opacity: 1,
    },
  ];
}
