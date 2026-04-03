"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const NEW_RELEASES = [
  {
    id: 1, title: "Crown Up", artist: "NeonVoice_X", genre: "Hip-Hop", type: "SINGLE",
    droppedAt: "2 hrs ago", plays: 4812, price: "$1.29", cover: "🎵",
  },
  {
    id: 2, title: "Cypher Season Vol. 3", artist: "Julius & The Crew", genre: "Freestyle", type: "EP",
    droppedAt: "5 hrs ago", plays: 2241, price: "$4.99", cover: "🎤",
  },
  {
    id: 3, title: "Laser Dreams", artist: "LaserFlow", genre: "EDM", type: "SINGLE",
    droppedAt: "8 hrs ago", plays: 1820, price: "$1.29", cover: "🌟",
  },
  {
    id: 4, title: "Midnight Soul Tape", artist: "MidnightMelody", genre: "R&B", type: "MIXTAPE",
    droppedAt: "12 hrs ago", plays: 3102, price: "FREE", cover: "🌙",
  },
  {
    id: 5, title: "Trap Atlas", artist: "CrownSeeker", genre: "Trap", type: "ALBUM",
    droppedAt: "1 day ago", plays: 7440, price: "$9.99", cover: "🗺️",
  },
  {
    id: 6, title: "World Dance Anthem", artist: "DJ Sentinel", genre: "Dance", type: "SINGLE",
    droppedAt: "2 days ago", plays: 12002, price: "$1.29", cover: "🕺",
  },
];

export default function NewReleasePage() {
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "40px 32px 0", borderBottom: "1px solid rgba(0,255,255,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <Link href="/rooms" style={{ color: "#00FFFF", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#00FFFF", fontWeight: 800 }}>FRESH DROPS</div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  NEW RELEASE DROP
                </h1>
              </div>
            </div>
            <div style={{ display: "flex", gap: 32, paddingBottom: 20 }}>
              {[
                { label: "SINGLES TODAY", val: "14", col: "#00FFFF" },
                { label: "EPs TODAY", val: "3", col: "#AA2DFF" },
                { label: "ALBUMS TODAY", val: "1", col: "#FFD700" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Release list */}
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {NEW_RELEASES.map((r) => (
                <motion.div key={r.id} whileHover={{ y: -3 }}
                  style={{
                    background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.12)",
                    borderRadius: 14, padding: 20,
                  }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 10,
                      background: "rgba(0,255,255,0.1)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 26, flexShrink: 0,
                    }}>{r.cover}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 8, letterSpacing: 2, color: "#00FFFF", fontWeight: 700, marginBottom: 3 }}>{r.type}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{r.artist}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 10, color: "#888" }}>{r.genre}</span>
                    <span style={{ fontSize: 10, color: "#666" }}>{r.droppedAt}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>▶ {r.plays.toLocaleString()}</span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <motion.button whileTap={{ scale: 0.94 }}
                      onClick={() => setPlayingId(playingId === r.id ? null : r.id)}
                      style={{
                        flex: 1, padding: "8px 0", borderRadius: 20,
                        background: playingId === r.id ? "rgba(0,255,255,0.2)" : "rgba(0,255,255,0.07)",
                        border: `1px solid ${playingId === r.id ? "#00FFFF" : "rgba(0,255,255,0.2)"}`,
                        color: "#00FFFF", fontSize: 10, fontWeight: 700, cursor: "pointer",
                      }}>
                      {playingId === r.id ? "⏸ PAUSE" : "▶ PLAY"}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.94 }} style={{
                      flex: 1, padding: "8px 0", borderRadius: 20,
                      background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.25)",
                      color: "#FFD700", fontSize: 10, fontWeight: 700, cursor: "pointer",
                    }}>
                      {r.price === "FREE" ? "FREE DL" : `BUY ${r.price}`}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
