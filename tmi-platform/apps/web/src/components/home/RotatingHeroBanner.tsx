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

  return (
    <a
      href={current.href}
      aria-label={current.label}
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '100%',
        minHeight: 200,
        borderRadius: 14,
        overflow: 'hidden',
        /*
         * Tight neon frame — hugs the artwork instead of floating around it.
         * Box-shadow provides outer glow; border is the crisp inner line.
         */
        border: '2px solid rgba(170,45,255,0.55)',
        boxShadow: '0 0 28px rgba(170,45,255,0.35), 0 0 8px rgba(170,45,255,0.25) inset',
        textDecoration: 'none',
      }}
    >
      {/* Artwork — fills the FULL card (objectFit cover, no cropping gaps) */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === index ? 1 : 0,
            /*
             * 85% → 100% scale Ken-Burns: artwork starts slightly zoomed
             * and settles to fill, giving a cinematic entrance feel.
             */
            transform: i === index ? 'scale(1.00)' : 'scale(1.06)',
            transition: 'opacity 1.0s ease, transform 9s ease-out',
            willChange: 'opacity, transform',
          }}
        >
          {(i === index || i === (index + 1) % slides.length) && (
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              sizes="(max-width: 900px) 100vw, 240px"
              priority={priority && i === 0}
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
            />
          )}
        </div>
      ))}

      {/*
       * Bottom gradient band — artwork bleeds to the very edges;
       * the label is integrated INTO the poster, not floating above it.
       * No horizontal fade — the full width of the image stays visible.
       */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(4,2,14,0.92) 0%, rgba(4,2,14,0.58) 48%, transparent 100%)',
          padding: '22px 10px 9px',
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

      {/* Thin top-edge neon shimmer — accent only, doesn't eat artwork */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(170,45,255,0.8), transparent)',
          pointerEvents: 'none',
        }}
      />
    </a>
  );
}
