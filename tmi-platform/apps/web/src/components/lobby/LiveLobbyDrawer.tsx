"use client";

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

export default function LiveLobbyDrawer() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<LobbyCategory>("LIVE NOW");
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(() => getActiveSessions());

  useEffect(() => {
    const unsubscribe = onSessionsChanged(setLiveSessions);
    return () => unsubscribe();
  }, []);

  const liveUserIds = new Set(liveSessions.map((s) => s.userId));

  // Filter performers by category and search query
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
    <div
      style={{
        position: "fixed",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 8000,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
      }}
    >
      {/* Side Trigger Tab */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close live lobby matrix" : "Open live lobby matrix"}
        style={{
          width: 32,
          paddingTop: 32,
          paddingBottom: 32,
          border: "none",
          borderRadius: "12px 0 0 12px",
          background: open
            ? "linear-gradient(180deg, #00FFFF, #050510)"
            : "rgba(10,10,30,0.95)",
          borderLeft: "2px solid #00FFFF",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          writingMode: "vertical-lr",
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.15em",
          color: "#00FFFF",
          gap: 6,
        }}
      >
        <span>LIVE LOBBY MATRIX</span>
      </button>

      {/* Main Visual Discovery Panel */}
      {open && (
        <div
          style={{
            width: "min(480px, 100vw)",
            maxHeight: "85vh",
            background: "rgba(4, 8, 22, 0.98)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(0,229,255,0.4)",
            borderRadius: "0 0 0 16px",
            boxShadow: "-16px 0 50px rgba(0,0,0,0.9)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 16,
          }}
        >
          {/* Header & Global Search Bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                LIVE LOBBY DISCOVERY WALL
              </span>
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer" }}>
                ✕
              </button>
            </div>

            {/* Global Search Input */}
            <input
              type="text"
              placeholder="Search comedy, music, battles, cyphers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(10,16,38,0.8)",
                border: "1px solid rgba(0,229,255,0.3)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
                outline: "none",
              }}
            />
          </div>

          {/* Category Tabs Scroll Bar */}
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 8,
              marginBottom: 12,
              scrollbarWidth: "none",
            }}
          >
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "4px 10px",
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
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Visual Live Video Cards Grid */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {filteredRoster.map((item) => {
              const isLive = liveUserIds.has(item.id);
              return (
                <Link
                  key={item.id}
                  href={item.profileRoute}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "rgba(10,16,38,0.85)",
                    border: `1px solid ${isLive ? "#E63000" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 10,
                    overflow: "hidden",
                    textDecoration: "none",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <div style={{ height: 96, position: "relative", background: "#050815" }}>
                    <img src={item.profileImageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {isLive && (
                      <span style={{ position: "absolute", top: 6, left: 6, background: "#E63000", color: "#fff", fontSize: 7, fontWeight: 900, padding: "2px 6px", borderRadius: 4 }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{item.name}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{item.category}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
