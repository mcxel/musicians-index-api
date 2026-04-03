"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const LIVE_ROOMS = [
  { name: "Monday Night Stage", href: "/rooms/monday-stage", status: "LIVE", viewers: 3200, genre: "Hip-Hop / R&B", host: "Gregory Marcel", color: "#FF2DAA" },
  { name: "Cypher Arena", href: "/rooms/cypher", status: "LIVE", viewers: 1840, genre: "Freestyle / Battle", host: "Julius", color: "#00FFFF" },
  { name: "World Dance Party", href: "/rooms/world-dance-party", status: "LIVE", viewers: 2847, genre: "Dance / EDM", host: "DJ Sentinel", color: "#AA2DFF" },
  { name: "Dirty Dozens", href: "/rooms/dirty-dozens", status: "LIVE", viewers: 912, genre: "Roast Battles", host: "Julius", color: "#FFD700" },
  { name: "Monthly Idol", href: "/rooms/monthly-idol", status: "LIVE", viewers: 5841, genre: "Talent Competition", host: "Gregory Marcel", color: "#FF9500" },
  { name: "Mini Cypher", href: "/rooms/mini-cypher", status: "OPEN", viewers: 447, genre: "Open Mic / 1v1", host: "Auto", color: "#00FF88" },
];

const UPCOMING_ROOMS = [
  { name: "World Premiere", href: "/rooms/world-premiere", status: "SOON", countdown: "4h 22m", genre: "Album Drop" },
  { name: "World Concert", href: "/rooms/world-concert", status: "SOON", countdown: "Tomorrow 8PM", genre: "Full Concert" },
  { name: "New Release Drop", href: "/rooms/new-release", status: "SOON", countdown: "2h 10m", genre: "New Music" },
];

export default function LobbyPage() {
  const [filter, setFilter] = useState<"ALL" | "LIVE" | "UPCOMING">("ALL");

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "40px 32px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>PLATFORM LOBBY</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, letterSpacing: 4, margin: 0, lineHeight: 1 }}>
                  CHOOSE YOUR ROOM
                </h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  {LIVE_ROOMS.filter(r => r.status === "LIVE").length} rooms live now · {LIVE_ROOMS.reduce((a, r) => a + r.viewers, 0).toLocaleString()} watching
                </p>
              </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 8, paddingBottom: 20 }}>
              {(["ALL", "LIVE", "UPCOMING"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "6px 18px", borderRadius: 20, cursor: "pointer",
                  background: filter === f ? "rgba(0,255,255,0.15)" : "transparent",
                  border: `1px solid ${filter === f ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                  color: filter === f ? "#00FFFF" : "#666", fontSize: 10, fontWeight: 700, letterSpacing: 2,
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: "32px 32px" }}>

            {/* Live rooms */}
            {(filter === "ALL" || filter === "LIVE") && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 20 }}>
                  🔴 LIVE ROOMS
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {LIVE_ROOMS.map(room => (
                    <motion.div key={room.name} whileHover={{ y: -3 }}>
                      <Link href={room.href} style={{ textDecoration: "none" }}>
                        <div style={{
                          background: `${room.color}06`, border: `1px solid ${room.color}20`,
                          borderRadius: 14, padding: 22, position: "relative",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <motion.div
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ repeat: Infinity, duration: 1.2 }}
                              style={{
                                background: room.status === "LIVE" ? "rgba(255,45,170,0.15)" : "rgba(0,255,136,0.15)",
                                border: `1px solid ${room.status === "LIVE" ? "#FF2DAA" : "#00FF88"}`,
                                borderRadius: 20, padding: "3px 10px",
                                fontSize: 7, fontWeight: 900, letterSpacing: 2,
                                color: room.status === "LIVE" ? "#FF2DAA" : "#00FF88",
                              }}
                            >{room.status}</motion.div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 16, fontWeight: 900, color: room.color }}>{room.viewers.toLocaleString()}</div>
                              <div style={{ fontSize: 7, letterSpacing: 2, color: "#666" }}>WATCHING</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "#fff" }}>{room.name}</div>
                          <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>{room.genre}</div>
                          <div style={{ fontSize: 10, color: room.color, fontWeight: 600 }}>Hosted by {room.host}</div>
                          <div style={{
                            marginTop: 14, padding: "8px 16px", borderRadius: 20,
                            background: `${room.color}12`, border: `1px solid ${room.color}30`,
                            color: room.color, fontSize: 10, fontWeight: 700, letterSpacing: 2, textAlign: "center",
                          }}>ENTER ROOM →</div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming rooms */}
            {(filter === "ALL" || filter === "UPCOMING") && (
              <div>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 20 }}>
                  ⏳ UPCOMING ROOMS
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {UPCOMING_ROOMS.map(room => (
                    <motion.div key={room.name} whileHover={{ y: -2 }}>
                      <Link href={room.href} style={{ textDecoration: "none" }}>
                        <div style={{
                          background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)",
                          borderRadius: 14, padding: 22,
                        }}>
                          <div style={{
                            display: "inline-block", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)",
                            borderRadius: 20, padding: "3px 10px", fontSize: 7, fontWeight: 900, letterSpacing: 2, color: "#FFD700", marginBottom: 12,
                          }}>SOON</div>
                          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{room.name}</div>
                          <div style={{ fontSize: 10, color: "#888", marginBottom: 10 }}>{room.genre}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD700" }}>⏱ {room.countdown}</div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
