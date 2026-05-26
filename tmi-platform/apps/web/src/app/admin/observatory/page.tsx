"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import MultiRoomVideoMonitor from "@/components/media/MultiRoomVideoMonitor";
import HomeFeedObserver from "@/components/admin/HomeFeedObserver";

// ─── Seed data (replace with live API when available) ────────────────────────

const MOCK_BOTS = [
  { id: "b001", name: "Fan-Aria",  role: "fan",        status: "streaming", room: "Cypher Arena"      },
  { id: "b002", name: "Fan-Dex",   role: "fan",        status: "browsing",  room: "Home 2"            },
  { id: "b003", name: "Art-Nova",  role: "artist",     status: "streaming", room: "Live Stage 1"      },
  { id: "b004", name: "Art-Rex",   role: "artist",     status: "working",   room: "Dashboard"         },
  { id: "b005", name: "Sp-Zane",   role: "sponsor",    status: "browsing",  room: "Marketplace"       },
  { id: "b006", name: "Fan-Kira",  role: "fan",        status: "streaming", room: "Battle Ring"       },
  { id: "b007", name: "Fan-Leo",   role: "fan",        status: "idle",      room: "Home 3"            },
  { id: "b008", name: "Art-Mox",   role: "artist",     status: "streaming", room: "World Stage"       },
  { id: "b009", name: "Adv-Rena",  role: "advertiser", status: "working",   room: "Campaign Builder"  },
  { id: "b010", name: "Fan-Oryn",  role: "fan",        status: "browsing",  room: "Charts"            },
];

const TOP10_MOCK = [
  { rank: 1, name: "Nova Kane",  genre: "Hip Hop", pts: 14200, trend: "up"   },
  { rank: 2, name: "Ari Volt",   genre: "R&B",     pts: 13800, trend: "same" },
  { rank: 3, name: "Rhyme Lane", genre: "Hip Hop", pts: 12400, trend: "up"   },
  { rank: 4, name: "Echo Vee",   genre: "Pop",     pts: 11900, trend: "down" },
  { rank: 5, name: "Lex Royal",  genre: "EDM",     pts: 11200, trend: "up"   },
];

const ROUTE_HEALTH = [
  { route: "/home/1",       status: "ok",   ms: 42  },
  { route: "/home/2",       status: "ok",   ms: 38  },
  { route: "/home/3",       status: "ok",   ms: 55  },
  { route: "/home/4",       status: "ok",   ms: 51  },
  { route: "/home/5",       status: "ok",   ms: 48  },
  { route: "/rooms/random", status: "ok",   ms: 62  },
  { route: "/live/cypher",  status: "warn", ms: 198 },
  { route: "/marketplace",  status: "ok",   ms: 44  },
  { route: "/booking",      status: "ok",   ms: 39  },
  { route: "/rewards",      status: "ok",   ms: 41  },
];

const SPONSOR_ROTATIONS = [
  { slot: "Billboard Hero",  sponsor: "SoundWave Audio",    impressions: 4820, ctr: "3.2%" },
  { slot: "Lobby Wall",      sponsor: "BeatBox Pro",        impressions: 2910, ctr: "2.7%" },
  { slot: "Cypher Banner",   sponsor: "UrbanPulse Records", impressions: 1650, ctr: "4.1%" },
];

const ERROR_METRICS = [
  { label: "Routes",  value: "6 warnings", tone: "yellow" },
  { label: "Queues",  value: "2 stalls",   tone: "red"    },
  { label: "Bots",    value: "17 fails",   tone: "red"    },
  { label: "Visuals", value: "4 misses",   tone: "yellow" },
  { label: "Motion",  value: "3 fails",    tone: "yellow" },
  { label: "Sockets", value: "99.7%",      tone: "green"  },
];

// ─── Tab config ───────────────────────────────────────────────────────────────

type Tab = "live" | "bots" | "sponsors" | "routes" | "errors" | "safety";

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: "live",     label: "LIVE",     color: "#00C896" },
  { id: "bots",     label: "BOTS",     color: "#00C8FF" },
  { id: "sponsors", label: "SPONSORS", color: "#FFD700" },
  { id: "routes",   label: "ROUTES",   color: "#AA2DFF" },
  { id: "errors",   label: "ERRORS",   color: "#FF2DAA" },
  { id: "safety",   label: "SAFETY",   color: "#FF6B00" },
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
  const [tab, setTab]   = useState<Tab>("live");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const streaming  = MOCK_BOTS.filter(b => b.status === "streaming").length;
  const warnRoutes = ROUTE_HEALTH.filter(r => r.status !== "ok").length;
  const activeTab  = TABS.find(t => t.id === tab)!;

  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter',sans-serif" }}>

      {/* ── Top metrics bar ─────────────────────────────────────────────────── */}
      <div style={{ background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px clamp(16px,4vw,40px)", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", color: "#00C8FF" }}>TMI OBSERVATORY</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { label: "STREAMING",  value: streaming,                                   color: "#00C896" },
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
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 clamp(16px,4vw,40px)", display: "flex", gap: 0 }}>
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
