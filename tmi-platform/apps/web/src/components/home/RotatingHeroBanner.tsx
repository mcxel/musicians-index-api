'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export interface HeroBannerSlide {
  src: string;
  label: string;
  href: string;
}

// Curated from real uploaded assets in public/banners/ — only categories
// with an actual banner image are listed here (Rule 20).
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
 * Electric Lightning Shock & Dual-Buffered Rotating Billboard Banner
 */
export default function RotatingHeroBanner({
  slides,
  intervalMs = 9000,
  side,
  priority = false,
}: Readonly<RotatingHeroBannerProps>) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Two flanking strip indices — rotate independently
  const [leftIdx, setLeftIdx] = useState(() => (slides.length > 1 ? 1 % slides.length : 0));
  const [rightIdx, setRightIdx] = useState(() => (slides.length > 2 ? 2 % slides.length : 0));

  const changeSlide = useCallback((newIdx: number) => {
    if (newIdx === index) return;
    setPrevIndex(index);
    setIndex(newIdx);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 950);
  }, [index]);

  // Navigate manually
  const nav = useCallback(
    (delta: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = (index + delta + slides.length) % slides.length;
      changeSlide(target);
      setIsPaused(true);
      if (resumeRef.current) clearTimeout(resumeRef.current);
      resumeRef.current = setTimeout(() => setIsPaused(false), 4000);
    },
    [index, slides.length, changeSlide],
  );

  useEffect(() => () => { if (resumeRef.current) clearTimeout(resumeRef.current); }, []);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % slides.length;
        setPrevIndex(i);
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 950);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs, isPaused]);

  // Flanking strip rotation
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(
      () => setLeftIdx((i) => (i + 1) % slides.length),
      Math.round(intervalMs * 0.65),
    );
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

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
  const prevCenter = slides[prevIndex]!;

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
        border: '2px solid rgba(0,229,255,0.6)',
        boxShadow: '0 0 28px rgba(0,229,255,0.35), 0 0 12px rgba(170,45,255,0.25) inset',
        background: '#03030c',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── High-voltage Electric Shock & Showering Lightning Strike-Down Keyframes ── */}
      <style jsx global>{`
        @keyframes showerStrikeDown {
          0% { opacity: 0; clip-path: inset(0 0 100% 0); filter: brightness(2) drop-shadow(0 0 30px #00FFFF); }
          30% { opacity: 1; clip-path: inset(0 0 50% 0); filter: brightness(2.5) drop-shadow(0 0 50px #FFD700); }
          70% { opacity: 0.95; clip-path: inset(0 0 0 0); filter: brightness(1.8) drop-shadow(0 0 30px #FF2DAA); }
          100% { opacity: 0; clip-path: inset(0 0 0 0); filter: brightness(1); }
        }
        @keyframes lightningStrike {
          0% { opacity: 0; transform: scale(0.95); }
          15% { opacity: 1; transform: scale(1.02); }
          30% { opacity: 0.4; }
          45% { opacity: 0.95; }
          100% { opacity: 0; transform: scale(1); }
        }
        @keyframes plasmaPulse {
          0% { filter: drop-shadow(0 0 4px #00FFFF); }
          50% { filter: drop-shadow(0 0 20px #FFD700); }
          100% { filter: drop-shadow(0 0 4px #FF2DAA); }
        }
        @keyframes sparkRain {
          0% { transform: translateY(-20px); opacity: 1; }
          100% { transform: translateY(320px); opacity: 0; }
        }
        @media (max-width: 640px) {
          .h1-banner-flank-left, .h1-banner-flank-right, .h1-banner-divider {
            display: none !important;
          }
          .h1-banner-center {
            flex: 1 1 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* ── Showering Lightning Strike-Down Transition Flash Overlay ── */}
      {isTransitioning && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          animation: 'showerStrikeDown 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          background: 'radial-gradient(circle at 50% 30%, rgba(0,229,255,0.45) 0%, rgba(255,215,0,0.3) 40%, rgba(170,45,255,0.2) 80%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Photorealistic MP4 Lightning Strike Video Underlay */}
          <video
            src="/banners/lightning/204835-925552445_medium Battle of the chapions lightning.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              mixBlendMode: 'screen',
              opacity: 0.85,
            }}
          />

          {/* Showering Lightning Bolt SVG Arcs striking down vertically */}
          <svg viewBox="0 0 300 400" width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, animation: 'plasmaPulse 0.35s infinite' }}>
            {/* Center Main Shower Bolt */}
            <path d="M 150 0 L 130 90 L 170 100 L 110 220 L 160 230 L 100 400" fill="none" stroke="#00FFFF" strokeWidth="5" filter="drop-shadow(0 0 16px #00FFFF)" />
            <path d="M 150 0 L 130 90 L 170 100 L 110 220 L 160 230 L 100 400" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            
            {/* Left Shower Branch */}
            <path d="M 60 0 L 40 80 L 75 90 L 30 200 L 70 210 L 20 380" fill="none" stroke="#FFD700" strokeWidth="3.5" filter="drop-shadow(0 0 12px #FFD700)" />
            
            {/* Right Shower Branch */}
            <path d="M 240 0 L 220 100 L 255 110 L 200 240 L 240 250 L 190 390" fill="none" stroke="#FF2DAA" strokeWidth="3.5" filter="drop-shadow(0 0 12px #FF2DAA)" />
          </svg>

          {/* Raining Particle Sparks Showering Down */}
          {[15, 35, 55, 75, 95, 120, 150, 185, 215, 245, 275].map((x, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: 0,
                left: `${(x / 300) * 100}%`,
                width: 3,
                height: 24,
                borderRadius: 2,
                background: idx % 3 === 0 ? '#00FFFF' : idx % 3 === 1 ? '#FFD700' : '#FF2DAA',
                boxShadow: `0 0 10px ${idx % 3 === 0 ? '#00FFFF' : idx % 3 === 1 ? '#FFD700' : '#FF2DAA'}`,
                animation: `sparkRain 0.6s linear infinite`,
                animationDelay: `${(idx % 5) * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Responsive Triptych Layout: full-width center on mobile ── */}
      <div className="h1-banner-triptych" style={{ display: 'flex', width: '100%', height: '100%' }}>

        {/* Left flank (25% on desktop, hidden on mobile) */}
        <div className="h1-banner-flank-left" style={{ flex: '0 0 25%', position: 'relative', overflow: 'hidden' }}>
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

        {/* Electric divider line */}
        <div className="h1-banner-divider" style={{ width: 1, flexShrink: 0, background: 'linear-gradient(180deg, #00FFFF, #AA2DFF, #FFD700)', zIndex: 2 }} />

        {/* Center (100% on mobile, 50% on desktop) — Dual-buffered zero-gap image stack */}
        <div className="h1-banner-center" style={{ flex: '1', position: 'relative', overflow: 'hidden', background: '#050512' }}>
          
          {/* Previous slide — kept underneath during transition so zero blank gap ever occurs */}
          <div style={{ position: 'absolute', inset: 0, opacity: isTransitioning ? 0.7 : 0, transition: 'opacity 0.9s ease' }}>
            <Image
              src={prevCenter.src}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              style={{ objectFit: 'cover', filter: 'blur(16px) brightness(0.4)', transform: 'scale(1.1)' }}
            />
            <Image
              src={prevCenter.src}
              alt={prevCenter.label}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
            />
          </div>

          {/* Current active slide — smooth cross-fade over previous slide */}
          <div style={{ position: 'absolute', inset: 0, opacity: 1, transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <Image
              src={center.src}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              priority={priority}
              style={{
                objectFit: 'cover',
                filter: 'blur(20px) brightness(0.45) saturate(1.4)',
                transform: 'scale(1.15)',
              }}
            />
            <Image
              src={center.src}
              alt={center.label}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              priority={priority}
              style={{
                objectFit: 'cover',
                objectPosition: 'center top',
                transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isPaused ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          </div>

          {/* Click-through link */}
          <a
            href={center.href}
            aria-label={center.label}
            style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'block' }}
          />

          {/* Bottom label */}
          <div
            style={{
              position: 'absolute',
              bottom: slides.length > 1 ? 18 : 0,
              left: 0, right: 0, zIndex: 6,
              background: 'linear-gradient(to top, rgba(3,3,12,0.95) 0%, rgba(3,3,12,0.6) 50%, transparent 100%)',
              padding: '22px 8px 8px',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: '#FFD700',
              textShadow: '0 0 10px rgba(255,215,0,0.8), 0 1px 6px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center',
            }}>
              {center.label.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Electric divider line */}
        <div className="h1-banner-divider" style={{ width: 1, flexShrink: 0, background: 'linear-gradient(180deg, #FFD700, #AA2DFF, #00FFFF)', zIndex: 2 }} />

        {/* Right flank (25% on desktop, hidden on mobile) */}
        <div className="h1-banner-flank-right" style={{ flex: '0 0 25%', position: 'relative', overflow: 'hidden' }}>
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

      {/* ── Electric top edge shimmer ── */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #00FFFF, #FF2DAA, #FFD700, #00FFFF)',
          pointerEvents: 'none',
          zIndex: 7,
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
            zIndex: 8,
            pointerEvents: 'none',
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              style={{
                width: i === index ? 12 : 4,
                height: 3,
                borderRadius: 2,
                background: i === index ? '#00FFFF' : 'rgba(255,255,255,0.3)',
                boxShadow: i === index ? '0 0 8px #00FFFF' : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Prev / Next navigation arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => nav(-1, e)}
            aria-label="Previous slide"
            style={{
              position: 'absolute',
              left: 5, top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 9,
              background: 'rgba(0,0,0,0.65)',
              border: '1px solid rgba(0,229,255,0.4)',
              borderRadius: '50%',
              width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: '#00FFFF',
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
              opacity: 0.85,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.9)'; e.currentTarget.style.boxShadow = '0 0 12px #00FFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.background = 'rgba(0,0,0,0.65)'; e.currentTarget.style.boxShadow = 'none'; }}
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
              zIndex: 9,
              background: 'rgba(0,0,0,0.65)',
              border: '1px solid rgba(0,229,255,0.4)',
              borderRadius: '50%',
              width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: '#00FFFF',
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
              opacity: 0.85,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.9)'; e.currentTarget.style.boxShadow = '0 0 12px #00FFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.background = 'rgba(0,0,0,0.65)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
