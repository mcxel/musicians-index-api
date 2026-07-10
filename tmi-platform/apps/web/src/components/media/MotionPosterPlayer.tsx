"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

export interface MotionPosterPlayerProps {
  // Constitutional fallback chain (Rule 2)
  isLive?: boolean;
  liveRoomRoute?: string;
  introVideoUrl?: string;
  fallbackVideoUrl?: string;
  motionPosterUrl?: string;
  staticImageUrl: string;
  alt: string;
  // Display
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  audienceCount?: number;
  showLiveOverlay?: boolean;
  objectFit?: "cover" | "contain" | "fill";
  // Playback mode
  loop?: boolean;        // default false — Play Once → Freeze Frame
  replayOnHover?: boolean; // default true — hover rewinds and replays
}

export default function MotionPosterPlayer({
  isLive = false,
  liveRoomRoute,
  introVideoUrl,
  fallbackVideoUrl,
  motionPosterUrl,
  staticImageUrl,
  alt,
  width = "100%",
  height = "100%",
  style,
  className,
  audienceCount,
  showLiveOverlay = true,
  objectFit = "cover",
  loop = false,
  replayOnHover = true,
}: MotionPosterPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [frozen, setFrozen] = useState(false); // true after video plays through once

  // Autoplay on mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setVideoFailed(true));
  }, []);

  // Freeze on last frame when playback ends
  const handleEnded = useCallback(() => {
    if (!loop) {
      videoRef.current?.pause();
      setFrozen(true);
    }
  }, [loop]);

  // Hover to replay — rewinds to 0 and plays again
  const handleMouseEnter = useCallback(() => {
    if (!replayOnHover || !frozen) return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
    setFrozen(false);
  }, [replayOnHover, frozen]);

  // Constitutional chain: LIVE VIDEO → MOTION POSTER → STATIC IMAGE
  const resolvedVideoUrl = introVideoUrl || fallbackVideoUrl;
  const showVideo = !!resolvedVideoUrl && !videoFailed;
  const showMotionPoster = !showVideo && !!motionPosterUrl;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width,
    height,
    overflow: "hidden",
    display: "block",
    cursor: replayOnHover && frozen && showVideo ? "pointer" : "default",
    ...style,
  };

  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit,
    display: "block",
  };

  return (
    <div
      style={containerStyle}
      className={className}
      onMouseEnter={handleMouseEnter}
    >
      {/* ── Layer 1a: Video — Play Once → Freeze Frame ── */}
      {showVideo && (
        <video
          ref={videoRef}
          src={resolvedVideoUrl}
          autoPlay
          muted
          loop={loop}
          playsInline
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          onEnded={handleEnded}
          style={{
            ...mediaStyle,
            opacity: videoReady ? 1 : 0,
            transition: "opacity 0.28s ease",
          }}
        />
      )}

      {/* ── Layer 1b: Motion poster image — freeze frame or static motion art ── */}
      {showMotionPoster && (
        <img src={motionPosterUrl} alt={alt} style={mediaStyle} />
      )}

      {/* ── Layer 1c: Static image — always rendered, acts as placeholder until video loads ── */}
      <img
        src={staticImageUrl}
        alt={alt}
        style={{
          ...mediaStyle,
          position: showVideo || showMotionPoster ? "absolute" : "relative",
          inset: 0,
          opacity: showVideo || showMotionPoster ? 0 : 1,
          zIndex: showVideo || showMotionPoster ? 0 : 1,
          transition: "opacity 0.28s ease",
        }}
      />

      {/* ── Replay hint — shown when frozen and hover-replay is enabled ── */}
      {frozen && replayOnHover && showVideo && (
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 4,
            background: "rgba(0,0,0,0.6)",
            borderRadius: 4,
            padding: "2px 6px",
            fontSize: 8,
            fontWeight: 800,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.06em",
            pointerEvents: "none",
          }}
        >
          ▶ REPLAY
        </div>
      )}

      {/* ── Layer 2: Live overlay ── */}
      {isLive && showLiveOverlay && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(230,48,0,0.72) 0%, rgba(230,48,0,0.12) 50%, transparent 100%)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              zIndex: 3,
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(230,48,0,0.92)",
              borderRadius: 5,
              padding: "3px 7px",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#fff",
                display: "inline-block",
                animation: "tmi-live-pulse 1.15s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "0.08em",
              }}
            >
              LIVE
              {audienceCount !== undefined
                ? ` · ${audienceCount.toLocaleString()}`
                : ""}
            </span>
          </div>
          {liveRoomRoute && (
            <Link
              href={liveRoomRoute}
              style={{
                position: "absolute",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 3,
                padding: "6px 16px",
                background: "#E63000",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 900,
                color: "#fff",
                textDecoration: "none",
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
                boxShadow: "0 0 18px rgba(230,48,0,0.55)",
              }}
            >
              🔴 JOIN NOW →
            </Link>
          )}
        </>
      )}

      <style>{`
        @keyframes tmi-live-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.55; transform:scale(0.82); }
        }
      `}</style>
    </div>
  );
}
