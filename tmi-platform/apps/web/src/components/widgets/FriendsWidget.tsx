"use client";

import { useState } from "react";

type FriendsTab = "online" | "all" | "requests";

const SEED_FRIENDS = [
  { id: "1", name: "Nova Fan",   status: "online", role: "FAN",      icon: "👤", accent: "#00FF88" },
  { id: "2", name: "CityBeat",   status: "online", role: "ARTIST",   icon: "🎵", accent: "#AA2DFF" },
  { id: "3", name: "Jay Flow",   status: "online", role: "ARTIST",   icon: "🎤", accent: "#FFD700" },
  { id: "4", name: "Aria K",     status: "offline",role: "FAN",      icon: "⭐", accent: "#00FFFF" },
  { id: "5", name: "SoundPush",  status: "offline",role: "PROMOTER", icon: "📢", accent: "#FF6B00" },
];

const SEED_REQUESTS = [
  { id: "r1", name: "Vinyl King", role: "ARTIST", icon: "🎹", accent: "#818cf8" },
];

export default function FriendsWidget() {
  const [tab, setTab] = useState<FriendsTab>("online");

  const online  = SEED_FRIENDS.filter(f => f.status === "online");
  const all     = SEED_FRIENDS;
  const list    = tab === "online" ? online : tab === "all" ? all : [];

  return (
    <div style={{ color: "#fff" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {(["online", "all", "requests"] as FriendsTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 9, fontWeight: 800,
              cursor: "pointer", letterSpacing: "0.1em",
              background: tab === t ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === t ? "rgba(0,255,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: tab === t ? "#00FFFF" : "rgba(255,255,255,0.4)",
            }}
          >
            {t === "online" ? `🟢 ONLINE (${online.length})` : t === "all" ? `ALL (${all.length})` : `REQUESTS (${SEED_REQUESTS.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tab === "requests" ? (
          SEED_REQUESTS.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>No pending requests.</div>
          ) : (
            SEED_REQUESTS.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${r.accent}22`, border: `2px solid ${r.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>{r.role}</div>
                </div>
                <button style={{ padding: "5px 10px", borderRadius: 7, background: "#00FF8820", border: "1px solid #00FF8844", color: "#00FF88", fontSize: 9, fontWeight: 800, cursor: "pointer" }}>✓</button>
                <button style={{ padding: "5px 10px", borderRadius: 7, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", fontSize: 9, fontWeight: 800, cursor: "pointer" }}>✕</button>
              </div>
            ))
          )
        ) : (
          list.map(f => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${f.accent}22`, border: `2px solid ${f.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{f.icon}</div>
                {f.status === "online" && <span style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: "#00FF88", border: "2px solid #06041a" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{f.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>{f.role}</div>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <button title="Message" style={{ padding: "5px 8px", borderRadius: 7, background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00E5FF", fontSize: 12, cursor: "pointer" }}>💬</button>
                <button title="Join live" style={{ padding: "5px 8px", borderRadius: 7, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)", color: "#00FF88", fontSize: 12, cursor: "pointer" }}>▶</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
