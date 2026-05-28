"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import MultiRoomVideoMonitor from "@/components/media/MultiRoomVideoMonitor";
import HomeFeedObserver from "@/components/admin/HomeFeedObserver";
import StripeObservatoryCard from "@/components/admin/StripeObservatoryCard";
import BetaLaunchScoreboard from "@/components/admin/BetaLaunchScoreboard";

// ─── Seed data (replace with live API when available) ────────────────────────

const MOCK_BOTS: { id: string; name: string; role: string; status: string; room: string }[] = [];

const TOP10_MOCK: { rank: number; name: string; genre: string; pts: number; trend: string }[] = [];

const ROUTE_HEALTH: { route: string; status: string; ms: number }[] = [];

const SPONSOR_ROTATIONS: { slot: string; sponsor: string; impressions: number; ctr: string }[] = [];

const ERROR_METRICS = [
  { label: "Routes",  value: "0", tone: "green" },
  { label: "Queues",  value: "0", tone: "green" },
  { label: "Bots",    value: "0", tone: "green" },
  { label: "Visuals", value: "0", tone: "green" },
  { label: "Motion",  value: "0", tone: "green" },
  { label: "Sockets", value: "0", tone: "green" },
];

// ─── Tab config ───────────────────────────────────────────────────────────────

type Tab = "scoreboard" | "live" | "bots" | "sponsors" | "routes" | "errors" | "safety";

type LiveSessionHealth = {
  userId: string;
  displayName: string;
  title?: string;
  roomId: string;
  stageState: "pre-show" | "live" | "intermission" | "post-show";
  streamHealth: "excellent" | "good" | "degraded" | "critical" | "unknown";
  viewerCount: number;
  tipTotal: number;
  bitrateKbps: number;
  droppedFramesPct: number;
  rttMs: number;
  audioOk: boolean;
  lastPingAt: number;
};

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: "scoreboard", label: "SCOREBOARD", color: "#AA2DFF" },
  { id: "live",       label: "LIVE",       color: "#00C896" },
  { id: "bots",       label: "BOTS",       color: "#00C8FF" },
  { id: "sponsors",   label: "SPONSORS",   color: "#FFD700" },
  { id: "routes",     label: "ROUTES",     color: "#AA2DFF" },
  { id: "errors",     label: "ERRORS",     color: "#FF2DAA" },
  { id: "safety",     label: "SAFETY",     color: "#FF6B00" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    streaming: "#00C896",
    working:   "#00C8FF",
    browsing:  "#FFD700",
    idle:      "#444",
  };
  const color = colors[status] ?? "#444";
  return (
    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}`, marginRight: 8, flexShrink: 0 }} />
  );
}

function toneColor(tone: string) {
  return tone === "green" ? "#00C896" : tone === "yellow" ? "#FFD700" : "#FF2DAA";
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ObservatoryPage() {
  const [tab, setTab]   = useState<Tab>("scoreboard");
  const [tick, setTick] = useState(0);
  const [liveSessions, setLiveSessions] = useState<LiveSessionHealth[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let stopped = false;

    async function loadLiveSessions() {
      try {
        const res = await fetch('/api/live/go', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { sessions?: LiveSessionHealth[] };
        if (!stopped) {
          setLiveSessions(Array.isArray(data.sessions) ? data.sessions : []);
        }
      } catch {
        // Keep observatory resilient; stale values are acceptable on transient errors.
      }
    }

    async function loadUserCount() {
      try {
        const res = await fetch('/api/admin/users/count', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (!stopped) setTotalUsers(data.totalAccounts ?? 0);
        }
      } catch {
        // Fails silently if DB is still syncing
      }
    }

    void loadLiveSessions();
    void loadUserCount();
    const pollId = setInterval(() => {
      void loadLiveSessions();
      void loadUserCount();
    }, 5000);

    return () => {
      stopped = true;
      clearInterval(pollId);
    };
  }, []);

  const streaming  = MOCK_BOTS.filter(b => b.status === "streaming").length;
  const warnRoutes = ROUTE_HEALTH.filter(r => r.status !== "ok").length;
  const activeTab  = TABS.find(t => t.id === tab)!;
  const criticalStreams = liveSessions.filter((s) => s.streamHealth === 'critical').length;

  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter',sans-serif" }}>

      {/* ── Top metrics bar ─────────────────────────────────────────────────── */}
      <div style={{ background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px clamp(16px,4vw,40px)", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", color: "#00C8FF" }}>TMI OBSERVATORY</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { label: "TOTAL ACCOUNTS", value: totalUsers,                              color: "#FFD700" },
            { label: "STREAMING",  value: streaming,                                   color: "#00C896" },
            { label: "LIVE SESSIONS", value: liveSessions.length,                        color: "#00FFFF" },
            { label: "CRITICAL", value: criticalStreams,                                 color: criticalStreams > 0 ? "#FF2DAA" : "#00C896" },
            { label: "BOTS ACTIVE",value: MOCK_BOTS.length,                            color: "#00C8FF" },
            { label: "ROUTE WARNS",value: warnRoutes,                                  color: warnRoutes > 0 ? "#FFD700" : "#00C896" },
            { label: "TOP ARTIST", value: TOP10_MOCK[0].name,                          color: "#FF2DAA" },
            { label: "TICK",       value: `#${tick}`,                                  color: "#444"    },
          ].map(m => (
            <div key={m.label} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: m.color }}>{m.value}</span>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>{m.label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Link href="/admin/live" style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", color: "#00C8FF", textDecoration: "none", padding: "4px 10px", border: "1px solid rgba(0,200,255,0.3)" }}>CONTROL ROOM</Link>
          <Link href="/admin" style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.1)" }}>← ADMIN</Link>
        </div>
      </div>

      {/* ── Tab nav ──────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 clamp(16px,4vw,40px)", display: "flex", gap: 0, overflowX: "auto", WebkitOverflowScrolling: "touch" as never, scrollbarWidth: "none" as never }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "12px 20px",
              fontSize: 9, fontWeight: 900, letterSpacing: "0.2em",
              background: "none", border: "none",
              borderBottom: tab === t.id ? `2px solid ${t.color}` : "2px solid transparent",
              color: tab === t.id ? t.color : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "28px clamp(16px,4vw,40px) 80px" }}>

        {/* ── SCOREBOARD ── */}
        {tab === "scoreboard" && <BetaLaunchScoreboard />}

        {/* ── LIVE ── */}
        {tab === "live" && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#00C896", marginBottom: 20 }}>
              VIDEO COMMAND CENTER
            </div>
            <MultiRoomVideoMonitor
              title="LIVE ROOMS — ALL FEEDS"
              accentColor="#00C896"
            />
            <div style={{ marginTop: 32 }}>
              <HomeFeedObserver title="HOMEPAGE FEED OBSERVER" />
            </div>
            <div style={{ marginTop: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "#00FFFF", marginBottom: 10 }}>
                GLOBAL LIVE SESSION HEALTH
              </div>
              {liveSessions.length === 0 ? (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>No active live sessions.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {liveSessions.map((session) => {
                    const healthColor = session.streamHealth === 'critical'
                      ? '#FF2DAA'
                      : session.streamHealth === 'degraded'
                        ? '#FFD700'
                        : session.streamHealth === 'excellent'
                          ? '#00C896'
                          : '#00C8FF';

                    return (
                      <div key={session.userId} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 12px", background: "rgba(0,0,0,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{session.title ?? session.displayName}</div>
                          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: healthColor }}>{session.streamHealth.toUpperCase()}</div>
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                          <span>Room: {session.roomId}</span>
                          <span>Stage: {session.stageState}</span>
                          <span>Viewers: {session.viewerCount}</span>
                          <span>Tips: ${(session.tipTotal ?? 0).toFixed(2)}</span>
                          <span>Bitrate: {session.bitrateKbps} kbps</span>
                          <span>RTT: {session.rttMs} ms</span>
                          <span>Dropped: {session.droppedFramesPct?.toFixed(1) ?? '0.0'}%</span>
                          <span style={{ color: session.audioOk ? '#00C896' : '#FF2DAA' }}>{session.audioOk ? '🔊 Audio OK' : '🔇 No Audio'}</span>
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Ping: {Math.round((Date.now() - session.lastPingAt) / 1000)}s ago</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ marginTop: 20 }}>
              <StripeObservatoryCard />
            </div>
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {[
                { href: "/admin/live",        label: "BETA CONTROL ROOM", color: "#FF6B00" },
                { href: "/admin/rooms",        label: "ROOM MANAGER",      color: "#00C8FF" },
                { href: "/live/lobby",         label: "ENTER LOBBY",       color: "#00C896" },
                { href: "/admin/launch-gates", label: "LAUNCH GATES",      color: "#AA2DFF" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: "block", padding: "12px 16px", background: `${l.color}08`, border: `1px solid ${l.color}30`, fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: l.color, textDecoration: "none", textAlign: "center" }}>
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── BOTS ── */}
        {tab === "bots" && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#00C8FF", marginBottom: 16 }}>
              LIVE BOT POPULATION FEED · TICK #{tick}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 720 }}>
              {MOCK_BOTS.map(bot => (
                <div key={bot.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <StatusDot status={bot.status} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", minWidth: 90 }}>{bot.name}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", minWidth: 80 }}>{bot.role}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", flex: 1 }}>{bot.room}</span>
                  <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: bot.status === "streaming" ? "#00C896" : bot.status === "working" ? "#00C8FF" : bot.status === "browsing" ? "#FFD700" : "#444" }}>
                    {bot.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 20 }}>
              {[
                { label: "Streaming", color: "#00C896" },
                { label: "Working",   color: "#00C8FF" },
                { label: "Browsing",  color: "#FFD700" },
                { label: "Idle",      color: "#444"    },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                  {s.label}: {MOCK_BOTS.filter(b => b.status === s.label.toLowerCase()).length}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", color: "#FF2DAA", marginBottom: 12 }}>TOP 10 ROTATION PRESSURE</div>
              {TOP10_MOCK.map(a => (
                <div key={a.rank} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 11 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", minWidth: 20 }}>#{a.rank}</span>
                  <span style={{ fontWeight: 700, color: "#fff", flex: 1 }}>{a.name}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{a.genre}</span>
                  <span style={{ color: "#FF2DAA", fontWeight: 900 }}>{a.pts.toLocaleString()}</span>
                  <span style={{ fontSize: 10, color: a.trend === "up" ? "#00C896" : a.trend === "down" ? "#FF2DAA" : "#444" }}>
                    {a.trend === "up" ? "▲" : a.trend === "down" ? "▼" : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SPONSORS ── */}
        {tab === "sponsors" && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#FFD700", marginBottom: 16 }}>
              SPONSOR ROTATION · IMPRESSIONS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 600 }}>
              {SPONSOR_ROTATIONS.map(s => (
                <div key={s.slot} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{s.sponsor}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.slot}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>{s.impressions.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>CTR {s.ctr}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { href: "/admin/sponsors",       label: "MANAGE SPONSORS" },
                { href: "/admin/stripe-audit",   label: "STRIPE AUDIT"    },
                { href: "/hub/advertiser",        label: "ADVERTISER HUB"  },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ padding: "8px 16px", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textDecoration: "none" }}>
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── ROUTES ── */}
        {tab === "routes" && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#AA2DFF", marginBottom: 16 }}>
              ROUTE HEALTH
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 480 }}>
              {ROUTE_HEALTH.map(r => (
                <div key={r.route} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", background: "rgba(255,255,255,0.02)", border: `1px solid ${r.status === "ok" ? "rgba(255,255,255,0.06)" : "rgba(255,215,0,0.25)"}` }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.status === "ok" ? "#00C896" : "#FFD700", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.7)", flex: 1 }}>{r.route}</span>
                  <span style={{ fontSize: 10, color: r.ms > 150 ? "#FFD700" : "rgba(255,255,255,0.35)" }}>{r.ms}ms</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <Link href="/admin/route-health" style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", color: "#AA2DFF", textDecoration: "none", padding: "8px 16px", border: "1px solid rgba(170,45,255,0.3)" }}>
                FULL ROUTE HEALTH PANEL →
              </Link>
            </div>
          </div>
        )}

        {/* ── ERRORS ── */}
        {tab === "errors" && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA", marginBottom: 16 }}>
              ERROR INTELLIGENCE
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 24 }}>
              {ERROR_METRICS.map(m => (
                <div key={m.label} style={{ padding: "14px 16px", background: `${toneColor(m.tone)}08`, border: `1px solid ${toneColor(m.tone)}22` }}>
                  <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 20, color: toneColor(m.tone) }}>{m.value}</div>
                  <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { href: "/admin/errors",       label: "FULL ERROR PANEL"    },
                { href: "/admin/diagnostics",  label: "DIAGNOSTICS"         },
                { href: "/admin/logs",         label: "LOGS"                },
                { href: "/admin/launch-gates", label: "LAUNCH GATES CHECK"  },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ padding: "8px 14px", border: "1px solid rgba(255,45,170,0.25)", color: "#FF2DAA", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textDecoration: "none" }}>
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── SAFETY ── */}
        {tab === "safety" && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#FF6B00", marginBottom: 16 }}>
              SAFETY &amp; COMPLIANCE
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10, marginBottom: 24 }}>
              {[
                { href: "/admin/safety",         label: "SAFETY MONITOR",       desc: "Violations, age gates, access blocks", color: "#FF6B00" },
                { href: "/admin/moderation",      label: "MODERATION",           desc: "Content review queue",                 color: "#FF2DAA" },
                { href: "/admin/minor-safety",    label: "MINOR SAFETY",         desc: "Under-18 protections",                 color: "#FFD700" },
                { href: "/admin/security",        label: "SECURITY",             desc: "Auth, sessions, flags",                color: "#AA2DFF" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: "block", padding: "16px", background: `${l.color}06`, border: `1px solid ${l.color}25`, textDecoration: "none" }}>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: l.color, marginBottom: 4 }}>{l.label} →</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{l.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
