'use client';

import { useEffect, useMemo, useState } from 'react';

type ConfettiShape = 'rect' | 'diamond' | 'triangle' | 'streamer';
type ConfettiAssetCategory = 'hipHop' | 'rock' | 'jazz' | 'default';

type AssetSprite = {
  src: string;
  width: number;
  height: number;
  alt?: string;
};

type ConfettiPiece = {
  id: number;
  left: number;
  size: number;
  delayMs: number;
  durationMs: number;
  drift: number;
  rotate: number;
  color: string;
  shape: ConfettiShape;
  opacity: number;
  sprite?: AssetSprite;
};

export type ConfettiRespawnLoopProps = {
  active?: boolean;
  count?: number;
  zIndex?: number;
  respawnMs?: number;
  assetCategory?: ConfettiAssetCategory;
  assetThemeMap?: Partial<Record<ConfettiAssetCategory, AssetSprite[]>>;
  className?: string;
  testId?: string;
};

const COLORS = ['#00FFFF', '#FF2DAA', '#FFD700', '#AA2DFF', '#7CFF5B', '#FFFFFF'];
const SHAPES: ConfettiShape[] = ['rect', 'diamond', 'triangle', 'streamer'];

function makeGlyphSprite(glyph: string, color: string, size = 18): AssetSprite {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="${Math.round(size * 0.86)}" fill="${color}" font-family="Arial, Helvetica, sans-serif">${glyph}</text></svg>`;
  return {
    src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    width: size,
    height: size,
    alt: `${glyph} particle`,
  };
}

const DEFAULT_ASSET_THEME_MAP: Record<ConfettiAssetCategory, AssetSprite[]> = {
  hipHop: [
    makeGlyphSprite('$', '#7CFF5B', 18),
    makeGlyphSprite('$', '#FFD700', 16),
  ],
  rock: [
    makeGlyphSprite('▣', '#FF2DAA', 18),
    makeGlyphSprite('◫', '#00FFFF', 18),
  ],
  jazz: [
    makeGlyphSprite('♪', '#FFD700', 18),
    makeGlyphSprite('♫', '#AA2DFF', 18),
  ],
  default: [],
};

function pickSprite(
  assetCategory: ConfettiAssetCategory,
  assetThemeMap?: Partial<Record<ConfettiAssetCategory, AssetSprite[]>>,
): AssetSprite | undefined {
  const merged = {
    ...DEFAULT_ASSET_THEME_MAP,
    ...(assetThemeMap ?? {}),
  };
  const categorySprites = merged[assetCategory] ?? [];
  if (categorySprites.length === 0) return undefined;
  return categorySprites[Math.floor(Math.random() * categorySprites.length)];
}

function nextPieces(
  count: number,
  assetCategory: ConfettiAssetCategory,
  assetThemeMap?: Partial<Record<ConfettiAssetCategory, AssetSprite[]>>,
): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)] ?? 'rect';
    const sprite = pickSprite(assetCategory, assetThemeMap);
    const size = 5 + Math.random() * 10;
    return {
      id: i,
      left: Math.random() * 100,
      size,
      delayMs: Math.random() * 1400,
      durationMs: 3200 + Math.random() * 3400,
      drift: -18 + Math.random() * 36,
      rotate: -160 + Math.random() * 320,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#FFFFFF',
      shape,
      opacity: 0.5 + Math.random() * 0.45,
      sprite,
    };
  });
}

function shapeStyle(piece: ConfettiPiece): React.CSSProperties {
  if (piece.shape === 'triangle') {
    return {
      width: 0,
      height: 0,
      borderLeft: `${piece.size * 0.5}px solid transparent`,
      borderRight: `${piece.size * 0.5}px solid transparent`,
      borderBottom: `${piece.size}px solid ${piece.color}`,
      background: 'transparent',
    };
  }

  if (piece.shape === 'streamer') {
    return {
      width: Math.max(2, piece.size * 0.22),
      height: piece.size * 2.4,
      borderRadius: 999,
      background: piece.color,
    };
  }

  return {
    width: piece.size,
    height: piece.size * (piece.shape === 'rect' ? 0.72 : 1),
    borderRadius: piece.shape === 'rect' ? 1 : 2,
    background: piece.color,
    transform: piece.shape === 'diamond' ? 'rotate(45deg)' : undefined,
  };
}

export default function ConfettiRespawnLoop({
  active = true,
  count = 28,
  zIndex = 50,
  respawnMs = 2200,
  assetCategory = 'default',
  assetThemeMap,
  className,
  testId,
}: ConfettiRespawnLoopProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!active || reducedMotion) return;
    const timer = window.setInterval(() => {
      setEpoch((prev) => prev + 1);
    }, respawnMs);
    return () => window.clearInterval(timer);
  }, [active, reducedMotion, respawnMs]);

  const pieces = useMemo(() => {
    if (!active || reducedMotion) return [];
    return nextPieces(count, assetCategory, assetThemeMap);
  }, [active, count, reducedMotion, epoch, assetCategory, assetThemeMap]);

  if (!active || reducedMotion) return null;

  return (
    <div
      data-testid={testId ?? 'confetti-respawn-loop'}
      className={className}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex,
      }}
    >
      {pieces.map((piece) => (
        <span
          key={`${epoch}-${piece.id}`}
          style={{
            position: 'absolute',
            top: -24,
            left: `${piece.left}%`,
            opacity: piece.opacity,
            filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.24))',
            animationName: 'tmi-confetti-fall',
            animationDuration: `${piece.durationMs}ms`,
            animationTimingFunction: 'cubic-bezier(0.2, 0.55, 0.24, 1)',
            animationDelay: `${piece.delayMs}ms`,
            animationFillMode: 'both',
            ...(piece.sprite
              ? {
                  width: piece.sprite.width,
                  height: piece.sprite.height,
                  backgroundImage: `url(${piece.sprite.src})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'contain',
                }
              : shapeStyle(piece)),
            ['--confetti-drift' as string]: `${piece.drift}px`,
            ['--confetti-rotate' as string]: `${piece.rotate}deg`,
          }}
          role="presentation"
          title={piece.sprite?.alt}
        />
      ))}

      <style jsx>{`
        @keyframes tmi-confetti-fall {
          0% {
            transform: translate3d(0, -8vh, 0) rotate(0deg);
          }
          72% {
            transform: translate3d(var(--confetti-drift), 75vh, 0) rotate(var(--confetti-rotate));
          }
          100% {
            transform: translate3d(calc(var(--confetti-drift) * 1.25), 105vh, 0) rotate(calc(var(--confetti-rotate) * 1.2));
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          span {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}