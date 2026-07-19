'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export interface HeroBannerSlide {
  src: string;
  label: string;
  href: string;
}

// Curated from real uploaded assets in public/banners/ — only categories
// with an actual banner image are listed here (Rule 20: no placeholder
// categories without real art).
export const HERO_BILLBOARD_SLIDES: HeroBannerSlide[] = [
  { src: '/banners/battle.png',                label: 'Battle Arena',          href: '/battles' },
  { src: '/banners/cypher-arena.png',          label: 'Cypher Arena',          href: '/cypher/lobby-wall' },
  { src: '/banners/challenges.png',            label: 'Challenges',            href: '/challenges/lobby-wall' },
  { src: '/banners/battle-of-the-bands.png',   label: 'Battle of the Bands',   href: '/battles' },
  { src: '/banners/live-sessions.png',         label: 'Live Sessions',         href: '/live/lobby-wall' },
  { src: '/banners/lounges.png',               label: 'Lounges',               href: '/live/lobby' },
  { src: '/banners/lobbies.png',               label: 'Lobbies',               href: '/live/lobby' },
  { src: '/banners/world-dance-party.png',     label: 'World Dance Party',     href: '/live/lobby' },
  { src: '/banners/world-karaoke.png',         label: 'World Karaoke',         href: '/live/lobby' },
  { src: '/banners/games.png',                 label: 'Game Shows',            href: '/live/lobby' },
  { src: '/banners/comedy.png',                label: 'Comedy',                href: '/live/lobby' },
  { src: '/banners/dance-off.png',             label: 'Dance Off',             href: '/battles' },
  { src: '/banners/instrument-players.png',    label: 'Instrument Players',    href: '/performers' },
  { src: '/banners/actors-and-streamers.png',  label: 'Actors & Streamers',    href: '/performers' },
  { src: '/banners/fans.png',                  label: 'Fan Community',         href: '/hub/fan' },
];

interface RotatingHeroBannerProps {
  slides: HeroBannerSlide[];
  intervalMs?: number;
  side: 'left' | 'right';
  priority?: boolean;
}

/**
 * Rotating billboard panel for the Home 1 hero.
 *
 * Fixes applied 2026-07-19:
 * - Blur-background fill: a heavily-blurred copy of the image fills the
 *   container so landscape/thin source images never leave empty bars.
 *   The sharp foreground uses objectFit:contain so the full artwork is
 *   always visible at correct proportions.
 * - Netflix-style navigation: prev/next arrow buttons + dot indicators.
 *   Clicking either pauses auto-rotation for 4 s then resumes.
 * - Pause-on-hover: auto-rotation stops while the user inspects a slide.
 */
export default function RotatingHeroBanner({
  slides,
  intervalMs = 9000,
  side,
  priority = false,
}: Readonly<RotatingHeroBannerProps>) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Navigate manually, pausing auto-advance for 4 s then resuming.
  const nav = useCallback(
    (delta: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIndex((i) => (i + delta + slides.length) % slides.length);
      setIsPaused(true);
      if (resumeRef.current) clearTimeout(resumeRef.current);
      resumeRef.current = setTimeout(() => setIsPaused(false), 4000);
    },
    [slides.length],
  );

  useEffect(() => () => { if (resumeRef.current) clearTimeout(resumeRef.current); }, []);

  // Auto-advance — stops while paused (hover or user nav).
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs, isPaused]);

  if (!slides.length) return null;
  const current = slides[index]!;
  // Preload current + upcoming slide only — keep image budget low.
  const preload = new Set([index, (index + 1) % slides.length]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 200,
        borderRadius: 14,
        overflow: 'hidden',
        border: '2px solid rgba(170,45,255,0.55)',
        boxShadow: '0 0 28px rgba(170,45,255,0.35), 0 0 8px rgba(170,45,255,0.25) inset',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Slides ── */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === index ? 1 : 0,
            transform: i === index ? 'scale(1.00)' : 'scale(1.06)',
            transition: 'opacity 1.0s ease, transform 9s ease-out',
            willChange: 'opacity, transform',
          }}
        >
          {preload.has(i) && (
            <>
              {/*
               * Layer 1 — blurred atmospheric fill.
               * Covers the entire container regardless of source aspect ratio.
               * scale(1.15) keeps blur edge artifacts outside the border-radius.
               * Landscape images (wide/thin) leave visible bars with objectFit:contain;
               * this layer fills those bars with an atmospheric version of the artwork.
               */}
              <Image
                src={slide.src}
                alt=""
                fill
                sizes="240px"
                priority={priority && i === 0}
                style={{
                  objectFit: 'cover',
                  filter: 'blur(20px) brightness(0.45) saturate(1.4)',
                  transform: 'scale(1.15)',
                }}
              />
              {/*
               * Layer 2 — sharp foreground using objectFit:contain.
               * The full artwork is always visible at its correct aspect ratio.
               * For portrait posters this fills the card; for landscape/thin
               * images the blur layer behind fills the letterbox gaps.
               */}
              <Image
                src={slide.src}
                alt={slide.label}
                fill
                sizes="(max-width: 900px) 100vw, 240px"
                priority={priority && i === 0}
                style={{ objectFit: 'contain', objectPosition: 'center top' }}
              />
            </>
          )}
        </div>
      ))}

      {/* ── Click-through link (below nav buttons in z-order) ── */}
      <a
        href={current.href}
        aria-label={current.label}
        style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'block' }}
      />

      {/* ── Bottom label — integrated into poster ── */}
      <div
        style={{
          position: 'absolute',
          bottom: slides.length > 1 ? 18 : 0,
          left: 0, right: 0,
          zIndex: 4,
          background: 'linear-gradient(to top, rgba(4,2,14,0.92) 0%, rgba(4,2,14,0.58) 48%, transparent 100%)',
          padding: '22px 10px 8px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: '0.12em',
            color: '#FFD700',
            textShadow: '0 1px 6px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {current.label.toUpperCase()}
        </div>
      </div>

      {/* ── Thin top-edge neon shimmer ── */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(170,45,255,0.8), transparent)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* ── Dot indicators ── */}
      {slides.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 5, left: 0, right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              style={{
                width: i === index ? 10 : 4,
                height: 3,
                borderRadius: 2,
                background: i === index ? '#FFD700' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Prev / Next arrow buttons ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => nav(-1, e)}
            aria-label="Previous slide"
            style={{
              position: 'absolute',
              left: 5, top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 8,
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '50%',
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 15,
              lineHeight: 1,
              padding: 0,
              opacity: 0.75,
              transition: 'opacity 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
          >
            ‹
          </button>
          <button
            onClick={(e) => nav(+1, e)}
            aria-label="Next slide"
            style={{
              position: 'absolute',
              right: 5, top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 8,
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '50%',
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 15,
              lineHeight: 1,
              padding: 0,
              opacity: 0.75,
              transition: 'opacity 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
