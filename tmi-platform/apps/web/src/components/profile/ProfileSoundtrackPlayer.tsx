"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ProfileSoundtrackConfig } from "@/lib/profile/PublicProfileStyleEngine";

interface ProfileSoundtrackPlayerProps {
  soundtrack?: ProfileSoundtrackConfig;
  ownerName: string;
  ownerSlug: string;
  accentColor?: string;
  isOwner?: boolean;
  onEditSoundtrack?: () => void;
}

export default function ProfileSoundtrackPlayer({
  soundtrack,
  ownerName,
  ownerSlug,
  accentColor = "#00FFFF",
  isOwner = false,
  onEditSoundtrack,
}: ProfileSoundtrackPlayerProps) {
  // If soundtrack is disabled or OFF, render nothing (optional music law)
  if (!soundtrack || !soundtrack.enabled || soundtrack.type === "OFF") {
    return null;
  }

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(soundtrack.defaultVolume ?? 0.8);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const title = soundtrack.title || "Profile Theme";
  const artist = soundtrack.artist || ownerName;
  const audioSrc = soundtrack.audioUrl || "/sounds/magazine/page-turn.mp3";
  const cover = soundtrack.coverUrl || "/tmi-curated/mag-20.jpg";

  // Attempt autoplay on mount if configured
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    if (soundtrack.autoplay) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch(() => {
            // Autoplay blocked by browser policy
            setAutoplayBlocked(true);
            setIsPlaying(false);
          });
      }
    }

    return () => {
      audio.pause();
    };
  }, [soundtrack.autoplay, audioSrc]);

  // Track scroll position to show sticky mini player
  useEffect(() => {
    function handleScroll() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // When the main player card scrolls above the viewport, show sticky mini-bar
      if (rect.bottom < 60) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handlePlayToggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          setAutoplayBlocked(true);
        });
    }
  }

  function handleMuteToggle() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc}
        loop={soundtrack.loop ?? true}
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
      />

      {/* Main in-page profile soundtrack module */}
      <div
        ref={containerRef}
        data-testid="profile-soundtrack-player"
        style={{
          margin: "0 0 24px 0",
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(16, 8, 32, 0.95), rgba(6, 4, 18, 0.98))",
          border: `1.5px solid ${accentColor}44`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 15px ${accentColor}18`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top banner / header */}
        <div
          style={{
            padding: "8px 16px",
            background: `linear-gradient(90deg, ${accentColor}18, transparent)`,
            borderBottom: `1px solid ${accentColor}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12 }}>🎵</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.18em",
                color: accentColor,
                textTransform: "uppercase",
              }}
            >
              PROFILE SOUNDTRACK · {soundtrack.type}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isPlaying && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 12 }}>
                {[6, 12, 8, 14, 10].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      width: 2.5,
                      height: h,
                      background: accentColor,
                      borderRadius: 1,
                      animation: "pulse 0.8s infinite alternate",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {isOwner && onEditSoundtrack && (
              <button
                type="button"
                onClick={onEditSoundtrack}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontSize: 8,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                EDIT MUSIC
              </button>
            )}
          </div>
        </div>

        {/* Autoplay blocked prompt (Autoplay Reality Law) */}
        {autoplayBlocked && !isPlaying ? (
          <div
            style={{
              padding: "16px 20px",
              background: `linear-gradient(135deg, ${accentColor}22, rgba(255,45,170,0.15))`,
              borderBottom: `1px solid ${accentColor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>
                This profile has a custom soundtrack
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                Browser audio policy requires a quick click to start.
              </div>
            </div>

            <button
              type="button"
              data-testid="play-profile-music-prompt-btn"
              onClick={handlePlayToggle}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: accentColor,
                color: "#050510",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.1em",
                border: "none",
                cursor: "pointer",
                boxShadow: `0 0 16px ${accentColor}66`,
              }}
            >
              ▶ PLAY {ownerName.toUpperCase()}&apos;S PROFILE MUSIC
            </button>
          </div>
        ) : null}

        {/* Player Controls Body */}
        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Cover Art */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              overflow: "hidden",
              border: `1.5px solid ${accentColor}66`,
              flexShrink: 0,
              background: "#000",
              boxShadow: `0 0 12px ${accentColor}33`,
            }}
          >
            <img
              src={cover}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Track Info */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
              {title}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              {artist} · <span style={{ color: accentColor }}>Official Profile Audio</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              data-testid="profile-soundtrack-play-toggle"
              onClick={handlePlayToggle}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: isPlaying ? accentColor : "rgba(255,255,255,0.1)",
                border: `1.5px solid ${accentColor}`,
                color: isPlaying ? "#050510" : "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 16,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: isPlaying ? `0 0 16px ${accentColor}66` : "none",
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              type="button"
              onClick={handleMuteToggle}
              style={{
                background: "none",
                border: "none",
                color: isMuted ? "#FF2DAA" : "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{
                width: 70,
                accentColor,
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </div>

      {/* Sticky mini-player when scrolled down the vertical page (Continuous Scroll Law) */}
      {isSticky && (
        <div
          data-testid="profile-soundtrack-sticky-bar"
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: 580,
            zIndex: 1200,
            padding: "8px 16px",
            borderRadius: 30,
            background: "rgba(10, 6, 22, 0.92)",
            backdropFilter: "blur(14px)",
            border: `1.5px solid ${accentColor}55`,
            boxShadow: `0 10px 30px rgba(0,0,0,0.7), 0 0 20px ${accentColor}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <img
              src={cover}
              alt={title}
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{artist}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={handlePlayToggle}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: accentColor,
                color: "#050510",
                border: "none",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              type="button"
              onClick={handleMuteToggle}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 13 }}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
