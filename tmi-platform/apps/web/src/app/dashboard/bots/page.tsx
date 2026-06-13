"use client";
import Link from "next/link";
import { useState } from "react";
import { CURRENT_PHASE, PHASE_1_BOTS, PHASE_1_ACTIVE_ROOMS, PHASE_1_FLAGS } from "@/lib/bots/Phase1LaunchConfig";

type Bot = { id: string; name: string; role: string; status: "active" | "paused" | "idle"; surface: string; desc: string; icon: string; };

const BOT_ROSTER: Bot[] = [
  { id: "welcome-bot",      name: "WelcomeBot",            role: "ONBOARDING",  status: "active", surface: "ALL ROOMS",   icon: "👋", desc: "Greets fans on room entry" },
  { id: "ghost-drip-1",     name: "Ghost Force Alpha",      role: "LIVE_ROOM",   status: "active", surface: "WORLD STAGE", icon: "👻", desc: "Live chat drip — Phase 1 ghost" },
  { id: "ghost-drip-2",     name: "Ghost Force Beta",       role: "LIVE_ROOM",   status: "active", surface: "CYPHER PIT",  icon: "👻", desc: "Live chat drip — Phase 1 ghost" },
  { id: "hype-bot",         name: "HypeBot",               role: "SOCIAL",      status: "active", surface: "BATTLES",     icon: "🔥", desc: "Posts hype to battles + Discord" },
  { id: "tip-notifier",     name: "TipNotifier",           role: "REWARDS",     status: "active", surface: "LIVE ROOMS",  icon: "💸", desc: "DMs artist on tip > $5" },
  { id: "rank-alert",       name: "RankAlert",             role: "ANALYTICS",   status: "paused", surface: "RANKINGS",    icon: "🏆", desc: "Announces top-10 rank changes" },
  { id: "sentinel-home1",   name: "Sentinel Home #1",      role: "SENTINEL",    status: "active", surface: "HOME 1",      icon: "🛡️", desc: "Monitors homepage uptime" },
  { id: "sentinel-home2",   name: "Sentinel Home #2",      role: "SENTINEL",    status: "active", surface: "HOME 2",      icon: "🛡️", desc: "Monitors home/2 performance" },
  { id: "sentinel-admin",   name: "Sentinel Admin",        role: "SENTINEL",    status: "active", surface: "ADMIN",       icon: "🛡️", desc: "Monitors admin panel" },
  { id: "sponsor-bot",      name: "SponsorScout",          role: "SPONSOR",     status: "idle",   surface: "ADVERTISER",  icon: "🤝", desc: "Identifies sponsor opportunities" },
  { id: "content-curator",  name: "ContentCurator",        role: "CONTENT",     status: "active", surface: "MAGAZINE",    icon: "📰", desc: "Rotates magazine article slots" },
  { id: "recovery-bot",     name: "RecoveryBot",           role: "RECOVERY",    status: "active", surface: "ALL",         icon: "🔄", desc: "Restarts failed room sessions" },
  { id: "artist-outreach",  name: "ArtistOutreach",        role: "ONBOARDING",  status: "paused", surface: "SIGNUP",      icon: "📣", desc: "Artist acquisition drip (Phase 2)" },
  { id: "magazine-acq",     name: "MagazineAcquisition",   role: "CONTENT",     status: "paused", surface: "MAGAZINE",    icon: "📰", desc: "Article writer recruitment (Phase 2)" },
  { id: "nft-bot",          name: "NFTMintBot",            role: "REWARDS",     status: "idle",   surface: "NFT LAB",     icon: "🎨", desc: "NFT minting assistant (Phase 2)" },
  { id: "visual-creator",   name: "VisualCreatorBot",      role: "CONTENT",     status: "idle",   surface: "MEDIA",       icon: "🎬", desc: "Generates visual assets on demand" },
];

const ROLE_COLORS: Record<string, string> = {
  SENTINEL: "#FF9500", CONTENT: "#00FFFF", ONBOARDING: "#00FF88",
  SPONSOR: "#FFD700", ANALYTICS: "#AA2DFF", LIVE_ROOM: "#FF2DAA",
  REWARDS: "#FFD700", SOCIAL: "#FF6B35", RECOVERY: "#00FF88",
};

export default function BotsDashboardPage() {
  const [bots, setBots] = useState<Bot[]>(BOT_ROSTER);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "idle">("all");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const toggle = (id: string) => {
    setBots(prev => prev.map(b => {
      if (b.id !== id) return b;
      const next = b.status === "active" ? "paused" : "active";
      showToast(`${b.name} → ${next.toUpperCase()}`);
      return { ...b, status: next };
    }));
  };

  const filtered = filter === "all" ? bots : bots.filter(b => b.status === filter);
  const activeCount = bots.filter(b => b.status === "active").length;
  const pausedCount = bots.filter(b => b.status === "paused").length;
  const idleCount = bots.filter(b => b.status === "idle").length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.9)", borderBottom: "1px solid rgba(255,149,0,0.3)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#FF9500", fontWeight: 800 }}>BOT COMMAND CENTER</div>
          <div style={{ fontSize: 15, fontWeight: 900, marginTop: 1 }}>🤖 Bot Network — Phase 1</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/bots" style={{ fontSize: 10, color: "#FF9500", border: "1px solid rgba(255,149,0,0.3)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>ADMIN BOTS</Link>
          <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← ADMIN</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>

        {/* Phase status */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Launch Phase",   value: CURRENT_PHASE.replace("phase-", "Phase ").replace("-controlled", " (Controlled)"), icon: "🚀", color: "#00FF88" },
            { label: "Active Bots",    value: String(activeCount), icon: "✓", color: "#00FF88" },
            { label: "Paused Bots",    value: String(pausedCount), icon: "⏸", color: "#FFD700" },
            { label: "Idle / Queued",  value: String(idleCount), icon: "🕐", color: "#AA2DFF" },
            { label: "Active Rooms",   value: String(PHASE_1_ACTIVE_ROOMS.length), icon: "🏟️", color: "#00FFFF" },
          ].map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: s.label === "Launch Phase" ? 11 : 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Phase config panel */}
        <div style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#00FF88", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 14 }}>PHASE 1 ACTIVATION FLAGS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {[
              { label: "Welcome Bot",         active: PHASE_1_BOTS.welcomeBot },
              { label: "Ghost Force Drip",    active: PHASE_1_BOTS.ghostForceDrip },
              { label: "Silent Moderation",   active: PHASE_1_BOTS.silentModeration },
              { label: "Logging Sentinel",    active: PHASE_1_BOTS.loggingSentinel },
              { label: "Full Bot Swarm",      active: PHASE_1_BOTS.fullBotSwarm },
              { label: "Signup Enabled",      active: PHASE_1_FLAGS.signupEnabled },
              { label: "All Roles Enabled",   active: PHASE_1_FLAGS.allRolesEnabled },
              { label: "Payments Enabled",    active: PHASE_1_FLAGS.paymentsEnabled },
              { label: "Ticket Printing",     active: PHASE_1_FLAGS.ticketPrintingEnabled },
              { label: "NFT Minting",         active: PHASE_1_FLAGS.nftMintingEnabled },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: f.active ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${f.active ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 7 }}>
                <span style={{ fontSize: 12, color: f.active ? "#00FF88" : "rgba(255,255,255,0.25)", fontWeight: 900 }}>{f.active ? "✓" : "✗"}</span>
                <span style={{ fontSize: 11, color: f.active ? "#fff" : "rgba(255,255,255,0.35)" }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Rooms */}
        <div style={{ background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 10 }}>PHASE 1 ACTIVE ROOMS</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PHASE_1_ACTIVE_ROOMS.map(r => (
              <Link key={r} href={`/live/rooms/${r}`} style={{ padding: "7px 16px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#00FFFF", textDecoration: "none" }}>
                🟢 {r}
              </Link>
            ))}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(255,149,0,0.1)", border: "1px solid rgba(255,149,0,0.3)", borderRadius: 8, fontSize: 12, color: "#FF9500" }}>{toast}</div>
        )}

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["all", "active", "paused", "idle"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", background: filter === f ? "#FF9500" : "transparent", color: filter === f ? "#000" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
              {f}
            </button>
          ))}
        </div>

        {/* Bot list */}
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map(b => {
            const roleColor = ROLE_COLORS[b.role] ?? "#888";
            return (
              <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 18px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center" }}>
                <div style={{ fontSize: 24 }}>{b.icon}</div>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{b.name}</span>
                    <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 8px", borderRadius: 10, background: `${roleColor}15`, color: roleColor, letterSpacing: "0.1em" }}>{b.role}</span>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{b.surface}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{b.desc}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: b.status === "active" ? "#00FF88" : b.status === "paused" ? "#FFD700" : "rgba(255,255,255,0.3)", minWidth: 50, textAlign: "right" }}>{b.status.toUpperCase()}</span>
                  <button onClick={() => toggle(b.id)} style={{ padding: "6px 12px", borderRadius: 6, background: "transparent", border: `1px solid ${b.status === "active" ? "rgba(255,215,0,0.3)" : "rgba(0,255,136,0.3)"}`, color: b.status === "active" ? "#FFD700" : "#00FF88", fontSize: 10, cursor: "pointer", fontWeight: 800 }}>
                    {b.status === "active" ? "PAUSE" : "RESUME"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <Link href="/admin/bots" style={{ padding: "10px 20px", borderRadius: 8, background: "#FF9500", color: "#000", fontWeight: 900, fontSize: 12, textDecoration: "none" }}>ADMIN BOT PANEL</Link>
          <Link href="/dashboard/admin" style={{ padding: "10px 16px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>← Back to Admin</Link>
        </div>
      </div>
    </main>
  );
}
