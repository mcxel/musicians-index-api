"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLiveSync } from "@/lib/media/useLiveSync";
import TMILiveMediaWidget from "@/components/media/TMILiveMediaWidget";
import type { LiveFeedItem, LobbyGenre } from "@/components/billboard/TMIBillboardLiveWall";

// ─── Floating particle layer (CSS-only, no rAF) ───────────────────────────────

function ParticleLayer({ accent }: { accent: string }) {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 7.3 + 5) % 98}%`,
            top: `${(i * 9.1 + 8) % 96}%`,
            width: i % 3 === 0 ? 4 : 2,
            height: i % 3 === 0 ? 4 : 2,
            borderRadius: "50%",
            background: i % 4 === 0 ? accent : `${accent}44`,
            opacity: 0.28 + (i % 4) * 0.09,
            animation: `ds-float ${7 + (i % 5)}s ease-in-out ${(i * 0.65) % 3}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes ds-float {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(-22px) scale(1.5); }
        }
      `}</style>
    </div>
  );
}

// ─── Per-tile overlay: badge + name gradient ──────────────────────────────────

function TileOverlay({ item, accent }: { item: LiveFeedItem; accent: string }) {
  return (
    <>
      <span style={{
        position: "absolute", top: 7, left: 7, zIndex: 10,
        padding: "2px 6px", borderRadius: 4,
        background: item.isLive ? "#FF2DAA" : "rgba(0,0,0,0.65)",
        color: "#fff", fontSize: 8, fontWeight: 900,
        letterSpacing: "0.16em", textTransform: "uppercase",
        fontFamily: "var(--font-tmi-orbitron,'Orbitron',sans-serif)",
        boxShadow: item.isLive ? "0 0 7px #FF2DAA88" : "none",
      }}>
        {item.isLive ? "LIVE" : "OFFLINE"}
      </span>
      {item.isLive && (
        <span style={{
          position: "absolute", top: 7, right: 7, zIndex: 10,
          fontSize: 8, color: accent, fontWeight: 800,
          fontFamily: "var(--font-tmi-orbitron,'Orbitron',sans-serif)",
          letterSpacing: "0.08em",
          textShadow: `0 0 6px ${accent}`,
        }}>
          {item.viewers.toLocaleString()}
        </span>
      )}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
        background: "linear-gradient(0deg, rgba(4,4,14,0.94) 0%, rgba(4,4,14,0.55) 55%, transparent 100%)",
        padding: "24px 8px 8px",
      }}>
        <div style={{
          fontFamily: "var(--font-tmi-bebas,'Bebas Neue',sans-serif)",
          fontSize: 13, color: "#fff", letterSpacing: "0.06em",
          lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          marginBottom: 1,
        }}>
          {item.performerName}
        </div>
        <div style={{
          fontSize: 9, color: item.isLive ? accent : "rgba(255,255,255,0.35)",
          fontFamily: "var(--font-tmi-rajdhani,'Rajdhani',sans-serif)",
          letterSpacing: "0.1em", fontWeight: 700,
        }}>
          {item.genre.toUpperCase()}
        </div>
      </div>
    </>
  );
}

// ─── Single tile ──────────────────────────────────────────────────────────────

function DiscoveryTile({
  item, accent, onEnter, entering, height, size,
}: {
  item: LiveFeedItem;
  accent: string;
  onEnter: (roomId: string) => void;
  entering: string | null;
  height: number;
  size: "hero" | "lg" | "md" | "sm";
}) {
  const isEntering = entering === item.roomId;

  return (
    <motion.div
      animate={isEntering ? { scale: 1.07, opacity: 0 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.26 }}
      onClick={() => onEnter(item.roomId)}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: "relative",
        cursor: "pointer",
        borderRadius: 10,
        overflow: "hidden",
        height,
        border: `1px solid ${item.isLive ? accent + "50" : "rgba(255,255,255,0.07)"}`,
        boxShadow: item.isLive ? `0 0 20px ${accent}1a, 0 4px 16px rgba(0,0,0,0.5)` : "0 2px 8px rgba(0,0,0,0.4)",
        flexShrink: 0,
        opacity: item.isLive ? 1 : 0.7,
      }}
    >
      <TMILiveMediaWidget
        performerId={item.performerId}
        performerName={item.performerName}
        performerTier={item.performerTier}
        genre={item.genre}
        isLive={item.isLive}
        roomId={item.roomId}
        liveViewerCount={item.viewers}
        accentColor={accent}
        variant="homepage"
        size={size}
        showOverlay={false}
        onEnterLobby={() => onEnter(item.roomId)}
      />
      <TileOverlay item={item} accent={accent} />
    </motion.div>
  );
}

// ─── Main surface ─────────────────────────────────────────────────────────────

type LiveDiscoverySurfaceProps = {
  title: string;
  subtitle?: string;
  genres: LobbyGenre[];
  accent: string;
  backHref?: string;
};

export default function LiveDiscoverySurface({
  title,
  subtitle,
  genres,
  accent,
  backHref = "/home/1",
}: LiveDiscoverySurfaceProps) {
  const router = useRouter();
  const { feed } = useLiveSync();
  const [entering, setEntering] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  const handleEnter = useCallback((roomId: string) => {
    setEntering(roomId);
    setTimeout(() => router.push(`/live/rooms/${roomId}?from=lobby-wall`), 300);
  }, [router]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sort: genre-matching live first, then genre-matching offline, then rest
  const primary = feed
    .filter(f => genres.includes(f.genre))
    .sort((a, b) => (b.viewers * 2 + b.tips * 3 + b.activityLevel) - (a.viewers * 2 + a.tips * 3 + a.activityLevel));
  const fallback = feed
    .filter(f => !genres.includes(f.genre))
    .sort((a, b) => b.viewers - a.viewers);

  const ranked = [...primary, ...fallback].slice(0, 12);
  const hero = ranked[0] ?? null;
  const mediums = ranked.slice(1, 3);
  const discoveries = ranked.slice(3, 9);

  const liveCount = feed.filter(f => f.isLive && genres.includes(f.genre)).length;

  // Scroll-reactive gradient drift
  const gradX = 20 + (scrollY * 0.06) % 50;
  const gradY = 30 + (scrollY * 0.04) % 40;

  return (
    <div style={{ minHeight: "100svh", background: "#04040e", overflowX: "hidden", position: "relative" }}>

      {/* Scroll-reactive underlay */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(ellipse at ${gradX}% ${gradY}%, ${accent}12 0%, transparent 55%),
                       radial-gradient(ellipse at ${100 - gradX}% ${100 - gradY}%, ${accent}07 0%, transparent 45%)`,
          transition: "background 0.6s ease",
        }}
      />

      {/* Particles */}
      <ParticleLayer accent={accent} />

      <div style={{ position: "relative", zIndex: 1, padding: "16px 14px 80px", maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button
            onClick={() => router.push(backHref)}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
              fontFamily: "var(--font-tmi-orbitron,'Orbitron',sans-serif)",
              padding: "4px 0",
            }}
          >
            ← HOME
          </button>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: "var(--font-tmi-bebas,'Bebas Neue',sans-serif)",
              fontSize: 18, color: "#fff", letterSpacing: "0.08em", lineHeight: 1,
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em",
                marginTop: 2, textTransform: "uppercase",
              }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{
            background: `${accent}22`, border: `1px solid ${accent}55`,
            borderRadius: 6, padding: "4px 10px",
            fontSize: 10, color: accent, fontWeight: 800,
            fontFamily: "var(--font-tmi-orbitron,'Orbitron',sans-serif)",
            letterSpacing: "0.1em",
            boxShadow: liveCount > 0 ? `0 0 8px ${accent}44` : "none",
          }}>
            {liveCount} LIVE
          </div>
        </div>

        {/* Genre badge row */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {genres.map(g => (
            <span key={g} style={{
              padding: "3px 9px", borderRadius: 4,
              background: `${accent}18`, border: `1px solid ${accent}33`,
              fontSize: 9, color: accent, fontWeight: 800,
              letterSpacing: "0.14em", textTransform: "uppercase",
              fontFamily: "var(--font-tmi-orbitron,'Orbitron',sans-serif)",
            }}>
              {g}
            </span>
          ))}
        </div>

        {/* ── Hero tile ── */}
        {hero && (
          <DiscoveryTile
            item={hero}
            accent={accent}
            onEnter={handleEnter}
            entering={entering}
            height={240}
            size="hero"
          />
        )}

        {/* ── Medium row ── */}
        {mediums.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            {mediums.map(item => (
              <DiscoveryTile
                key={item.performerId}
                item={item}
                accent={accent}
                onEnter={handleEnter}
                entering={entering}
                height={160}
                size="lg"
              />
            ))}
          </div>
        )}

        {/* ── Discovery overflow grid ── */}
        {discoveries.length > 0 && (
          <>
            <div style={{
              marginTop: 14, marginBottom: 8,
              fontSize: 8, fontWeight: 900, letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
              fontFamily: "var(--font-tmi-orbitron,'Orbitron',sans-serif)",
            }}>
              DISCOVERY
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {discoveries.map(item => (
                <DiscoveryTile
                  key={item.performerId}
                  item={item}
                  accent={accent}
                  onEnter={handleEnter}
                  entering={entering}
                  height={110}
                  size="md"
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {ranked.length === 0 && (
          <div style={{
            marginTop: 60, textAlign: "center",
            color: "rgba(255,255,255,0.25)", fontSize: 12,
            fontFamily: "var(--font-tmi-rajdhani,'Rajdhani',sans-serif)",
            letterSpacing: "0.1em",
          }}>
            CONNECTING TO LIVE FEED…
          </div>
        )}

        {/* Bottom action */}
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => router.push("/live")}
            style={{
              background: `${accent}22`, border: `1px solid ${accent}66`,
              color: accent, borderRadius: 8, padding: "10px 24px",
              fontSize: 11, fontWeight: 900, letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "var(--font-tmi-bebas,'Bebas Neue',sans-serif)",
              cursor: "pointer",
            }}
          >
            See All Rooms
          </button>
        </div>

      </div>
    </div>
  );
}
