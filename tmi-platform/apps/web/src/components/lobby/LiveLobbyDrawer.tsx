"use client";

import { useState } from "react";
import Link from "next/link";

type LobbyTab = "fans" | "performers" | "mixed";

const MINI_TILES = {
  fans: [
    { id: "f1", name: "Nova_Fan",    emoji: "🎧", color: "#00FFFF", status: "Looking for Group" },
    { id: "f2", name: "BeatChaser", emoji: "🔥", color: "#00FFFF", status: "Chatting" },
    { id: "f3", name: "CrownFam",   emoji: "👑", color: "#00FFFF", status: "Looking for Group" },
    { id: "f4", name: "SoulTribe",  emoji: "✨", color: "#00FFFF", status: "Idle" },
  ],
  performers: [
    { id: "p1", name: "Astra Nova",  emoji: "🎤", color: "#FF2DAA", status: "Looking to Collab" },
    { id: "p2", name: "Prism Vex",   emoji: "🎛️", color: "#00FFFF", status: "Looking to Collab" },
    { id: "p3", name: "Zion Freq",   emoji: "👑", color: "#FFD700", status: "Live Now" },
    { id: "p4", name: "Flex King",   emoji: "💃", color: "#AA2DFF", status: "Live Now" },
  ],
  mixed: [
    { id: "m1", name: "Astra Nova",  emoji: "🎤", color: "#FF2DAA", status: "Performer" },
    { id: "m2", name: "Nova_Fan",    emoji: "🎧", color: "#00FFFF", status: "Fan" },
    { id: "m3", name: "Zion Freq",   emoji: "👑", color: "#FFD700", status: "Performer" },
    { id: "m4", name: "CrownFam",    emoji: "👥", color: "#00FFFF", status: "Fan" },
  ],
} as const;

const TAB_COLOR: Record<LobbyTab, string> = {
  fans:       "#00FFFF",
  performers: "#FF2DAA",
  mixed:      "#AA2DFF",
};

const TAB_LABEL: Record<LobbyTab, string> = {
  fans:       "FANS",
  performers: "PERFORMERS",
  mixed:      "MIXED",
};

const TAB_HREF: Record<LobbyTab, string> = {
  fans:       "/live/lobby/fans",
  performers: "/live/lobby/performers",
  mixed:      "/live/rooms",
};

export default function LiveLobbyDrawer() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<LobbyTab>("mixed");
  const [invited, setInvited] = useState<Set<string>>(new Set());

  const accent = TAB_COLOR[tab];
  const tiles = MINI_TILES[tab];

  function invite(id: string) {
    setInvited((prev) => new Set(prev).add(id));
  }

  return (
    <div style={{
      position: "fixed",
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 8000,
      display: "flex",
      flexDirection: "row",
      alignItems: "stretch",
    }}>
      {/* Toggle tab */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close lobby drawer" : "Open lobby drawer"}
        style={{
          width: 28,
          paddingTop: 32,
          paddingBottom: 32,
          border: "none",
          borderRadius: "10px 0 0 10px",
          background: open
            ? `linear-gradient(180deg, ${accent}, #050510)`
            : "rgba(10,10,30,0.9)",
          borderLeft: `2px solid ${accent}44`,
          borderTop: `1px solid ${accent}33`,
          borderBottom: `1px solid ${accent}33`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          writingMode: "vertical-lr",
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.15em",
          color: accent,
          gap: 4,
        }}
      >
        {open ? "▶ CLOSE" : "◀ LOBBY"}
      </button>

      {/* Panel */}
      <div style={{
        width: open ? 240 : 0,
        overflow: "hidden",
        transition: "width 0.3s ease",
        background: "rgba(5,5,20,0.97)",
        borderLeft: open ? `1px solid ${accent}33` : "none",
        boxShadow: open ? `0 0 30px rgba(0,0,0,0.8), -4px 0 20px ${accent}11` : "none",
      }}>
        <div style={{ width: 240, padding: "16px 12px", height: "100%" }}>
          {/* Header */}
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: accent, marginBottom: 10 }}>
            LIVE LOBBY
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {(["fans", "performers", "mixed"] as LobbyTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "4px 0",
                  borderRadius: 5,
                  border: `1px solid ${tab === t ? TAB_COLOR[t] + "66" : "rgba(255,255,255,0.1)"}`,
                  background: tab === t ? `${TAB_COLOR[t]}14` : "transparent",
                  color: tab === t ? TAB_COLOR[t] : "rgba(255,255,255,0.4)",
                  fontSize: 7,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                }}
              >
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>

          {/* Mini tiles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tiles.map((tile) => {
              const sent = invited.has(tile.id);
              return (
                <div key={tile.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 8px",
                  borderRadius: 8,
                  border: `1px solid ${tile.color}22`,
                  background: `${tile.color}06`,
                }}>
                  {/* Avatar */}
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${tile.color}22`, border: `1.5px solid ${tile.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {tile.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tile.name}
                    </div>
                    <div style={{ fontSize: 7, color: tile.color, fontWeight: 700 }}>
                      {tile.status}
                    </div>
                  </div>

                  {/* Invite/Follow button */}
                  <button
                    onClick={() => invite(tile.id)}
                    disabled={sent}
                    style={{
                      padding: "3px 7px",
                      borderRadius: 4,
                      border: sent ? "1px solid rgba(255,255,255,0.15)" : `1px solid ${tile.color}55`,
                      background: sent ? "rgba(255,255,255,0.05)" : `${tile.color}14`,
                      color: sent ? "rgba(255,255,255,0.3)" : tile.color,
                      fontSize: 7,
                      fontWeight: 900,
                      cursor: sent ? "default" : "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {sent ? "✓" : "+"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Jump to full lobby */}
          <Link
            href={TAB_HREF[tab]}
            style={{
              display: "block",
              marginTop: 14,
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${accent}55`,
              background: `${accent}12`,
              color: accent,
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            ENTER {TAB_LABEL[tab]} LOBBY →
          </Link>
        </div>
      </div>
    </div>
  );
}
