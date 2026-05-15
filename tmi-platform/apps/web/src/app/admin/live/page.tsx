import Link from "next/link";
import type { Metadata } from "next";
import InvitePanel from "@/components/admin/InvitePanel";
import {
  getPresenceInRoom,
  getFanCountInRoom,
  isPerformerLiveInRoom,
} from "@/lib/rooms/RoomSessionBridge";
import { getSentinelLog } from "@/lib/sentinels/ShadowSentinelDiagnosticRegistry";
import {
  PHASE_1_ACTIVE_ROOMS,
  CURRENT_PHASE,
  PHASE_1_BOTS,
} from "@/lib/bots/Phase1LaunchConfig";

export const metadata: Metadata = { title: "Phase 1 Live Monitor | TMI Admin" };

// Force dynamic so presence data is fresh on every request
export const dynamic = "force-dynamic";

const ROOM_META: Record<string, { name: string; type: string; color: string }> = {
  "world-dance-party": { name: "World Dance Party",  type: "DJ LIVE",  color: "#FF2DAA" },
  "world-concert":     { name: "World Concert",      type: "CONCERT",  color: "#00FFFF" },
  "cypher":            { name: "Cypher Stage",        type: "CYPHER",   color: "#00FF88" },
  "lobby":             { name: "Main Lobby",          type: "LOBBY",    color: "#AA2DFF" },
};

export default function AdminLivePage() {
  // Pull live presence from RoomSessionBridge (in-process, updates in real-time)
  const roomData = PHASE_1_ACTIVE_ROOMS.map((roomId) => {
    const presence = getPresenceInRoom(roomId);
    const fanCount = getFanCountInRoom(roomId);
    const performerLive = isPerformerLiveInRoom(roomId);
    const meta = ROOM_META[roomId] ?? { name: roomId, type: "ROOM", color: "#FFD700" };
    return { roomId, presence, fanCount, performerLive, ...meta };
  });

  const totalPresent = roomData.reduce((sum, r) => sum + r.presence.length, 0);
  const activeRooms = roomData.filter((r) => r.presence.length > 0).length;

  // Pull latest sentinel diagnostics
  const sentinelLog = getSentinelLog().slice(-5).reverse();

  // Phase 1 bot status
  const activeBotCount = Object.values(PHASE_1_BOTS).filter(Boolean).length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← ADMIN
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 20, marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Phase 1 Live Monitor</h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              Controlled onboarding — real presence data · {CURRENT_PHASE}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 8px #00FF88" }} />
            <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 700 }}>LIVE</span>
          </div>
        </div>

        {/* Phase 1 stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Active Rooms",    value: activeRooms,                   color: "#00FF88" },
            { label: "Users Present",   value: totalPresent,                  color: "#00FFFF" },
            { label: "Rooms Monitored", value: PHASE_1_ACTIVE_ROOMS.length,   color: "#FFD700" },
            { label: "Phase 1 Bots",    value: activeBotCount,                color: "#AA2DFF" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}22`, borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Invite panel */}
        <InvitePanel />

        {/* Phase 1 bot manifest */}
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 12 }}>PHASE 1 BOT STATUS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          {(Object.entries(PHASE_1_BOTS) as [string, boolean][]).map(([key, active]) => (
            <div key={key} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 9, fontWeight: 800, letterSpacing: 1,
              background: active ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${active ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.07)"}`,
              color: active ? "#00FF88" : "rgba(255,255,255,0.25)",
            }}>
              {active ? "●" : "○"} {key.replace(/([A-Z])/g, " $1").toUpperCase()}
            </div>
          ))}
        </div>

        {/* Live room presence */}
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 16 }}>LIVE ROOMS — REAL PRESENCE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
          {roomData.map(room => (
            <div key={room.roomId} style={{
              display: "flex", gap: 16, alignItems: "center",
              background: "rgba(255,255,255,0.02)", border: `1px solid ${room.color}18`,
              borderRadius: 12, padding: "16px 20px", flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: room.color, border: `1px solid ${room.color}40`, borderRadius: 4, padding: "3px 8px", flexShrink: 0 }}>
                {room.type}
              </span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{room.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  {room.performerLive ? "🎤 Performer live" : "No performer yet"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>{room.fanCount}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>FANS</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>{room.presence.length}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>TOTAL</div>
                </div>
                <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", alignSelf: "center",
                  color: room.presence.length > 0 ? "#00FF88" : "rgba(255,255,255,0.3)" }}>
                  {room.presence.length > 0 ? "ACTIVE" : "EMPTY"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sentinel log */}
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 12 }}>SENTINEL LOG — LAST 5 CHECKS</div>
        {sentinelLog.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", padding: "16px 0" }}>
            No sentinel events yet — checks fire every 30s once a room has traffic.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sentinelLog.map((entry, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 8, fontSize: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontSize: 9, flexShrink: 0 }}>
                  {new Date(entry.checkedAt).toLocaleTimeString()}
                </span>
                <span style={{ color: "#AA2DFF", flexShrink: 0 }}>{entry.roomId}</span>
                <span style={{ color: entry.audioSync === "healthy" ? "#00FF88" : "#FFD700" }}>
                  audio:{entry.audioSync}
                </span>
                <span style={{ color: entry.chatHealth === "active" ? "#00FF88" : entry.chatHealth === "stale" ? "#FFD700" : "#FF2DAA" }}>
                  chat:{entry.chatHealth}
                </span>
                <span style={{ color: entry.commerceBridge === "active" ? "#00FF88" : "#FF2DAA" }}>
                  commerce:{entry.commerceBridge}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick nav */}
        <div style={{ marginTop: 40, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { href: "/admin", label: "← Admin Home" },
            { href: "/admin/overseer", label: "Overseer Deck" },
            { href: "/rooms/world-dance-party", label: "World Dance Party" },
            { href: "/rooms/world-concert", label: "World Concert" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontSize: 9, fontWeight: 800, letterSpacing: 2,
              color: "rgba(255,255,255,0.4)", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px",
            }}>{label}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
