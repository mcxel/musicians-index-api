"use client";

import Link from "next/link";
import BillboardBoard from "./BillboardBoard";
import { buildBillboardFrames } from "@/lib/homepage/tmiHomepageBillboardBridge";
import type { BillboardSlot } from "./BillboardBoard";

const LIVE_VENUES = [
  { id: "v1", name: "World Stage", type: "THEATER", capacity: 5000, watching: 12400, status: "ACTIVE", acts: ["Wavetek", "FlowMaster"], href: "/live/world", color: "#FF2DAA" },
  { id: "v2", name: "Cypher Arena", type: "ARENA", capacity: 800, watching: 3200, status: "ACTIVE", acts: ["Cypher S3 · Hip-Hop"], href: "/live/cypher", color: "#AA2DFF" },
  { id: "v3", name: "Battle Ring", type: "ARENA", capacity: 400, watching: 1800, status: "ACTIVE", acts: ["Krypt vs Neon MC"], href: "/live/battles", color: "#FFD700" },
  { id: "v4", name: "Bar Stage", type: "BAR_LOUNGE", capacity: 200, watching: 440, status: "ACTIVE", acts: ["Open Mic Night"], href: "/room/bar-stage", color: "#00FF88" },
  { id: "v5", name: "Concert Hall 1", type: "THEATER", capacity: 1200, watching: 0, status: "PRESHOW", acts: ["Neon Vibe · 8PM"], href: "/live/concert-1", color: "#00FFFF" },
];

const BILLBOARD_SLOTS: BillboardSlot[] = buildBillboardFrames().map((f, i) => ({
  id: `billboard-${i}`,
  label: f.title,
  sublabel: f.lane.replace(/-/g, " ").toUpperCase(),
  href: f.route,
  color: ["#FF2DAA", "#00FFFF", "#FFD700", "#AA2DFF", "#00FF88", "#FF2DAA"][i] ?? "#00FFFF",
  badge: "LIVE",
  rank: i + 1,
}));

const ROOM_GRID = [
  { id: "r1", name: "Zuri Session", slug: "zuri", type: "CLUB", watching: 892, status: "LIVE", href: "/live/zuri", color: "#00FF88" },
  { id: "r2", name: "Dirty Dozens E04", slug: "dd4", type: "ARENA", watching: 1241, status: "LIVE", href: "/dirty-dozens/dd4", color: "#FFD700" },
  { id: "r3", name: "Fifth Ward Live", slug: "wavetek", type: "CLUB", watching: 3102, status: "LIVE", href: "/live/wavetek", color: "#FF2DAA" },
  { id: "r4", name: "Open Rehearsal", slug: "rehearsal-1", type: "REHEARSAL", watching: 24, status: "UPCOMING", href: "/rooms/rehearsal", color: "#AA2DFF" },
];

export default function Home4Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 20px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 8, color: "#00FFFF", fontWeight: 900, letterSpacing: "0.2em", marginBottom: 4 }}>HOME 4 · LIVE WORLD</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>Live Venues & Rooms</h2>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Every venue. Every room. Every performance happening right now.</p>
        </div>
        <Link href="/live" style={{ textDecoration: "none", padding: "8px 16px", background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.35)", borderRadius: 8, fontSize: 10, fontWeight: 800, color: "#FF2DAA" }}>
          ALL LIVE ROOMS
        </Link>
      </div>

      {/* Venue Cards */}
      <div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>TMI VENUES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {LIVE_VENUES.map(v => (
            <Link key={v.id} href={v.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: `linear-gradient(135deg, ${v.color}08, rgba(0,0,0,0.5))`,
                border: `1px solid ${v.color}${v.status === "ACTIVE" ? "35" : "15"}`,
                borderRadius: 12,
                padding: "16px",
                transition: "all 0.25s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{v.type}</span>
                  <span style={{
                    fontSize: 7, fontWeight: 900, color: v.status === "ACTIVE" ? "#00FF88" : "#FFD700",
                    border: `1px solid ${v.status === "ACTIVE" ? "#00FF8850" : "#FFD70050"}`,
                    borderRadius: 3, padding: "2px 6px",
                    animation: v.status === "ACTIVE" ? "pulse 2s ease-in-out infinite" : "none",
                  }}>{v.status}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{v.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                  {v.acts.join(" · ")}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: v.color, fontWeight: 700 }}>{v.watching > 0 ? `${v.watching.toLocaleString()} watching` : "Starting soon"}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>cap {v.capacity.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Room Grid + Billboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
        {/* Room Grid */}
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 10 }}>ACTIVE ROOMS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {ROOM_GRID.map(r => (
              <Link key={r.id} href={r.href} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${r.color}20`,
                  borderRadius: 10,
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 8, color: r.color, fontWeight: 700 }}>{r.type}</span>
                    <span style={{ fontSize: 7, fontWeight: 900, color: r.status === "LIVE" ? "#FF2DAA" : "#FFD700", border: `1px solid ${r.status === "LIVE" ? "#FF2DAA50" : "#FFD70050"}`, borderRadius: 3, padding: "1px 5px" }}>{r.status}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: r.color, fontWeight: 700 }}>{r.watching > 0 ? `${r.watching.toLocaleString()} watching` : "Upcoming"}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Billboard Board */}
        <BillboardBoard slots={BILLBOARD_SLOTS} title="BILLBOARD BOARD" variant="vertical" accentColor="#00FFFF" />
      </div>
    </div>
  );
}
