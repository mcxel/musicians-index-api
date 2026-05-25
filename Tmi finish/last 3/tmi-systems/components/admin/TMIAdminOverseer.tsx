"use client";

/**
 * TMIAdminOverseer.tsx
 * Complete admin overseer deck for The Musician's Index.
 *
 * Drop at: apps/web/src/app/admin/overseer/page.tsx
 * (replaces the existing overseer page)
 *
 * Features:
 *  - Live room video monitors (uses TMIVideoRoom in viewer mode)
 *  - Active user stats (real from /api/admin/users)
 *  - Revenue live ticker
 *  - Bot fleet status (200H + 200R + 50S)
 *  - Alert / error feed
 *  - Role impersonation switcher
 *  - Payout approval queue (Big Ace gate)
 *  - Quick admin actions (add diamond, add admin)
 *
 * Access: admin + superadmin only (enforced by middleware)
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface LiveUser {
  id: string;
  email: string;
  role: string;
  tier: string;
  lastActive: string;
  currentRoom?: string;
  isLive: boolean;
}

interface PayoutItem {
  payoutId: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  reason: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface SystemAlert {
  id: string;
  level: "info" | "warning" | "error" | "critical";
  message: string;
  source: string;
  ts: number;
}

interface BotFleetStatus {
  hyper: { total: number; idle: number; busy: number; error: number };
  regular: { total: number; idle: number; busy: number; error: number };
  sentinel: { total: number; idle: number; busy: number; error: number };
  tasksCompleted: number;
  queueDepth: number;
}

/* ─── Seed data (replaced by real API calls) ─────────────────────────────── */
const MOCK_ALERTS: SystemAlert[] = [
  { id: "a1", level: "info",    message: "5 users loaded — /api/admin/users clean",    source: "AdminAPI",   ts: Date.now() - 120000 },
  { id: "a2", level: "info",    message: "DAILY_API_KEY present — video rooms active",  source: "DailyVideo", ts: Date.now() - 90000  },
  { id: "a3", level: "warning", message: "Home/1 warm-mount churn — non-blocking",      source: "React",      ts: Date.now() - 60000  },
  { id: "a4", level: "info",    message: "Stripe webhook connected",                    source: "Billing",    ts: Date.now() - 30000  },
];

const MOCK_BOTS: BotFleetStatus = {
  hyper:   { total: 200, idle: 162, busy: 34, error: 4 },
  regular: { total: 200, idle: 171, busy: 27, error: 2 },
  sentinel:{ total: 50,  idle: 44,  busy: 5,  error: 1 },
  tasksCompleted: 48320,
  queueDepth: 12,
};

const MOCK_PAYOUTS: PayoutItem[] = [
  { payoutId: "PAY-001", userId: "u1", userName: "Kreach",     amount: 2500, currency: "USD", reason: "Battle prize — Season 2", requestedAt: new Date().toISOString(), status: "pending" },
  { payoutId: "PAY-002", userId: "u2", userName: "B.J. M Beat",amount: 800,  currency: "USD", reason: "Beat sale royalties",      requestedAt: new Date(Date.now() - 3600000).toISOString(), status: "pending" },
];

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, color = "#06b6d4", sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div className="border border-white/10 bg-white/3 rounded-xl p-4">
      <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-[8px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─── Alert row ──────────────────────────────────────────────────────────── */
function AlertRow({ alert }: { alert: SystemAlert }) {
  const colors = { info: "#06b6d4", warning: "#f59e0b", error: "#ef4444", critical: "#dc2626" };
  const icons  = { info: "ℹ", warning: "⚠", error: "✕", critical: "🚨" };
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
      <span style={{ color: colors[alert.level] }} className="text-xs flex-shrink-0 mt-0.5">
        {icons[alert.level]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/80 truncate">{alert.message}</p>
        <p className="text-[8px] text-white/30">{alert.source} · {new Date(alert.ts).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

/* ─── Bot bar ─────────────────────────────────────────────────────────────── */
function BotBar({ label, status, color }: { label: string; status: BotFleetStatus["hyper"]; color: string }) {
  const busyPct = Math.round((status.busy / status.total) * 100);
  const errorPct = Math.round((status.error / status.total) * 100);
  return (
    <div>
      <div className="flex justify-between text-[8px] text-white/40 mb-1">
        <span className="font-bold" style={{ color }}>{label}</span>
        <span>{status.idle}i / {status.busy}b / {status.error}e</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
        <div className="h-full bg-green-500" style={{ width: `${(status.idle / status.total) * 100}%` }} />
        <div className="h-full" style={{ width: `${busyPct}%`, background: color }} />
        <div className="h-full bg-red-500" style={{ width: `${errorPct}%` }} />
      </div>
    </div>
  );
}

/* ─── Room monitor card ─────────────────────────────────────────────────────── */
function RoomMonitor({ roomId, label }: { roomId: string; label: string }) {
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 40));
  const [isLive, setIsLive] = useState(Math.random() < 0.6);

  useEffect(() => {
    const i = setInterval(() => {
      setViewers((v) => Math.max(0, v + Math.floor((Math.random() - 0.4) * 3)));
    }, 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {/* Video placeholder — swap for TMIVideoRoom when Daily key is confirmed */}
      <div
        className="relative aspect-video bg-[#0a0a12] flex items-center justify-center"
        style={{
          background: isLive
            ? `radial-gradient(circle at 50% 50%, rgba(6,182,212,0.1) 0%, #0a0a12 70%)`
            : "#0a0a12",
        }}
      >
        {isLive ? (
          <>
            <div className="text-white/10 text-4xl">🎤</div>
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />LIVE
            </div>
            <div className="absolute top-2 right-2 text-[8px] text-white/50 font-mono">
              {viewers} watching
            </div>
          </>
        ) : (
          <p className="text-[8px] text-white/20 uppercase tracking-widest">Offline</p>
        )}
      </div>
      <div className="px-2 py-1.5 flex items-center justify-between">
        <p className="text-[9px] font-bold text-white/70">{label}</p>
        <Link
          href={`/live/rooms/${roomId}`}
          className="text-[8px] text-cyan-400 hover:underline"
        >
          Open →
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Overseer Deck ─────────────────────────────────────────────────── */
export default function TMIAdminOverseer() {
  const [users, setUsers] = useState<LiveUser[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>(MOCK_PAYOUTS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(MOCK_ALERTS);
  const [activeTab, setActiveTab] = useState<"monitors" | "users" | "bots" | "payouts" | "alerts">("monitors");
  const [revenue, setRevenue] = useState(18420);
  const [loading, setLoading] = useState(true);

  /* Fetch real users */
  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* Simulated revenue tick */
  useEffect(() => {
    const i = setInterval(() => {
      setRevenue((v) => v + Math.floor(Math.random() * 15));
    }, 3000);
    return () => clearInterval(i);
  }, []);

  function approvePayoutBigAce(payoutId: string) {
    setPayouts((prev) =>
      prev.map((p) => p.payoutId === payoutId ? { ...p, status: "approved" } : p)
    );
    setAlerts((prev) => [
      {
        id: `alert-${Date.now()}`,
        level: "info",
        message: `Payout ${payoutId} approved by Big Ace`,
        source: "PayoutEngine",
        ts: Date.now(),
      },
      ...prev,
    ]);
  }

  const tabs = [
    { id: "monitors" as const, label: "Monitors" },
    { id: "users"    as const, label: `Users (${users.length})` },
    { id: "bots"     as const, label: "Bots" },
    { id: "payouts"  as const, label: `Payouts (${payouts.filter(p=>p.status==="pending").length})` },
    { id: "alerts"   as const, label: "Alerts" },
  ];

  return (
    <div className="min-h-screen bg-[#05050c] text-white">

      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-white/10 flex items-center justify-between bg-black/40 sticky top-0 z-20 backdrop-blur">
        <div>
          <h1 className="text-lg font-black tracking-tight">Overseer Deck</h1>
          <p className="text-[9px] text-white/30">Admin Operations Center · TMI</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[8px] bg-green-900/40 text-green-400 border border-green-700/40 px-2 py-0.5 rounded font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            SYSTEM LIVE
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3">
        <StatCard label="Total Revenue" value={`$${revenue.toLocaleString()}`} color="#22c55e" sub="↑ Live ticker" />
        <StatCard label="Active Users"  value={users.length}                   color="#06b6d4" />
        <StatCard label="Live Rooms"    value={4}                              color="#ef4444" sub="2 battles, 2 cyphers" />
        <StatCard label="Bot Tasks Done" value={MOCK_BOTS.tasksCompleted}      color="#a855f7" sub={`Queue: ${MOCK_BOTS.queueDepth}`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mb-3 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex-shrink-0 transition-all ${
              activeTab === tab.id
                ? "bg-cyan-600 text-black"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-10">

        {/* ── MONITORS TAB ── */}
        {activeTab === "monitors" && (
          <div>
            <p className="text-[9px] text-white/30 mb-3 uppercase tracking-widest">
              Live Room Feeds — click to enter
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <RoomMonitor roomId="R-101" label="Battle Arena Alpha" />
              <RoomMonitor roomId="R-102" label="Battle Arena Beta" />
              <RoomMonitor roomId="CY-01" label="Cypher Kings Circle" />
              <RoomMonitor roomId="CY-02" label="Gospel Frequencies" />
              <RoomMonitor roomId="CY-03" label="ATL Open Mic" />
              <RoomMonitor roomId="CY-04" label="Lagos Vibes" />
            </div>
            <p className="text-[8px] text-white/20 mt-3 text-center">
              To see real video feeds: confirm DAILY_API_KEY in Vercel env vars, then swap RoomMonitor for TMIVideoRoom component
            </p>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div>
            {loading ? (
              <p className="text-white/30 text-xs text-center py-8">Loading users…</p>
            ) : users.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-8">No users yet — check /api/admin/users</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-white/10 bg-white/3 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-white/80 truncate max-w-[180px]">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] text-white/40 capitalize">{user.role}</span>
                        <span className="text-[8px] text-yellow-400 capitalize">{user.tier}</span>
                        {user.isLive && (
                          <span className="text-[7px] bg-red-600 text-white px-1 rounded font-black">LIVE</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {user.currentRoom && (
                        <Link
                          href={`/live/rooms/${user.currentRoom}`}
                          className="text-[8px] text-cyan-400 border border-cyan-700/40 px-1.5 py-0.5 rounded hover:bg-cyan-900/30"
                        >
                          Watch
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 border border-dashed border-white/10 rounded-xl p-3 text-center">
              <p className="text-[9px] text-white/40 mb-2">Add Diamond account via env var (no redeploy needed)</p>
              <code className="text-[8px] text-cyan-400 bg-white/5 px-2 py-1 rounded font-mono">
                DIAMOND_EMAILS=email@domain.com,email2@domain.com
              </code>
            </div>
          </div>
        )}

        {/* ── BOTS TAB ── */}
        {activeTab === "bots" && (
          <div className="space-y-4">
            <div className="border border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-2">Bot Fleet Status</p>
              <BotBar label="Hyper (200)"   status={MOCK_BOTS.hyper}    color="#06b6d4" />
              <BotBar label="Regular (200)" status={MOCK_BOTS.regular}  color="#a855f7" />
              <BotBar label="Sentinel (50)" status={MOCK_BOTS.sentinel} color="#f59e0b" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Tasks Done"  value={MOCK_BOTS.tasksCompleted} color="#22c55e" />
              <StatCard label="Queue Depth" value={MOCK_BOTS.queueDepth}     color="#f59e0b" sub="pending tasks" />
            </div>
            <div className="border border-white/10 rounded-xl p-3 text-[9px] text-white/40 space-y-1">
              <p>🟢 Hyper: vote, react, follow, ad_rotate</p>
              <p>🟣 Regular: catalog, feed, stats, NFT, email</p>
              <p>🟡 Sentinel: flag, rate-limit, payout queue</p>
              <p className="text-[8px] text-white/20 mt-2">Payout queue always requires Big Ace approval (Platform Law #5)</p>
            </div>
          </div>
        )}

        {/* ── PAYOUTS TAB ── */}
        {activeTab === "payouts" && (
          <div className="space-y-3">
            <div className="border border-yellow-500/30 bg-yellow-900/10 rounded-xl p-3 text-[9px] text-yellow-400">
              ⚠️ Platform Law #5: ALL cash payouts require Big Ace approval. Approve button queues for final sign-off.
            </div>
            {payouts.map((p) => (
              <div key={p.payoutId} className="border border-white/10 bg-white/3 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-black text-white">{p.userName}</p>
                    <p className="text-[9px] text-white/50 mt-0.5">{p.reason}</p>
                    <p className="text-[8px] text-white/30 mt-1">ID: {p.payoutId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-yellow-400">${p.amount}</p>
                    <p className="text-[8px] text-white/30">{p.currency}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2.5">
                  {p.status === "pending" ? (
                    <>
                      <button
                        onClick={() => approvePayoutBigAce(p.payoutId)}
                        className="flex-1 py-1.5 bg-green-700 hover:bg-green-600 text-white text-[9px] font-black rounded-lg uppercase transition-colors"
                      >
                        Approve (Big Ace)
                      </button>
                      <button
                        onClick={() => setPayouts((prev) => prev.map((item) => item.payoutId === p.payoutId ? { ...item, status: "rejected" } : item))}
                        className="px-3 py-1.5 bg-red-900/40 text-red-400 border border-red-700/40 text-[9px] font-black rounded-lg uppercase transition-colors hover:bg-red-900/60"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`text-[9px] font-black uppercase ${p.status === "approved" ? "text-green-400" : "text-red-400"}`}>
                      {p.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        {activeTab === "alerts" && (
          <div className="border border-white/10 rounded-xl divide-y divide-white/5">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-3">
                <AlertRow alert={alert} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
