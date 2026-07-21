'use client';

import React from 'react';
import type { YoPhoPortraitBlueprint, BlendMode } from '@/lib/yopho/YoPhoPortraitEngine';
import { OBJECT_MASK_CATALOG } from '@/lib/yopho/YoPhoPortraitEngine';

interface YoPhoPortraitStageCanvasProps {
  blueprint: YoPhoPortraitBlueprint;
  width?: number | string;
  height?: number | string;
  interactive?: boolean;
}

/**
 * YoPho Portrait Stage Canvas
 *
 * Renders the multi-layered double exposure, opposing portrait, object mask,
 * or live cutout composition with hair/edge preservation and blend mode mixing.
 */
export default function YoPhoPortraitStageCanvas({
  blueprint,
  width = '100%',
  height = 500,
  interactive = true,
}: YoPhoPortraitStageCanvasProps) {
  const {
    mode,
    primaryLayer,
    secondaryLayers,
    objectMask,
    texturePreset,
    colorPalette,
    lightingDirection,
    isAnimated,
  } = blueprint;

  // Selected Object Mask Definition if mode === 'object_composite'
  const activeMaskDef = OBJECT_MASK_CATALOG.find((m) => m.id === objectMask) || OBJECT_MASK_CATALOG[0];

  // Preset Visual Treatments
  const getTextureStyle = () => {
    switch (texturePreset) {
      case '80s_airbrush':
        return {
          filter: 'drop-shadow(0 0 25px #FF2DAA) saturate(1.8) contrast(1.1)',
          boxShadow: 'inset 0 0 40px rgba(255, 45, 170, 0.4)',
        };
      case 'vintage_album':
        return {
          filter: 'sepia(0.35) contrast(1.2) brightness(0.95)',
          boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.7)',
        };
      case 'gold_foil':
        return {
          filter: 'sepia(0.8) hue-rotate(5deg) saturate(2.5) drop-shadow(0 0 20px #FFD700)',
          boxShadow: 'inset 0 0 30px rgba(255, 215, 0, 0.3)',
        };
      case 'halftone':
        return {
          filter: 'contrast(1.6) saturate(0.8)',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)',
        };
      case 'cyber_glow':
      default:
        return {
          filter: 'drop-shadow(0 0 20px #00E5FF) contrast(1.15)',
          boxShadow: 'inset 0 0 30px rgba(0, 229, 255, 0.25)',
        };
    }
  };

  const textureStyle = getTextureStyle();

  // Lighting Direction Gradient
  const getLightingOverlay = () => {
    switch (lightingDirection) {
      case 'top-left':
        return 'radial-gradient(ellipse at 15% 15%, rgba(255,255,255,0.3) 0%, transparent 60%)';
      case 'top-right':
        return 'radial-gradient(ellipse at 85% 15%, rgba(0,229,255,0.35) 0%, transparent 60%)';
      case 'bottom-up':
        return 'linear-gradient(to top, rgba(255,45,170,0.4) 0%, transparent 70%)';
      case 'center-stage':
      default:
        return 'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.3) 0%, transparent 65%)';
    }
  };

  return (
    <div
      style={{
        ...textureStyle,
        position: 'relative',
        width,
        height,
        borderRadius: 20,
        overflow: 'hidden',
        background: '#04020a',
        border: `2px solid ${colorPalette.primaryAccent}`,
      }}
    >
      {/* ── Layer 0: Background Fill / Video Underlay ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {isAnimated && blueprint.secondaryFillUrl?.endsWith('.mp4') ? (
          <video
            src={blueprint.secondaryFillUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `radial-gradient(ellipse at center, ${colorPalette.primaryAccent}22 0%, #030108 100%)`,
            }}
          />
        )}
      </div>

      {/* ── Layer 1: Lighting Gradient Overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: getLightingOverlay(),
        }}
      />

      {/* ── Layer 2: Main Subject Cutout / Double Exposure / Object Composite ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {mode === 'object_composite' ? (
          /* Object Mask Composition */
          <div style={{ position: 'relative', width: '75%', height: '75%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox={activeMaskDef.viewBox} width="100%" height="100%" style={{ filter: `drop-shadow(0 0 25px ${colorPalette.primaryAccent})` }}>
              <defs>
                <clipPath id={`object_mask_clip_${blueprint.id}`}>
                  <path d={activeMaskDef.svgPath} />
                </clipPath>
              </defs>

              {/* Mask Outline SVG */}
              <path
                d={activeMaskDef.svgPath}
                fill="none"
                stroke={colorPalette.primaryAccent}
                strokeWidth="2.5"
                filter={`drop-shadow(0 0 10px ${colorPalette.primaryAccent})`}
              />

              {/* Cutout Image clipped inside Object Silhouette */}
              <image
                href={primaryLayer.imageUrl}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#object_mask_clip_${blueprint.id})`}
                style={{
                  transform: `scale(${primaryLayer.scale}) translate(${primaryLayer.xOffset}px, ${primaryLayer.yOffset}px) rotate(${primaryLayer.rotation}deg)`,
                  transformOrigin: 'center center',
                  filter: primaryLayer.preserveHairEdges ? 'contrast(1.1) brightness(1.05)' : 'none',
                }}
              />
            </svg>

            {/* Object Mask Icon Badge */}
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(5,5,18,0.85)', border: `1px solid ${colorPalette.primaryAccent}`, borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{activeMaskDef.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>{activeMaskDef.name}</span>
            </div>
          </div>
        ) : mode === 'opposing' ? (
          /* Opposing Portrait Mode (Left vs Right Facing) */
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
            {/* Left-Facing Subject */}
            <div style={{ width: '48%', height: '85%', position: 'relative', overflow: 'hidden', transform: 'scaleX(1)' }}>
              <img
                src={primaryLayer.imageUrl}
                alt={primaryLayer.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: `drop-shadow(0 0 15px ${colorPalette.primaryAccent})`,
                }}
              />
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 6, color: colorPalette.primaryAccent, fontSize: 9, fontWeight: 900 }}>
                ◀ {primaryLayer.facing.toUpperCase()} POSE
              </div>
            </div>

            {/* Right-Facing Secondary Subject */}
            {secondaryLayers[0] && (
              <div style={{ width: '48%', height: '85%', position: 'relative', overflow: 'hidden', transform: 'scaleX(-1)' }}>
                <img
                  src={secondaryLayers[0].imageUrl}
                  alt={secondaryLayers[0].label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: `drop-shadow(0 0 15px ${colorPalette.secondaryAccent})`,
                  }}
                />
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 6, color: colorPalette.secondaryAccent, fontSize: 9, fontWeight: 900, transform: 'scaleX(-1)' }}>
                  {secondaryLayers[0].facing.toUpperCase()} POSE ▶
                </div>
              </div>
            )}
          </div>
        ) : mode === 'multi_montage' ? (
          /* Multi-Portrait Collage Montage */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '90%', height: '85%' }}>
            {[primaryLayer, ...secondaryLayers].slice(0, 6).map((layer, idx) => (
              <div
                key={layer.id || idx}
                style={{
                  position: 'relative',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: `1px solid ${idx % 2 === 0 ? colorPalette.primaryAccent : colorPalette.secondaryAccent}`,
                  background: 'rgba(5,5,20,0.8)',
                }}
              >
                <img
                  src={layer.imageUrl}
                  alt={layer.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.8)', color: '#FFD700', fontSize: 8, fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>
                  POSE #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Portrait / Double Exposure Main Silhouette Composition */
          <div style={{ position: 'relative', width: '85%', height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Secondary Inner Blend Layer for Double Exposure */}
            {mode === 'double_exposure' && secondaryLayers[0] && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  mixBlendMode: secondaryLayers[0].blendMode as any,
                  opacity: secondaryLayers[0].opacity,
                  maskImage: `url(${primaryLayer.imageUrl})`,
                  WebkitMaskImage: `url(${primaryLayer.imageUrl})`,
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center center',
                  WebkitMaskPosition: 'center center',
                }}
              >
                <img
                  src={secondaryLayers[0].imageUrl}
                  alt="Inner Memory Scene"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Primary Cutout Subject */}
            <img
              src={primaryLayer.imageUrl}
              alt={primaryLayer.label}
              style={{
                position: 'relative',
                zIndex: 2,
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                transform: `scale(${primaryLayer.scale}) translate(${primaryLayer.xOffset}px, ${primaryLayer.yOffset}px) rotate(${primaryLayer.rotation}deg)`,
                filter: `drop-shadow(0 0 ${primaryLayer.edgeSoftness * 2}px ${colorPalette.primaryAccent})`,
                opacity: primaryLayer.opacity,
              }}
            />
          </div>
        )}
      </div>

      {/* ── Layer 3: Interactive Title Badge ── */}
      <div style={{ position: 'absolute', top: 14, left: 16, zIndex: 5, background: 'rgba(4,2,12,0.85)', backdropFilter: 'blur(10px)', border: `1px solid ${colorPalette.primaryAccent}66`, borderRadius: 8, padding: '4px 12px' }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: colorPalette.primaryAccent, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          YOPHO PORTRAIT OS · {mode.replace('_', ' ').toUpperCase()}
        </div>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#fff', marginTop: 1 }}>
          {blueprint.title}
        </div>
      </div>
    </div>
  );
}
