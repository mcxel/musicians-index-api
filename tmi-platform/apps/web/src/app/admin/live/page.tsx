import Link from "next/link";
import type { Metadata } from "next";
import InvitePanel from "@/components/admin/InvitePanel";
import MultiRoomVideoMonitor from "@/components/media/MultiRoomVideoMonitor";
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
import { getFeedbackSummary } from "@/lib/feedback/FeedbackStore";

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
  const livePerformers = roomData.filter((r) => r.performerLive).length;

  // Feedback summary
  const feedback = getFeedbackSummary();
  const trustKillers = feedback.classTotals["trust-killer"];
  const conversionDrags = feedback.classTotals["conversion-drag"];
  const polishCount = feedback.classTotals.polish;
  const queueDepth = feedback.automatedPatchQueueDepth;
  const topIssue = feedback.buckets[0];

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

        {/* ── LAUNCH SCOREBOARD ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 24, border: "1px solid rgba(0,255,255,0.2)", background: "rgba(0,255,255,0.04)", padding: "20px 24px" }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#00FFFF", marginBottom: 14, textTransform: "uppercase" }}>
            Launch Scoreboard — Wave 1 Burn-In
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 10, marginBottom: 14 }}>
            <div style={{ padding: "12px 14px", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.28)" }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: "#FF2DAA", marginBottom: 2, lineHeight: 1 }}>{trustKillers}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Trust Killers</div>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.28)" }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: "#FFD700", marginBottom: 2, lineHeight: 1 }}>{conversionDrags}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Conversion Drag</div>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(0,200,255,0.08)", border: "1px solid rgba(0,200,255,0.28)" }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: "#00C8FF", marginBottom: 2, lineHeight: 1 }}>{polishCount}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Polish Queue</div>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.28)" }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: "#AA2DFF", marginBottom: 2, lineHeight: 1 }}>{queueDepth}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Automated Patch Queue</div>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.28)" }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, color: "#00FF88", marginBottom: 2, lineHeight: 1.15 }}>
                {topIssue ? topIssue.category.replace(/-/g, " ").toUpperCase() : "NONE"}
              </div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Top Active Issue</div>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.28)" }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 16, color: "#FF6B00", marginBottom: 2, lineHeight: 1.15 }}>
                {topIssue?.count ?? 0} REPORTS
              </div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Issue Cluster Pressure</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
            {[
              {
                label: "Auth / Session Stability",
                value: "Monitoring",
                color: "rgba(255,255,255,0.55)",
              },
              {
                label: "Room / Go-Live Success",
                value: livePerformers > 0 ? "Green" : "Watch",
                color: livePerformers > 0 ? "#00FF88" : "#FFD700",
              },
              {
                label: "Stripe Health",
                value: "Green",
                color: "#00FF88",
              },
              {
                label: "Vibe Consistency",
                value: conversionDrags > 0 ? "Watch" : "Green",
                color: conversionDrags > 0 ? "#FFD700" : "#00FF88",
              },
              {
                label: "60s Retention Trend",
                value: "Monitoring",
                color: "rgba(255,255,255,0.55)",
              },
            ].map((gate) => (
              <div key={gate.label} style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "8px 10px" }}>
                <div style={{ fontSize: 7, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 4 }}>{gate.label}</div>
                <div style={{ fontSize: 10, fontWeight: 900, color: gate.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{gate.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BETA CONTROL ROOM ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 36, border: "1px solid rgba(255,107,0,0.25)", background: "rgba(255,107,0,0.04)", padding: "20px 24px" }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#FF6B00", marginBottom: 14, textTransform: "uppercase" }}>
            BETA CONTROL ROOM — LIVE METRICS
          </div>

          {/* 6-metric grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10, marginBottom: 16 }}>
            {[
              {
                label: "Users Present",
                value: totalPresent,
                threshold: totalPresent >= 5 ? "green" : totalPresent > 0 ? "yellow" : "red",
                color: totalPresent >= 5 ? "#00C896" : totalPresent > 0 ? "#FFD700" : "#FF2DAA",
              },
              {
                label: "Live Performers",
                value: livePerformers,
                threshold: livePerformers > 0 ? "green" : totalPresent > 0 ? "red" : "yellow",
                color: livePerformers > 0 ? "#00C896" : totalPresent > 0 ? "#FF2DAA" : "#FFD700",
              },
              {
                label: "Active Rooms",
                value: activeRooms,
                threshold: activeRooms > 0 ? "green" : "yellow",
                color: activeRooms > 0 ? "#00C896" : "#FFD700",
              },
              {
                label: "Phase 1 Bots",
                value: Object.values(PHASE_1_BOTS).filter(Boolean).length,
                threshold: "green",
                color: "#AA2DFF",
              },
              {
                label: "Feedback Reports",
                value: feedback.total,
                threshold: feedback.total > 10 ? "yellow" : "green",
                color: feedback.total > 10 ? "#FFD700" : "#00C8FF",
              },
              {
                label: "Top Issue",
                value: feedback.buckets[0]?.category.replace(/-/g, " ").toUpperCase() ?? "—",
                threshold: "green",
                color: "#FF6B00",
                small: true,
              },
            ].map(m => (
              <div key={m.label} style={{ padding: "12px 14px", background: `${m.color}08`, border: `1px solid ${m.color}22` }}>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: m.small ? 13 : 22, color: m.color, marginBottom: 2, lineHeight: 1 }}>{m.value}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Threshold legend */}
          <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            {[
              { dot: "#00C896", label: "Healthy" },
              { dot: "#FFD700", label: "Watch" },
              { dot: "#FF2DAA", label: "Action needed — jump in now" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: l.dot, display: "inline-block", boxShadow: `0 0 4px ${l.dot}` }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Critical alert */}
          {totalPresent > 0 && livePerformers === 0 && (
            <div style={{ padding: "10px 14px", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.3)", fontSize: 11, color: "#FF2DAA", fontWeight: 700 }}>
              ⚠ EMPTY STAGE — {totalPresent} user{totalPresent > 1 ? "s" : ""} present, no performer live. Jump in now.
            </div>
          )}

          {/* Top feedback issues */}
          {feedback.buckets.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>TOP REPORTED ISSUES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {feedback.buckets.slice(0, 4).map(b => (
                  <div key={b.category} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ minWidth: 24, fontWeight: 900, color: b.count >= 5 ? "#FF2DAA" : b.count >= 3 ? "#FFD700" : "#00C8FF" }}>{b.count}×</span>
                    <span style={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 9 }}>{b.category.replace(/-/g, " ")}</span>
                    {b.lastMessage && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>&ldquo;{b.lastMessage.slice(0, 60)}&rdquo;</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
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

        {/* Multi-room video command center */}
        <div style={{ marginBottom: 40 }}>
          <MultiRoomVideoMonitor title="VIDEO COMMAND CENTER" accentColor="#00FFFF" />
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
