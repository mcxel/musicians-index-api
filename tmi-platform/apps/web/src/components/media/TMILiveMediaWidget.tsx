"use client";

/**
 * TMILiveMediaWidget.tsx
 * The fundamental "Smart Live Surface" for The Musician's Index.
 *
 * Drop at: apps/web/src/components/media/TMILiveMediaWidget.tsx
 *
 * Replace every <img> or static card on:
 *   /home/1, /home/2, /home/3, /home/5
 *   performer profiles, magazine cards, billboard walls, news articles
 *
 * Logic pipeline:
 *   1. Is performer currently live?   → WebRTC stream (via Daily.co room)
 *   2. Not live, has motion poster?   → 5–7s looping WebM/MP4
 *   3. Nothing available?             → Branded gradient + avatar
 *
 * Performance:
 *   - IntersectionObserver: WebRTC only loads when tile is in viewport
 *   - Lazy hydration: off-screen tiles stay as poster/gradient
 *   - Audio: muted by default, hover = preview, click = full audio
 *
 * Audio hover behavior:
 *   - Hover → low volume preview (0.15)
 *   - Click  → full audio route to lobby
 *   - Mobile → tap = toggle audio
 *
 * Usage:
 *   <TMILiveMediaWidget
 *     performerId="kreach-001"
 *     performerName="Kreach"
 *     roomId="R-101"
 *     isLive={true}
 *     motionPosterUrl="/posters/kreach-loop.webm"
 *     accentColor="#06b6d4"
 *     onEnterLobby={() => router.push("/live/rooms/R-101")}
 *   />
 */

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type MouseEvent,
} from "react";
import {
  canActivateStream,
  registerActiveStream,
  releaseActiveStream,
} from "@/lib/media/LiveStateRegistry";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type WidgetVariant = "billboard" | "homepage" | "profile" | "magazine" | "news";
export type WidgetSize = "sm" | "md" | "lg" | "hero" | "full";

export interface TMILiveMediaWidgetProps {
  /* Identity */
  performerId: string;
  performerName: string;
  performerTier?: "free" | "silver" | "gold" | "platinum" | "diamond";
  genre?: string;

  /* Live state */
  isLive?: boolean;
  roomId?: string;               // Daily.co room for WebRTC
  liveViewerCount?: number;

  /* Media fallbacks */
  motionPosterUrl?: string;      // WebM/MP4 loop (5–7 seconds)
  thumbnailUrl?: string;         // Static image fallback
  accentColor?: string;          // Neon border/glow color

  /* Layout */
  variant?: WidgetVariant;
  size?: WidgetSize;
  showOverlay?: boolean;         // Show name/status/viewer overlay
  showAudioButton?: boolean;

  /* Callbacks */
  onEnterLobby?: () => void;
  onFollow?: () => void;
  onTip?: () => void;
  onHover?: () => void;

  className?: string;
}

/* ─── Size map ───────────────────────────────────────────────────────────── */
const SIZE_CLASSES: Record<WidgetSize, string> = {
  sm:   "w-[120px] h-[120px]",
  md:   "w-[180px] h-[180px]",
  lg:   "w-full aspect-video",
  hero: "w-full aspect-[16/9]",
  full: "w-full h-full",
};

/* ─── Tier glow colors ───────────────────────────────────────────────────── */
const TIER_GLOW: Record<string, string> = {
  free:     "rgba(148,163,184,0.4)",
  silver:   "rgba(203,213,225,0.5)",
  gold:     "rgba(251,191,36,0.5)",
  platinum: "rgba(226,232,240,0.5)",
  diamond:  "rgba(56,189,248,0.6)",
};

/* ─── Neon frame animation keyframes ─────────────────────────────────────── */
const KEYFRAMES = `
@keyframes rimPulse {
  0%,100% { box-shadow: 0 0 12px var(--accent), 0 0 24px var(--accent-dim); }
  50%      { box-shadow: 0 0 24px var(--accent), 0 0 48px var(--accent-dim), inset 0 0 12px var(--accent-dim); }
}
@keyframes scanline {
  0%   { background-position: 0 0; }
  100% { background-position: 0 100%; }
}
@keyframes floatTile {
  0%,100% { transform: translateY(0) rotate(var(--tilt)); }
  50%     { transform: translateY(-4px) rotate(var(--tilt)); }
}
@keyframes liveBlip {
  0%,100% { opacity: 1; transform: scale(1); }
  50%     { opacity: 0.5; transform: scale(0.85); }
}
`;

/* ─── Fallback branded gradient ──────────────────────────────────────────── */
function BrandGradient({
  name,
  accentColor,
}: {
  name: string;
  accentColor: string;
}) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 40%, ${accentColor}30 0%, #05050c 70%)`,
      }}
    >
      <span
        className="font-black text-4xl select-none"
        style={{ color: accentColor, textShadow: `0 0 24px ${accentColor}` }}
      >
        {initial}
      </span>
    </div>
  );
}

/* ─── Motion poster (WebM loop) ──────────────────────────────────────────── */
function MotionPoster({
  src,
  thumbnail,
  videoRef,
}: {
  src: string;
  thumbnail?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
}) {
  return (
    <video
      ref={videoRef}
      src={src}
      poster={thumbnail}
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
    />
  );
}

/* ─── Main widget ─────────────────────────────────────────────────────────── */
export default function TMILiveMediaWidget({
  performerId,
  performerName,
  performerTier = "free",
  genre,
  isLive = false,
  roomId,
  liveViewerCount = 0,
  motionPosterUrl,
  thumbnailUrl,
  accentColor,
  variant = "homepage",
  size = "md",
  showOverlay = true,
  showAudioButton = false,
  onEnterLobby,
  onFollow,
  onTip,
  onHover,
  className = "",
}: TMILiveMediaWidgetProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
  const [inViewport,  setInViewport]  = useState(false);
  const [isHovered,   setIsHovered]   = useState(false);
  const [audioOn,     setAudioOn]     = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [expandCard,  setExpandCard]  = useState(false);
  const [streamAllowed, setStreamAllowed] = useState(false);

  const accent = accentColor ?? TIER_GLOW[performerTier] ?? "rgba(6,182,212,0.5)";
  const accentHex = accentColor ?? "#06b6d4";

  /* IntersectionObserver — only load WebRTC for visible tiles */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Stream budget — register/release when entering/leaving viewport */
  useEffect(() => {
    if (!isLive || !inViewport) {
      setStreamAllowed(false);
      releaseActiveStream(performerId);
      return;
    }
    const granted = registerActiveStream(performerId);
    setStreamAllowed(granted);
    return () => releaseActiveStream(performerId);
  }, [isLive, inViewport, performerId]);

  /* Audio: hover = preview (15%), leave = mute, click = full (handled in lobby) */
  function handleMouseEnter() {
    setIsHovered(true);
    onHover?.();
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 0.15;
    }
  }
  function handleMouseLeave() {
    setIsHovered(false);
    if (videoRef.current && !audioOn) {
      videoRef.current.volume = 0;
      videoRef.current.muted = true;
    }
  }

  function handleClick() {
    if (isLive) {
      onEnterLobby?.();
    }
  }

  /* Random subtle tilt per tile (billboard variation) */
  const tilt = variant === "billboard"
    ? `${((performerId.charCodeAt(0) % 7) - 3) * 0.5}deg`
    : "0deg";

  const shouldAnimate = variant !== "magazine" && variant !== "news";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div
        ref={containerRef}
        className={`relative overflow-hidden cursor-pointer select-none ${SIZE_CLASSES[size]} ${className}`}
        style={{
          borderRadius: variant === "billboard" ? "12px" : "16px",
          border: `1.5px solid ${accentHex}${isLive ? "80" : "30"}`,
          "--accent": accentHex,
          "--accent-dim": accentHex + "30",
          "--tilt": tilt,
          animation: isLive && shouldAnimate
            ? `rimPulse 3s ease-in-out infinite, floatTile 6s ease-in-out infinite`
            : shouldAnimate
            ? `floatTile 8s ease-in-out infinite`
            : "none",
          willChange: "transform, box-shadow",
          transition: "transform 0.3s ease",
          transform: isHovered ? "scale(1.04)" : "scale(1)",
        } as React.CSSProperties}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* ── Media layer ── */}
        <div className="absolute inset-0">
          {isLive && streamAllowed && roomId ? (
            /* WebRTC placeholder — swap for DailyIframe when room is ready */
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${accentHex}20 0%, #000 80%)`,
              }}
            >
              {/* Replace this div with <TMIVideoRoom> for real WebRTC */}
              <div className="text-white/10 text-5xl">🎤</div>
            </div>
          ) : isLive && !streamAllowed && motionPosterUrl && inViewport ? (
            /* At stream cap — show motion poster instead of WebRTC */
            <MotionPoster src={motionPosterUrl} thumbnail={thumbnailUrl} videoRef={videoRef} />
          ) : motionPosterUrl && inViewport ? (
            <MotionPoster src={motionPosterUrl} thumbnail={thumbnailUrl} videoRef={videoRef} />
          ) : thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={performerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <BrandGradient name={performerName} accentColor={accentHex} />
          )}
        </div>

        {/* ── 1980s scanline overlay (very subtle) ── */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
            opacity: 0.6,
          }}
        />

        {/* ── Neon corner accents ── */}
        {isLive && (
          <>
            <div
              className="absolute top-0 left-0 w-4 h-4 pointer-events-none z-[2]"
              style={{
                borderTop: `2px solid ${accentHex}`,
                borderLeft: `2px solid ${accentHex}`,
                filter: `drop-shadow(0 0 4px ${accentHex})`,
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none z-[2]"
              style={{
                borderBottom: `2px solid ${accentHex}`,
                borderRight: `2px solid ${accentHex}`,
                filter: `drop-shadow(0 0 4px ${accentHex})`,
              }}
            />
          </>
        )}

        {/* ── LIVE badge ── */}
        {isLive && (
          <div
            className="absolute top-2 left-2 z-[10] flex items-center gap-1 px-1.5 py-0.5 rounded"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#ef4444",
                animation: "liveBlip 1.2s ease-in-out infinite",
              }}
            />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">LIVE</span>
          </div>
        )}

        {/* ── Bottom overlay bar ── */}
        {showOverlay && (
          <div
            className="absolute bottom-0 inset-x-0 z-[10] px-2.5 py-2"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
            }}
          >
            <p
              className="text-[10px] font-black text-white truncate leading-tight"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              {performerName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {genre && (
                <span className="text-[8px] text-white/50">{genre}</span>
              )}
              {isLive && liveViewerCount > 0 && (
                <span className="text-[8px] text-white/40">
                  {liveViewerCount.toLocaleString()} watching
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Hover action panel ── */}
        {isHovered && isLive && (
          <div
            className="absolute inset-0 z-[20] flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onEnterLobby?.(); }}
              className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-black transition-all active:scale-95"
              style={{ background: accentHex }}
            >
              Join Live
            </button>
            {onTip && (
              <button
                onClick={(e) => { e.stopPropagation(); onTip(); }}
                className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider text-black bg-yellow-400 active:scale-95"
              >
                Tip
              </button>
            )}
          </div>
        )}

        {/* ── Not live indicator ── */}
        {!isLive && variant === "billboard" && (
          <div
            className="absolute top-2 right-2 z-[10] px-1.5 py-0.5 rounded text-[7px] font-black text-white/40 uppercase"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            OFFLINE
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HOMEPAGE WIDGET GRID
   Drop inside /home/2, /home/3, /home/5 to replace static image sections
   ───────────────────────────────────────────────────────────────────────── */
export function HomepageLiveWidgetGrid({
  performers,
  onEnterLobby,
}: {
  performers: Omit<TMILiveMediaWidgetProps, "variant" | "size">[];
  onEnterLobby: (roomId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
      {performers.map((p) => (
        <TMILiveMediaWidget
          key={p.performerId}
          {...p}
          variant="homepage"
          size="lg"
          onEnterLobby={() => p.roomId && onEnterLobby(p.roomId)}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PERFORMER PROFILE HERO WIDGET
   Replaces the static header image on performer profile pages
   ───────────────────────────────────────────────────────────────────────── */
export function PerformerHeroWidget({
  performerId,
  performerName,
  isLive,
  roomId,
  motionPosterUrl,
  accentColor,
  genre,
  liveViewerCount,
  onEnterLobby,
}: Omit<TMILiveMediaWidgetProps, "variant" | "size">) {
  return (
    <TMILiveMediaWidget
      performerId={performerId}
      performerName={performerName}
      isLive={isLive}
      roomId={roomId}
      motionPosterUrl={motionPosterUrl}
      accentColor={accentColor}
      genre={genre}
      liveViewerCount={liveViewerCount}
      variant="profile"
      size="hero"
      showOverlay
      showAudioButton
      onEnterLobby={onEnterLobby}
    />
  );
}
