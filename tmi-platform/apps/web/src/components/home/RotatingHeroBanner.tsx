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

  // Two flanking strip indices — rotate independently so the card always
  // has content filling both sides and never looks like a blank box.
  const [leftIdx, setLeftIdx] = useState(() => (slides.length > 1 ? 1 % slides.length : 0));
  const [rightIdx, setRightIdx] = useState(() => (slides.length > 2 ? 2 % slides.length : 0));

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

  // Left strip — rotates at ~65 % of the main interval.
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(
      () => setLeftIdx((i) => (i + 1) % slides.length),
      Math.round(intervalMs * 0.65),
    );
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  // Right strip — rotates at ~140 % of the main interval.
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(
      () => setRightIdx((i) => (i + 2) % slides.length),
      Math.round(intervalMs * 1.4),
    );
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  if (!slides.length) return null;
  const center = slides[index]!;

  // Resolve safe flanking slides — ensure no strip shows the same image
  // as the center or as each other.
  const safeLeftSlide = (() => {
    let i = leftIdx === index ? (leftIdx + 1) % slides.length : leftIdx;
    return slides[i]!;
  })();
  const safeRightSlide = (() => {
    let i = rightIdx === index ? (rightIdx + 1) % slides.length : rightIdx;
    if (slides[i]!.src === safeLeftSlide.src) i = (i + 1) % slides.length;
    return slides[i]!;
  })();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: 14,
        overflow: 'hidden',
        border: '2px solid rgba(170,45,255,0.55)',
        boxShadow: '0 0 28px rgba(170,45,255,0.35), 0 0 8px rgba(170,45,255,0.25) inset',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── 3-up triptych layout: dim left | featured center | dim right ──
          Each strip fills its column with objectFit:cover so there
          is never a blank/dark gap regardless of source aspect ratio.
          Left/right rotate on independent schedules for a live-marquee
          feel without the user needing to click anything. */}
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>

        {/* Left flank (25%) — dimmed so center stays focal */}
        <div style={{ flex: '0 0 25%', position: 'relative', overflow: 'hidden' }}>
          <Image
            src={safeLeftSlide.src}
            alt={safeLeftSlide.label}
            fill
            sizes="100px"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.55,
              transition: 'opacity 0.8s ease',
            }}
          />
        </div>

        {/* Purple divider line */}
        <div style={{ width: 1, flexShrink: 0, background: 'rgba(170,45,255,0.55)', zIndex: 1 }} />

        {/* Center (50%) — main featured banner with blur fill + label */}
        <div style={{ flex: '1', position: 'relative', overflow: 'hidden' }}>
          {/* Blur atmospheric fill — covers any edge gaps from cropping */}
          <Image
            src={center.src}
            alt=""
            fill
            sizes="200px"
            priority={priority}
            style={{
              objectFit: 'cover',
              filter: 'blur(20px) brightness(0.45) saturate(1.4)',
              transform: 'scale(1.15)',
            }}
          />
          {/* Sharp foreground */}
          <Image
            src={center.src}
            alt={center.label}
            fill
            sizes="200px"
            priority={priority}
            style={{ objectFit: 'cover', objectPosition: 'center top', transition: 'opacity 1s ease' }}
          />
          {/* Click-through link */}
          <a
            href={center.href}
            aria-label={center.label}
            style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'block' }}
          />
          {/* Bottom label */}
          <div
            style={{
              position: 'absolute',
              bottom: slides.length > 1 ? 18 : 0,
              left: 0, right: 0, zIndex: 4,
              background: 'linear-gradient(to top, rgba(4,2,14,0.92) 0%, rgba(4,2,14,0.58) 48%, transparent 100%)',
              padding: '22px 8px 8px',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: '#FFD700',
              textShadow: '0 1px 6px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center',
            }}>
              {center.label.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Purple divider line */}
        <div style={{ width: 1, flexShrink: 0, background: 'rgba(170,45,255,0.55)', zIndex: 1 }} />

        {/* Right flank (25%) — dimmed */}
        <div style={{ flex: '0 0 25%', position: 'relative', overflow: 'hidden' }}>
          <Image
            src={safeRightSlide.src}
            alt={safeRightSlide.label}
            fill
            sizes="100px"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.55,
              transition: 'opacity 0.8s ease',
            }}
          />
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

      {/* ── Dot indicators (center strip only) ── */}
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

      {/* ── Prev / Next arrow buttons (center strip) ── */}
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

  return (
    <div
      style={{
        position: 'relative',
        /* aspect-ratio: 3/4 makes the banner a portrait poster card
           regardless of the column width — width drives height.
           At 400 px wide → 533 px tall; at 240 px → 320 px tall.
           This is the "own widget" for portrait/skinny content:
           the container is ALWAYS taller-than-wide so artwork fills
           naturally at every breakpoint without blank bars or squashing. */
        width: '100%',
        aspectRatio: '3 / 4',
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
               * Layer 2 — sharp foreground using objectFit:cover.
               * Fills the full container at every aspect ratio; the blurred
               * layer behind adds atmospheric depth to any cropped edges.
               * Using contain here left blank bars on the sides when the
               * container is approximately square — cover eliminates that.
               */}
              <Image
                src={slide.src}
                alt={slide.label}
                fill
                sizes="(max-width: 900px) 100vw, 320px"
                priority={priority && i === 0}
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
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
