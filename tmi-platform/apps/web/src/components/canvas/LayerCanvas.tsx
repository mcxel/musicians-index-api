'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { TMILayer } from '@/types/layers';

type InteractionMode = 'drag' | 'rotate' | 'scale';

type InteractionState = {
  mode: InteractionMode;
  id: string;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startScale: number;
  startRotation: number;
  originAngle: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function LayerCanvas({
  layers,
  onLayersChange,
  isDesignMode,
}: {
  layers: TMILayer[];
  onLayersChange: (next: TMILayer[]) => void;
  isDesignMode: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const interactionRef = useRef<InteractionState | null>(null);

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedId) ?? null,
    [layers, selectedId]
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!interactionRef.current || !containerRef.current) return;

      const interaction = interactionRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = ((interaction.startX / 100) * rect.width) + rect.left;
      const centerY = ((interaction.startY / 100) * rect.height) + rect.top;

      onLayersChange(
        layers.map((layer) => {
          if (layer.id !== interaction.id) return layer;

          if (interaction.mode === 'drag') {
            const dxPct = ((event.clientX - interaction.startClientX) / rect.width) * 100;
            const dyPct = ((event.clientY - interaction.startClientY) / rect.height) * 100;
            return {
              ...layer,
              x: clamp(interaction.startX + dxPct, 0, 100),
              y: clamp(interaction.startY + dyPct, 0, 100),
            };
          }

          if (interaction.mode === 'scale') {
            const delta = (event.clientX - interaction.startClientX) / Math.max(rect.width, 1);
            return {
              ...layer,
              scale: clamp(interaction.startScale + delta * 2.2, 0.4, 3),
            };
          }

          const currentAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
          const deltaAngle = ((currentAngle - interaction.originAngle) * 180) / Math.PI;
          return {
            ...layer,
            rotation: interaction.startRotation + deltaAngle,
          };
        })
      );
    };

    const onPointerUp = () => {
      interactionRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [layers, onLayersChange]);

  const beginDrag = (
    event: React.PointerEvent<HTMLElement>,
    layer: TMILayer,
    mode: InteractionMode
  ) => {
    if (!isDesignMode || layer.isLocked || !containerRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = ((layer.x / 100) * rect.width) + rect.left;
    const centerY = ((layer.y / 100) * rect.height) + rect.top;

    interactionRef.current = {
      mode,
      id: layer.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layer.x,
      startY: layer.y,
      startScale: layer.scale,
      startRotation: layer.rotation,
      originAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX),
    };
    setSelectedId(layer.id);
  };

  const toggleLock = (id: string) => {
    onLayersChange(
      layers.map((layer) => (layer.id === id ? { ...layer, isLocked: !layer.isLocked } : layer))
    );
  };

  return (
    <div className="tmi-layer-canvas" ref={containerRef}>
      {layers
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((layer) => {
          const isSelected = selectedId === layer.id;
          const layerStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${layer.x}%`,
            top: `${layer.y}%`,
            width: `${layer.width}px`,
            height: `${layer.height}px`,
            transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
            opacity: layer.opacity,
            zIndex: layer.zIndex,
            mixBlendMode: layer.blendMode,
            cursor: isDesignMode && !layer.isLocked ? 'move' : 'default',
            transition: interactionRef.current ? 'none' : 'transform 140ms ease',
            pointerEvents: 'auto',
          };

          return (
            <div
              key={layer.id}
              style={layerStyle}
              className={`tmi-layer-node tmi-layer-${layer.type}`}
              onPointerDown={(event) => beginDrag(event, layer, 'drag')}
              onClick={() => isDesignMode && setSelectedId(layer.id)}
            >
              {layer.assetUrl ? <img src={layer.assetUrl} alt={layer.label} draggable={false} /> : null}
              {layer.text ? (
                layer.href && !isDesignMode ? (
                  <Link href={layer.href} className="tmi-layer-link">
                    {layer.text}
                  </Link>
                ) : (
                  <span className="tmi-layer-label">{layer.text}</span>
                )
              ) : null}

              {isDesignMode ? (
                <button
                  type="button"
                  className="tmi-layer-lock"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleLock(layer.id);
                  }}
                >
                  {layer.isLocked ? 'Unlock' : 'Lock'}
                </button>
              ) : null}

              {isDesignMode && isSelected && !layer.isLocked ? (
                <>
                  <button
                    type="button"
                    className="tmi-layer-handle tmi-layer-rotate"
                    onPointerDown={(event) => beginDrag(event, layer, 'rotate')}
                    aria-label="Rotate layer"
                  />
                  <button
                    type="button"
                    className="tmi-layer-handle tmi-layer-scale"
                    onPointerDown={(event) => beginDrag(event, layer, 'scale')}
                    aria-label="Scale layer"
                  />
                </>
              ) : null}
            </div>
          );
        })}

      <style>{`
        .tmi-layer-canvas {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 12;
        }

        .tmi-layer-node {
          pointer-events: auto;
          border: 1px solid rgba(8, 10, 14, 0.9);
          box-shadow: 0 20px 42px rgba(0, 0, 0, 0.48), -1px -1px 0 rgba(8, 8, 12, 0.9);
          overflow: hidden;
          backdrop-filter: blur(1px);
        }

        .tmi-layer-underlay {
          border-style: dashed;
        }

        .tmi-layer-overlay,
        .tmi-layer-sticker,
        .tmi-layer-cta {
          border-style: solid;
        }

        .tmi-layer-node img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }

        .tmi-layer-label,
        .tmi-layer-link {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.94);
          text-decoration: none;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.45);
        }

        .tmi-layer-lock {
          position: absolute;
          left: 6px;
          top: 6px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(6, 9, 16, 0.92);
          color: #fff;
          font-size: 10px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          padding: 3px 6px;
          cursor: pointer;
          z-index: 3;
        }

        .tmi-layer-handle {
          position: absolute;
          width: 14px;
          height: 14px;
          border: 1px solid #0f1320;
          background: #ffd700;
          border-radius: 50%;
          z-index: 4;
          cursor: pointer;
        }

        .tmi-layer-rotate {
          right: -7px;
          top: -7px;
          background: #00dfff;
        }

        .tmi-layer-scale {
          right: -7px;
          bottom: -7px;
          background: #ff2daa;
        }
      `}</style>
    </div>
  );
}
