"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── API shapes ───────────────────────────────────────────────────────────────

interface LiveSession {
  userId: string;
  displayName: string;
  category: string;
  roomId: string;
  viewerCount: number;
  accentColor: string;
}

interface RevenueData {
  mode: string;
  totals: { today: string; month: string };
  subscriptions: { active: number | string };
  streams: Record<string, { countToday: number; countMonth: number }>;
  telemetry: { verifiedEventsToday: number };
}

interface AdminStats {
  users: {
    total: number;
    online: number;
    newToday: number;
    byRole: Record<string, number>;
    byTier: Record<string, number>;
  };
  rooms: { total: number; active: number; topRoom: string };
}

interface RuntimeHealth {
  conductorStatus?: Array<{
    roomId: string;
    isHealthy: boolean;
    failureCount: number;
    lastHeartbeatAgeMs: number;
  }>;
  deadlockCount?: number;
  activeDomainClaims?: Record<string, number>;
}

// ─── Monitor frame ────────────────────────────────────────────────────────────

function MonitorFrame({
  label,
  color,
  children,
  href,
  isLive = false,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
  href?: string;
  isLive?: boolean;
}) {
  return (
    <div
      style={{
        border: `1px solid ${color}33`,
        borderRadius: 16,
        background: "rgba(5,5,16,0.9)",
        display: "flex",
        flexDirection: "column",
        minHeight: 320,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          background: `linear-gradient(90deg, ${color}18, transparent)`,
          borderBottom: `1px solid ${color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
          <span
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.18em",
              color,
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
          {isLive && (
            <span
              style={{
                fontSize: 7,
                fontWeight: 900,
                color: "#FF2020",
                letterSpacing: "0.1em",
                marginLeft: 4,
              }}
            >
              ● LIVE
            </span>
          )}
        </div>
        {href && (
          <Link
            href={href}
            style={{
              fontSize: 8,
              color,
              textDecoration: "none",
              fontWeight: 700,
              opacity: 0.7,
            }}
          >
            EXPAND →
          </Link>
        )}
      </div>
      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  color = "rgba(255,255,255,0.8)",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 800, color }}>{value}</span>
    </div>
  );
}

function BigStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${color}22`,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
      <div
        style={{
          fontSize: 7,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.08em",
          marginTop: 3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Category badge colours ───────────────────────────────────────────────────

const CAT_COLOR: Record<string, string> = {
  live: "#FF2020",
  battle: "#FFD700",
  cypher: "#AA2DFF",
  challenge: "#FF6B35",
  concert: "#00FFFF",
  game: "#00FF88",
  session: "#FF2DAA",
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MissionControlDashboard() {
  const [live, setLive] = useState<LiveSession[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<RuntimeHealth | null>(null);
  const [healthErr, setHealthErr] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const fetchAll = async () => {
      // Monitor 1 — live sessions
      try {
        const r = await fetch("/api/live/go", { cache: "no-store" });
        const d = await r.json() as { sessions?: LiveSession[] };
        setLive(d.sessions ?? []);
      } catch {
        setLive([]);
      }

      // Monitor 2 — revenue (cookie auth: tmi_role)
      try {
        const r = await fetch("/api/admin/revenue", { cache: "no-store" });
        if (r.ok) setRevenue(await r.json() as RevenueData);
      } catch { /* stays null */ }

      // Monitor 3 — user stats (no auth)
      try {
        const r = await fetch("/api/admin/stats", { cache: "no-store" });
        if (r.ok) setStats(await r.json() as AdminStats);
      } catch { /* stays null */ }

      // Monitor 4 — runtime health (cookie auth: tmi_role=admin)
      try {
        const r = await fetch("/api/admin/runtime-health", { cache: "no-store" });
        if (r.ok) {
          setHealth(await r.json() as RuntimeHealth);
          setHealthErr(null);
        } else {
          setHealthErr(`HTTP ${r.status} — admin cookie required`);
        }
      } catch {
        setHealthErr("Runtime health unavailable");
      }

      setLastRefresh(new Date());
    };

    void fetchAll();
    const id = setInterval(() => void fetchAll(), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#00FF88",
              boxShadow: "0 0 10px #00FF88",
              animation: "mcPulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.25em",
              color: "#00FFFF",
              textTransform: "uppercase",
            }}
          >
            Mission Control — TMI Platform
          </span>
        </div>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
          Refreshed {lastRefresh.toLocaleTimeString()} · auto 15s
        </span>
      </div>

      {/* ── 4-Monitor Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 16,
          minHeight: 760,
        }}
      >
        {/* Monitor 1 — LIVE */}
        <MonitorFrame
          label="Live · Battles · Cyphers · Concerts · Challenges"
          color="#FF2020"
          href="/admin/live-feed"
          isLive={live.length > 0}
        >
          {live.length === 0 ? (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                textAlign: "center",
                paddingTop: 48,
              }}
            >
              No active rooms right now
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {live.slice(0, 8).map((s) => (
                <div
                  key={s.userId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${CAT_COLOR[s.category] ?? "#ffffff18"}22`,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: CAT_COLOR[s.category] ?? "#ffffff44",
                      boxShadow: `0 0 6px ${CAT_COLOR[s.category] ?? "#ffffff44"}`,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.displayName}
                  </span>
                  <span
                    style={{
                      fontSize: 7,
                      fontWeight: 900,
                      color: CAT_COLOR[s.category] ?? "#ffffff66",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {s.category}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.45)",
                      flexShrink: 0,
                    }}
                  >
                    {s.viewerCount.toLocaleString()} viewers
                  </span>
                </div>
              ))}
              {live.length > 8 && (
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.3)",
                    textAlign: "center",
                    paddingTop: 6,
                  }}
                >
                  +{live.length - 8} more active rooms
                </div>
              )}
              <div
                style={{
                  marginTop: 8,
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "rgba(255,32,32,0.08)",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#FF2020",
                  textAlign: "center",
                }}
              >
                {live.length} room{live.length !== 1 ? "s" : ""} live ·{" "}
                {live.reduce((s, r) => s + r.viewerCount, 0).toLocaleString()} total viewers
              </div>
            </div>
          )}
        </MonitorFrame>

        {/* Monitor 2 — REVENUE */}
        <MonitorFrame
          label="Tips · Subscriptions · Sponsors · Ads · Beat Sales"
          color="#FFD700"
          href="/admin/billing"
        >
          {revenue === null ? (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                textAlign: "center",
                paddingTop: 48,
              }}
            >
              Loading revenue data…
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <BigStat label="Today" value={revenue.totals.today} color="#FFD700" />
                <BigStat label="This Month" value={revenue.totals.month} color="#00FFFF" />
                <BigStat
                  label="Active Subs"
                  value={revenue.subscriptions.active}
                  color="#FF2DAA"
                />
                <BigStat
                  label="Stripe Mode"
                  value={revenue.mode.toUpperCase()}
                  color={revenue.mode === "live" ? "#00FF88" : "#FFD700"}
                />
              </div>
              <Stat
                label="Subscriptions today"
                value={revenue.streams.subscriptions?.countToday ?? 0}
                color="#00FFFF"
              />
              <Stat
                label="One-time payments today"
                value={revenue.streams.one_time?.countToday ?? 0}
                color="#FF2DAA"
              />
              <Stat
                label="Sponsor transactions today"
                value={revenue.streams.sponsors?.countToday ?? 0}
                color="#FFD700"
              />
              <Stat
                label="Charges today"
                value={revenue.streams.charges?.countToday ?? 0}
              />
              <Stat
                label="Verified webhook events today"
                value={revenue.telemetry.verifiedEventsToday}
                color="#00FF88"
              />
            </>
          )}
        </MonitorFrame>

        {/* Monitor 3 — USERS */}
        <MonitorFrame
          label="Signups · Users · Roles · Tiers · Traffic"
          color="#00FFFF"
          href="/admin/users"
        >
          {stats === null ? (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                textAlign: "center",
                paddingTop: 48,
              }}
            >
              Loading user data…
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <BigStat
                  label="Total Users"
                  value={stats.users.total}
                  color="#00FFFF"
                />
                <BigStat
                  label="New Today"
                  value={stats.users.newToday}
                  color="#00FF88"
                />
                <BigStat
                  label="Active Rooms"
                  value={stats.rooms.active}
                  color="#FF2DAA"
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    color: "#00FFFF",
                    letterSpacing: "0.15em",
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  By Role
                </div>
                {Object.entries(stats.users.byRole).map(([role, count]) => (
                  <Stat key={role} label={role} value={count} />
                ))}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    color: "#FFD700",
                    letterSpacing: "0.15em",
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  By Tier
                </div>
                {Object.entries(stats.users.byTier).map(([tier, count]) => (
                  <Stat key={tier} label={tier} value={count} color="#FFD700" />
                ))}
              </div>
            </>
          )}
        </MonitorFrame>

        {/* Monitor 4 — RUNTIME HEALTH */}
        <MonitorFrame
          label="Runtime Health · Streams · Errors · Moderation"
          color="#00FF88"
          href="/admin/launch-observatory"
        >
          {healthErr ? (
            <div style={{ fontSize: 11, color: "#FF2DAA", paddingTop: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>{healthErr}</div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                }}
              >
                Log in as admin to see runtime diagnostics.
              </div>
            </div>
          ) : health === null ? (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                textAlign: "center",
                paddingTop: 48,
              }}
            >
              Loading health data…
            </div>
          ) : (
            <>
              <Stat
                label="Deadlocks detected"
                value={health.deadlockCount ?? 0}
                color={health.deadlockCount ? "#FF2DAA" : "#00FF88"}
              />
              {health.conductorStatus?.map((c) => (
                <Stat
                  key={c.roomId}
                  label={`${c.roomId} — ${c.lastHeartbeatAgeMs}ms ago`}
                  value={c.isHealthy ? "HEALTHY" : "DEGRADED"}
                  color={c.isHealthy ? "#00FF88" : "#FF2DAA"}
                />
              ))}
              {Object.entries(health.activeDomainClaims ?? {}).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      color: "#00FF88",
                      letterSpacing: "0.15em",
                      marginBottom: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    Domain Claims
                  </div>
                  {Object.entries(health.activeDomainClaims ?? {}).map(
                    ([domain, count]) => (
                      <Stat key={domain} label={domain} value={count} color="#00FF88" />
                    ),
                  )}
                </div>
              )}
            </>
          )}
        </MonitorFrame>
      </div>

      {/* ── Quick Links ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {[
          { label: "Live Feed", href: "/admin/live-feed", color: "#FF2020" },
          { label: "Billing", href: "/admin/billing", color: "#FFD700" },
          { label: "Users", href: "/admin/users", color: "#00FFFF" },
          { label: "Launch Observatory", href: "/admin/launch-observatory", color: "#00FF88" },
          { label: "Conductor", href: "/admin/conductor", color: "#AA2DFF" },
          { label: "Bot Ops", href: "/admin/bot-operations", color: "#FF2DAA" },
          { label: "Video Wall", href: "/admin/video-wall", color: "#FF6B35" },
          { label: "Safety", href: "/admin/safety", color: "#FF2020" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${l.color}44`,
              color: l.color,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textDecoration: "none",
              background: `${l.color}0a`,
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes mcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
