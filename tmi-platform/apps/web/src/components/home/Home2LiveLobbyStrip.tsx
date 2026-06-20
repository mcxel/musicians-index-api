"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import TMILiveMediaWidget from "@/components/media/TMILiveMediaWidget";
import { LobbyEntryFlow, type UniversalRoom } from "@/components/room/UniversalLobbyEntry";
import { useLiveSync } from "@/lib/media/useLiveSync";
import type { LiveFeedItem } from "@/components/billboard/TMIBillboardLiveWall";

const ROTATE_INTERVAL_MS = 7000;
const VISIBLE_COUNT = 4;

type LobbyItem = LiveFeedItem;

function lobbyToRoom(lobby: LobbyItem): UniversalRoom {
  return {
    id: lobby.roomId,
    title: lobby.performerName,
    genre: lobby.genre,
    viewers: lobby.viewers,
    status: lobby.isLive ? 'live' : 'upcoming',
    access: 'free',
    accentColor: lobby.accentColor,
    roomRoute: `/live/rooms/${lobby.roomId}?from=lobby-wall`,
    venueIndex: 0,
    shape: 'hex',
  };
}

export default function Home2LiveLobbyStrip() {
  const { feed } = useLiveSync();
  const liveLobbies = feed.filter((f) => f.isLive);
  const [startIdx, setStartIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [pending, setPending] = useState<UniversalRoom | null>(null);

  const advance = useCallback(() => {
    setDirection(1);
    setStartIdx((i) => (liveLobbies.length > 0 ? (i + 1) % liveLobbies.length : 0));
  }, [liveLobbies.length]);

  useEffect(() => {
    if (liveLobbies.length === 0) return;
    const t = setInterval(advance, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [advance, liveLobbies.length]);

  if (liveLobbies.length === 0) return null;

  // Grab VISIBLE_COUNT lobbies starting at startIdx (wrap around)
  const visible = Array.from({ length: Math.min(VISIBLE_COUNT, liveLobbies.length) }, (_, i) =>
    liveLobbies[(startIdx + i) % liveLobbies.length]!
  );

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px" }}>
      {pending && <LobbyEntryFlow room={pending} onClose={() => setPending(null)} />}
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF2DAA", display: "inline-block", boxShadow: "0 0 8px #FF2DAA" }}
          />
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA", textTransform: "uppercase" }}>
            Live Now — {liveLobbies.length} Rooms Open
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
                cursor: "pointer",
              }}
              onClick={() => setPending(lobbyToRoom(lobby))}
            >
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
        {liveLobbies.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setDirection(i > startIdx ? 1 : -1); setStartIdx(i); }}
            style={{
              width: i === startIdx % liveLobbies.length ? 18 : 6, height: 6,
              borderRadius: 999,
              background: i === startIdx % liveLobbies.length ? "#FF2DAA" : "rgba(255,255,255,0.2)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}
