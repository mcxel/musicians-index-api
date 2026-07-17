"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";
import { getActiveSessions, onSessionsChanged, type LiveSession } from "@/lib/broadcast/GlobalLiveSessionRegistry";

type LobbyTab = "fans" | "performers" | "mixed";

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

// Real performer roster only — no hardcoded mock names (Rule 20). Live
// performers sort first. There is no real fan roster/presence source yet,
// so the Fans tab shows an honest empty state rather than inventing names.
function useLobbyRoster() {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(() => getActiveSessions());

  useEffect(() => {
    const unsubscribe = onSessionsChanged(setLiveSessions);
    return () => unsubscribe();
  }, []);

  const liveUserIds = new Set(liveSessions.map((s) => s.userId));

  return PERFORMER_REGISTRY
    .filter((p) => p.profileImageUrl && p.profileImageUrl.trim().length > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.profileImageUrl,
      color: liveUserIds.has(p.id) ? '#E63000' : '#FF2DAA',
      status: liveUserIds.has(p.id) ? 'Live Now' : p.category,
      isLive: liveUserIds.has(p.id),
      href: liveUserIds.has(p.id) && p.liveRoomRoute ? `${p.liveRoomRoute}?from=lobby-drawer` : p.profileRoute,
    }))
    .sort((a, b) => (b.isLive ? 1 : 0) - (a.isLive ? 1 : 0));
}

export default function LiveLobbyDrawer() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<LobbyTab>("mixed");
  const roster = useLobbyRoster();

  const accent = TAB_COLOR[tab];
  const tiles = tab === "fans" ? [] : roster;

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
      {/* Toggle tab — pops the panel open/closed */}
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

      {/* Panel — angular cut corners, glass-panel styling */}
      <div style={{
        width: open ? 240 : 0,
        overflow: "hidden",
        transition: "width 0.3s ease",
        background: "rgba(5,5,20,0.97)",
        borderLeft: open ? `1px solid ${accent}33` : "none",
        boxShadow: open ? `0 0 30px rgba(0,0,0,0.8), -4px 0 20px ${accent}11` : "none",
        clipPath: open ? "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)" : "none",
      }}>
        <div style={{ width: 240, padding: "16px 12px", height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: accent, marginBottom: 10, flexShrink: 0 }}>
            LIVE LOBBY
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12, flexShrink: 0 }}>
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

          {/* Scrollable roster — real accounts, click through to their real profile/room */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1, minHeight: 0, paddingRight: 2 }}>
            {tab === "fans" ? (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px 8px" }}>
                No fans in the lobby yet.
              </div>
            ) : tiles.length === 0 ? (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px 8px" }}>
                No accounts to show yet.
              </div>
            ) : (
              tiles.map((tile) => (
                <Link
                  key={tile.id}
                  href={tile.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 8px",
                    borderRadius: 8,
                    border: `1px solid ${tile.color}22`,
                    background: `${tile.color}06`,
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  {/* Avatar — real photo */}
                  <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: `1.5px solid ${tile.color}55`, flexShrink: 0, background: "rgba(255,255,255,0.05)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tile.image} alt={tile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                </Link>
              ))
            )}
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
              flexShrink: 0,
            }}
          >
            ENTER {TAB_LABEL[tab]} LOBBY →
          </Link>
        </div>
      </div>
    </div>
  );
}
