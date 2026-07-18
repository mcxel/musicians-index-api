'use client';

import { useEffect, useState } from 'react';
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
  { src: '/banners/lobbies.png',                label: 'Lobbies',              href: '/live/lobby' },
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
 * Rotating billboard panel for the Home 1 hero. Cycles through real
 * promotional artwork with a cross-fade + slow zoom. Uses next/image so the
 * browser gets an on-the-fly optimized WebP/AVIF derivative of the source
 * PNG, never the multi-MB original (Rule: don't ship unoptimized hero
 * assets — see 2026-07-18 perf note). Only the current + next slide are
 * mounted at once; everything else stays unloaded until its turn.
 */
export default function RotatingHeroBanner({ slides, intervalMs = 9000, side, priority = false }: RotatingHeroBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  if (slides.length === 0) return null;
  const current = slides[index];
  const fadeEdge = side === 'left'
    ? 'linear-gradient(90deg, rgba(5,3,16,0) 0%, rgba(5,3,16,0.55) 68%, rgba(5,3,16,1) 100%)'
    : 'linear-gradient(270deg, rgba(5,3,16,0) 0%, rgba(5,3,16,0.55) 68%, rgba(5,3,16,1) 100%)';

  return (
    <a
      href={current.href}
      aria-label={current.label}
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '100%',
        minHeight: 160,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(170,45,255,0.28)',
        boxShadow: '0 0 26px rgba(170,45,255,0.18)',
        textDecoration: 'none',
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === index ? 1 : 0,
            transform: i === index ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity 1.1s ease, transform 8.5s ease-out',
            willChange: 'opacity, transform',
          }}
        >
          {/* Only render the image tag for the active + immediate-next slide
              so idle slides don't consume a network request before their turn. */}
          {(i === index || i === (index + 1) % slides.length) && (
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              sizes="(max-width: 900px) 100vw, 220px"
              priority={priority && i === 0}
              style={{ objectFit: 'cover' }}
            />
          )}
        </div>
      ))}

      {/* Glass blur edge blending the artwork into the hero background */}
      <div style={{ position: 'absolute', inset: 0, background: fadeEdge, pointerEvents: 'none' }} />

      {/* Light sweep accent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.10) 50%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: side === 'left' ? 12 : undefined,
          right: side === 'right' ? 12 : undefined,
          padding: '5px 12px',
          borderRadius: 999,
          background: 'rgba(5,3,16,0.72)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,215,0,0.35)',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.08em',
          color: '#FFD700',
          whiteSpace: 'nowrap',
        }}
      >
        {current.label.toUpperCase()}
      </div>
    </a>
  );
}
