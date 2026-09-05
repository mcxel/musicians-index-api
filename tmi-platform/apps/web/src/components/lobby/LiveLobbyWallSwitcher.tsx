"use client";

import { useState } from "react";
import Link from "next/link";

export type LobbyWallMode = "BATTLES" | "CHALLENGES" | "CYPHERS" | "LOUNGES";

export interface WallPanelItem {
  id: string;
  title: string;
  hostName: string;
  mode: LobbyWallMode;
  viewerCount: number;
  thumbnailColor: string;
  streamUrl?: string;
}

const INITIAL_PANELS: WallPanelItem[] = [
  { id: "p-1", title: "World Rap Championship Round 2", hostName: "MC Nitro", mode: "BATTLES", viewerCount: 1420, thumbnailColor: "#FF2DAA" },
  { id: "p-2", title: "Beatmaker 60-Sec Speed Challenge", hostName: "Producer Beats", mode: "CHALLENGES", viewerCount: 890, thumbnailColor: "#00FFFF" },
  { id: "p-3", title: "Midnight Freestyle Cypher", hostName: "SubZero Crew", mode: "CYPHERS", viewerCount: 2310, thumbnailColor: "#FFD700" },
  { id: "p-4", title: "VIP Producer Lounge", hostName: "Metro Boomin Fan Club", mode: "LOUNGES", viewerCount: 650, thumbnailColor: "#00FF88" },
];

export default function LiveLobbyWallSwitcher() {
  const [panels, setPanels] = useState<WallPanelItem[]>(INITIAL_PANELS);
  const [selectedMode, setSelectedMode] = useState<LobbyWallMode | "ALL">("ALL");

  const setPanelMode = (panelId: string, newMode: LobbyWallMode) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === panelId ? { ...p, mode: newMode } : p))
    );
  };

  const filteredPanels = panels.filter(
    (p) => selectedMode === "ALL" || p.mode === selectedMode
  );

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 20,
        border: "1px solid rgba(0,255,255,0.3)",
        background: "rgba(6,6,20,0.92)",
        backdropFilter: "blur(16px)",
        padding: 20,
        boxShadow: "0 0 32px rgba(0,255,255,0.15)",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* Wall Header & Mode Filter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.16em" }}>
            LIVE LOBBY WALL MULTI-PANEL SWITCHER
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 2 }}>
            Simultaneous Live WebRTC Panels
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["ALL", "BATTLES", "CHALLENGES", "CYPHERS", "LOUNGES"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMode(m)}
              style={{
                padding: "6px 14px",
                borderRadius: 16,
                fontSize: 10,
                fontWeight: 900,
                border: `1px solid ${selectedMode === m ? "#00FFFF" : "rgba(255,255,255,0.15)"}`,
                background: selectedMode === m ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.04)",
                color: selectedMode === m ? "#00FFFF" : "rgba(255,255,255,0.6)",
                cursor: "pointer",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of WebRTC Wall Panels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {filteredPanels.map((panel) => (
          <div
            key={panel.id}
            style={{
              position: "relative",
              borderRadius: 14,
              overflow: "hidden",
              border: `1px solid ${panel.thumbnailColor}66`,
              background: "#000",
              aspectRatio: "16/9",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 12,
              boxShadow: `0 0 20px ${panel.thumbnailColor}22`,
            }}
          >
            {/* Live Indicator Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
              <div
                style={{
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "rgba(0,0,0,0.75)",
                  border: `1px solid ${panel.thumbnailColor}`,
                  color: panel.thumbnailColor,
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                }}
              >
                ● LIVE · {panel.mode}
              </div>

              <div
                style={{
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "rgba(0,0,0,0.75)",
                  color: "#FFD700",
                  fontSize: 9,
                  fontWeight: 800,
                }}
              >
                👁 {panel.viewerCount.toLocaleString()}
              </div>
            </div>

            {/* In-Panel Mode Selector Dropdown */}
            <div style={{ zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                {panel.title}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2, gap: 8 }}>
              {/* Switch Mode In-Panel */}
              <select
                value={panel.mode}
                onChange={(e) => setPanelMode(panel.id, e.target.value as LobbyWallMode)}
                style={{
                  background: "rgba(0,0,0,0.85)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#00FFFF",
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "4px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                <option value="BATTLES">BATTLES</option>
                <option value="CHALLENGES">CHALLENGES</option>
                <option value="CYPHERS">CYPHERS</option>
                <option value="LOUNGES">LOUNGES</option>
              </select>

              <Link
                href={`/live/rooms/${panel.id}`}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  background: panel.thumbnailColor,
                  color: "#050510",
                  fontSize: 9,
                  fontWeight: 900,
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                }}
              >
                ENTER PANEL →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
