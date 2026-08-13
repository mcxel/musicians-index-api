"use client";

// LEGACY — the default export is a hard `return null` (unreachable content),
// and the real content component (LiveLobbyWallContent) is only reachable
// through a chain of components none of which any app/ route actually
// renders — confirmed 2026-08-12. Its 10 hardcoded stock-photo room cards
// with fake viewer counts/flags/names are real-registry-plumbing dead code,
// not live in production. Superseded by LiveLobbyWallGrid.tsx, the canonical
// full-page Live Lobby Wall. Not deleted in case another concurrent tool has
// plans for it.

import { useEffect, useState } from "react";
import Link from "next/link";
import { PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";
import { getActiveSessions, onSessionsChanged, type LiveSession } from "@/lib/broadcast/GlobalLiveSessionRegistry";

export type LobbyCategory =
  | "LIVE NOW"
  | "BATTLES"
  | "CYPHERS"
  | "CHALLENGES"
  | "GAMES"
  | "LOUNGES"
  | "FAN LOBBIES"
  | "CONCERTS"
  | "COMEDY"
  | "DANCE"
  | "PLAYLISTS";

const CATEGORIES: LobbyCategory[] = [
  "LIVE NOW",
  "BATTLES",
  "CYPHERS",
  "CHALLENGES",
  "GAMES",
  "LOUNGES",
  "FAN LOBBIES",
  "CONCERTS",
  "COMEDY",
  "DANCE",
  "PLAYLISTS",
];

/** Embedded wall — used inside CanonicalBottomDrawerHost (no position:fixed wrapper). */
export function LiveLobbyWallContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<LobbyCategory>("LIVE NOW");
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(() => getActiveSessions());

  useEffect(() => {
    const unsubscribe = onSessionsChanged(setLiveSessions);
    return () => unsubscribe();
  }, []);

  const liveUserIds = new Set(liveSessions.map((s) => s.userId));

  const filteredRoster = PERFORMER_REGISTRY.filter((p) => {
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (category === "LIVE NOW") return liveUserIds.has(p.id);
    if (category === "BATTLES") return p.category.toLowerCase().includes("battle") || p.id.includes("battle");
    if (category === "CYPHERS") return p.category.toLowerCase().includes("cypher") || p.id.includes("cypher");
    if (category === "COMEDY") return p.category.toLowerCase().includes("comedy");
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, minHeight: 0, flex: 1 }}>
      {/* Search */}
      <div style={{ padding: "0 0 10px" }}>
        <input
          type="text"
          placeholder="Search comedy, music, battles, cyphers…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 14px",
            background: "rgba(10,16,38,0.8)",
            border: "1px solid rgba(0,229,255,0.3)",
            borderRadius: 8,
            color: "#fff",
            fontSize: 12,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid ${active ? "#00FFFF" : "rgba(255,255,255,0.12)"}`,
                background: active ? "rgba(0,229,255,0.2)" : "rgba(10,16,38,0.6)",
                color: active ? "#00FFFF" : "rgba(255,255,255,0.7)",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.08em",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          paddingBottom: 8,
        }}
      >
        {filteredRoster.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: 24, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
            {category === "LIVE NOW" ? "No rooms live right now." : `No ${category.toLowerCase()} rooms found.`}
          </div>
        )}
        {filteredRoster.map((item) => {
          const isLive = liveUserIds.has(item.id);
          return (
            <Link
              key={item.id}
              href={item.profileRoute}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(10,16,38,0.85)",
                border: `1px solid ${isLive ? "#E63000" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10,
                overflow: "hidden",
                textDecoration: "none",
              }}
            >
              <div style={{ height: 110, position: "relative", background: "#050815" }}>
                <img src={item.profileImageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {isLive && (
                  <span style={{ position: "absolute", top: 6, left: 6, background: "#E63000", color: "#fff", fontSize: 7, fontWeight: 900, padding: "2px 6px", borderRadius: 4 }}>
                    ● LIVE
                  </span>
                )}
              </div>
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{item.category}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Default export — RETIRED edge floater (T1 Omni).
 * Previously mounted a fixed right-edge vertical tab ("LIVE LOBBY MATRIX" /
 * discovery-wall chrome) from UniversalPlatformShell and lobby pages.
 * That competed with Command Center monitors on phone viewports.
 * Lobby wall content lives in `LiveLobbyWallContent` via CanonicalBottomDrawerHost.
 * Do not remount an edge tab from layout or hub shells.
 */
export default function LiveLobbyDrawer() {
  return null;
}