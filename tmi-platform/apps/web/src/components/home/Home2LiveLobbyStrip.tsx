"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TMILiveMediaWidget from "@/components/media/TMILiveMediaWidget";

// ─── Simulated live lobby data (replaced by real useLiveSync in prod) ─────────

const LIVE_LOBBIES = [
  { id: "lv-001", performerId: "kreach-001",   performerName: "Kreach",       genre: "Hip Hop",  roomId: "R-101", accentColor: "#FF2DAA", viewers: 312,  isLive: true },
  { id: "lv-002", performerId: "nova-wave-02",  performerName: "Nova Wave",    genre: "R&B",      roomId: "R-204", accentColor: "#00FFFF", viewers: 188,  isLive: true },
  { id: "lv-003", performerId: "djspiral-007",  performerName: "DJ Spiral",    genre: "Electronic",roomId: "R-312",accentColor: "#AA2DFF", viewers: 441,  isLive: true },
  { id: "lv-004", performerId: "soulfix-003",   performerName: "Soul Fix",     genre: "Soul",     roomId: "R-099", accentColor: "#FFD700", viewers: 97,   isLive: true },
  { id: "lv-005", performerId: "blazefront-08", performerName: "Blaze Front",  genre: "Trap",     roomId: "R-418", accentColor: "#FF6B35", viewers: 267,  isLive: true },
  { id: "lv-006", performerId: "lyrix-queen",   performerName: "Lyrix Queen",  genre: "Pop",      roomId: "R-511", accentColor: "#00FF88", viewers: 524,  isLive: true },
];

const ROTATE_INTERVAL_MS = 7000;
const VISIBLE_COUNT = 4;

export default function Home2LiveLobbyStrip() {
  const [startIdx, setStartIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  const advance = useCallback(() => {
    setDirection(1);
    setStartIdx((i) => (i + 1) % LIVE_LOBBIES.length);
  }, []);

  useEffect(() => {
    const t = setInterval(advance, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [advance]);

  // Grab VISIBLE_COUNT lobbies starting at startIdx (wrap around)
  const visible = Array.from({ length: VISIBLE_COUNT }, (_, i) =>
    LIVE_LOBBIES[(startIdx + i) % LIVE_LOBBIES.length]!
  );

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF2DAA", display: "inline-block", boxShadow: "0 0 8px #FF2DAA" }}
          />
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA", textTransform: "uppercase" }}>
            Live Now — {LIVE_LOBBIES.length} Rooms Open
          </span>
        </div>
        <Link href="/live" style={{ textDecoration: "none", fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
          ALL ROOMS →
        </Link>
      </div>

      {/* Live windows grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
        // Responsive: 2 cols on mobile
      }}>
        <style>{`
          @media (max-width: 767px) {
            [data-home2-live-grid] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}</style>
        <AnimatePresence mode="popLayout">
          {visible.map((lobby, i) => (
            <motion.div
              key={`${lobby.id}-${startIdx}`}
              layout
              initial={{ opacity: 0, scale: 0.9, x: direction * 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: -direction * 20 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
              data-home2-live-grid
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${lobby.accentColor}44`,
                position: "relative",
                aspectRatio: "16/10",
                background: `linear-gradient(145deg, ${lobby.accentColor}18, rgba(5,5,16,0.9))`,
              }}
            >
              <Link href={`/live/rooms/${lobby.roomId}`} style={{ display: "block", height: "100%", textDecoration: "none" }}>
                <TMILiveMediaWidget
                  performerId={lobby.performerId}
                  performerName={lobby.performerName}
                  roomId={lobby.roomId}
                  isLive={lobby.isLive}
                  accentColor={lobby.accentColor}
                  genre={lobby.genre}
                  liveViewerCount={lobby.viewers}
                  variant="homepage"
                  size="full"
                  showOverlay
                />
              </Link>
              {/* Genre tag */}
              <div style={{
                position: "absolute", top: 8, left: 8,
                background: lobby.accentColor,
                color: lobby.accentColor === "#FFD700" || lobby.accentColor === "#00FFFF" ? "#000" : "#fff",
                fontSize: 7, fontWeight: 900, letterSpacing: "0.1em",
                borderRadius: 4, padding: "2px 6px", textTransform: "uppercase",
                pointerEvents: "none",
              }}>
                {lobby.genre}
              </div>
              {/* Viewer count */}
              <div style={{
                position: "absolute", bottom: 8, right: 8,
                fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.75)",
                background: "rgba(0,0,0,0.55)", borderRadius: 4, padding: "2px 6px",
                pointerEvents: "none",
              }}>
                👁 {lobby.viewers.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Rotation dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
        {LIVE_LOBBIES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setDirection(i > startIdx ? 1 : -1); setStartIdx(i); }}
            style={{
              width: i === startIdx % LIVE_LOBBIES.length ? 18 : 6, height: 6,
              borderRadius: 999,
              background: i === startIdx % LIVE_LOBBIES.length ? "#FF2DAA" : "rgba(255,255,255,0.2)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}
