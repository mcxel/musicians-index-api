"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy-load the heavy universal player after first interaction
const TMIUniversalPlayer = dynamic(
  () => import("@/components/media/TMIUniversalPlayer"),
  { ssr: false, loading: () => null },
);

// ── Palette ───────────────────────────────────────────────────────────────────
const BG      = "#05060d";
const CYAN    = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD    = "#FFD700";

export type PublicMediaItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  sourceUrl: string;
  thumbnailUrl: string | null;
  durationMs: number | null;
  isLive: boolean;
  createdAt: string;
};

interface ShareLandingClientProps {
  mediaId:   string;
  item:      PublicMediaItem | null;
}

function fmtDuration(ms: number | null): string {
  if (!ms) return "";
  const secs  = Math.floor(ms / 1000);
  const mins  = Math.floor(secs / 60);
  const hrs   = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}:${String(secs % 60).padStart(2, "0")}`;
}

function mediaTypeLabel(type: string, isLive: boolean): string {
  if (isLive) return "🔴 LIVE";
  const MAP: Record<string, string> = {
    song:              "🎵 SONG",
    video:             "🎬 VIDEO",
    interview:         "🎙️ INTERVIEW",
    podcast:           "🎙️ PODCAST",
    performance:       "🎤 PERFORMANCE",
    battle_replay:     "⚔️ BATTLE REPLAY",
    cypher_replay:     "🔄 CYPHER REPLAY",
    concert_recording: "🎪 CONCERT RECORDING",
    broadcast_archive: "📺 BROADCAST ARCHIVE",
  };
  return MAP[type] ?? "▶ MEDIA";
}

function isVideoType(type: string): boolean {
  return [
    "video", "performance", "battle_replay", "cypher_replay",
    "concert_recording", "broadcast_archive", "interview",
  ].includes(type);
}

export default function ShareLandingClient({ mediaId, item }: ShareLandingClientProps) {
  const [playing, setPlaying]         = useState(false);
  const [copied,  setCopied]          = useState(false);
  const [appPrompt, setAppPrompt]     = useState(false);
  const containerRef                  = useRef<HTMLDivElement>(null);

  const shareUrl  = typeof window !== "undefined"
    ? `${window.location.origin}/share/${mediaId}`
    : `https://themusiciansindex.com/share/${mediaId}`;

  // ── Pre-buffer on hover: placeholder for future implementation ───────────
  const handleHeroEnter = () => {
    // Future: could set a preload state or preload the HLS manifest
  };

  // ── Native share / clipboard fallback ─────────────────────────────────────
  const handleShare = async () => {
    if (!item) return;
    const shareData = {
      title: item.title,
      text:  item.description ?? item.title,
      url:   shareUrl,
    };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Deep link: detect installed app ───────────────────────────────────────
  useEffect(() => {
    const detectApp = async () => {
      try {
        const related = await (navigator as any).getInstalledRelatedApps?.();
        if (!related || related.length === 0) setAppPrompt(true);
      } catch {
        // API not available — assume web
      }
    };
    detectApp();
  }, []);

  // ── Not found fallback ─────────────────────────────────────────────────────
  if (!item) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎵</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Media not found or no longer available</div>
        <Link
          href="/"
          style={{
            color: CYAN,
            fontSize: 12,
            textDecoration: "none",
            border: `1px solid ${CYAN}44`,
            borderRadius: 8,
            padding: "8px 20px",
          }}
        >
          Browse TMI →
        </Link>
      </div>
    );
  }

  const isVideo    = isVideoType(item.type);
  const sourceMode = isVideo ? "vod" : "vod";   // Both use <video>; HLS detected by .m3u8 suffix

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* ── NAV BAR ────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(5,6,13,0.97)",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: CYAN,
            textDecoration: "none",
            letterSpacing: "0.12em",
          }}
        >
          TMI
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {appPrompt && (
            <Link
              href="https://themusiciansindex.com/app"
              style={{
                background: `${FUCHSIA}22`,
                border: `1px solid ${FUCHSIA}`,
                borderRadius: 20,
                padding: "5px 14px",
                color: FUCHSIA,
                fontSize: 10,
                fontWeight: 900,
                textDecoration: "none",
                letterSpacing: "0.08em",
              }}
            >
              📱 GET THE APP
            </Link>
          )}
          <Link
            href="/auth"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 11,
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        onMouseEnter={handleHeroEnter}
        onFocus={handleHeroEnter}
        style={{
          position: "relative",
          maxWidth: 960,
          margin: "0 auto",
          padding: "32px 24px 0",
        }}
      >
        {/* Media type badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: item.isLive ? "#E6300022" : `${CYAN}18`,
            border: `1px solid ${item.isLive ? "#E63000" : CYAN}44`,
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 10,
            fontWeight: 900,
            color: item.isLive ? "#E63000" : CYAN,
            letterSpacing: "0.12em",
            marginBottom: 16,
          }}
        >
          {mediaTypeLabel(item.type, item.isLive)}
          {item.durationMs && !item.isLive && (
            <span style={{ opacity: 0.6, marginLeft: 4 }}>{fmtDuration(item.durationMs)}</span>
          )}
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(22px, 5vw, 42px)",
            fontWeight: 900,
            lineHeight: 1.1,
            margin: "0 0 12px",
            background: `linear-gradient(135deg, #fff 60%, ${CYAN})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {item.title}
        </h1>

        {/* Description */}
        {item.description && (
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              margin: "0 0 28px",
              maxWidth: 640,
              lineHeight: 1.6,
            }}
          >
            {item.description}
          </p>
        )}

        {/* ── PLAYER AREA ────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            background: "#03030c",
            borderRadius: 20,
            overflow: "hidden",
            border: `2px solid ${CYAN}33`,
            boxShadow: `0 0 40px ${CYAN}18`,
            aspectRatio: isVideo ? "16/9" : undefined,
            minHeight: isVideo ? undefined : 200,
          }}
        >
          {playing ? (
            /* ── Active Player ── */
            <div style={{ width: "100%", height: isVideo ? "100%" : 200 }}>
              <TMIUniversalPlayer
                src={item.sourceUrl}
                mode={item.sourceUrl.includes(".m3u8") ? "hls" : sourceMode}
                size="fill"
                frameStyle="neon"
                autoplay
                privacy="public"
              />
            </div>
          ) : (
            /* ── Thumbnail / Play Hero ── */
            <button
              onClick={() => setPlaying(true)}
              style={{
                display: "block",
                width: "100%",
                aspectRatio: isVideo ? "16/9" : undefined,
                minHeight: isVideo ? undefined : 200,
                background: item.thumbnailUrl
                  ? `url(${item.thumbnailUrl}) center/cover no-repeat`
                  : `linear-gradient(135deg, #0a0620 0%, #1a0540 100%)`,
                border: "none",
                cursor: "pointer",
                position: "relative",
                padding: 0,
              }}
            >
              {/* Dark gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                }}
              />

              {/* Play button */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: `${CYAN}22`,
                  border: `3px solid ${CYAN}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  boxShadow: `0 0 30px ${CYAN}55`,
                  transition: "transform 0.2s",
                }}
              >
                ▶
              </div>

              {/* Live pulse */}
              {item.isLive && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#E6300099",
                    backdropFilter: "blur(6px)",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#fff",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 0 6px #fff",
                      animation: "pulse 1s infinite",
                    }}
                  />
                  LIVE
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── ACTION BAR ─────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 960,
          margin: "20px auto 0",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Share / Copy */}
        <button
          onClick={handleShare}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: `${CYAN}18`,
            border: `1px solid ${CYAN}44`,
            borderRadius: 10,
            padding: "10px 20px",
            color: CYAN,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.06em",
          }}
        >
          {copied ? "✓ COPIED!" : "🔗 SHARE"}
        </button>

        {/* Social share quick links */}
        {[
          {
            label: "X / Twitter",
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${item.title} on TMI`)}&url=${encodeURIComponent(shareUrl)}`,
            color: "#1DA1F2",
          },
          {
            label: "Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: "#1877F2",
          },
          {
            label: "WhatsApp",
            href: `https://wa.me/?text=${encodeURIComponent(`${item.title} — Listen on TMI: ${shareUrl}`)}`,
            color: "#25D366",
          },
        ].map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: `${s.color}18`,
              border: `1px solid ${s.color}44`,
              borderRadius: 10,
              padding: "10px 16px",
              color: s.color,
              fontSize: 11,
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            {s.label}
          </a>
        ))}

        {/* Copy URL directly */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(shareUrl).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "10px 16px",
            color: "rgba(255,255,255,0.6)",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📋 COPY LINK
        </button>
      </div>

      {/* ── DISCOVER MORE ──────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 960,
          margin: "36px auto 0",
          padding: "0 24px 48px",
        }}
      >
        <div
          style={{
            background: "rgba(10,6,26,0.9)",
            border: `1px solid ${FUCHSIA}33`,
            borderRadius: 20,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: FUCHSIA,
                letterSpacing: "0.15em",
                marginBottom: 4,
              }}
            >
              DISCOVER MORE ON TMI
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              The Musician&apos;s Index — Music · Live Rooms · Battles · Magazine · Rankings
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "🎤 Live Rooms",    href: "/live/lobby" },
              { label: "🏆 Charts",        href: "/home/1-2" },
              { label: "📖 Magazine",      href: "/home/2" },
              { label: "⚔️ Battles",      href: "/home/5" },
              { label: "🎵 Browse Music", href: "/performers" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "8px 16px",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA to sign up */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              Ready to join the network?
            </div>
            <Link
              href="/auth/signup"
              style={{
                background: `linear-gradient(135deg, ${CYAN}22, ${FUCHSIA}22)`,
                border: `2px solid ${CYAN}`,
                borderRadius: 12,
                padding: "10px 24px",
                color: CYAN,
                fontSize: 12,
                fontWeight: 900,
                textDecoration: "none",
                letterSpacing: "0.08em",
              }}
            >
              JOIN TMI FREE →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
