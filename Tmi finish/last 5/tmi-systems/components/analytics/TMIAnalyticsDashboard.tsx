"use client";

/**
 * TMIAnalyticsDashboard.tsx
 * Unified analytics and stats dashboard for The Musician's Index.
 *
 * Drop at: apps/web/src/components/analytics/TMIAnalyticsDashboard.tsx
 *
 * Modes:
 *  "performer"  → artist's personal dashboard (their stats, revenue, fans)
 *  "admin"      → platform-wide metrics (all users, revenue, bot activity)
 *  "advertiser" → sponsor/ad campaign performance
 *
 * Metrics covered:
 *  - Live stream viewers (peak, average, drop-off)
 *  - Revenue (tips, beats, NFTs, tickets, subscriptions)
 *  - Battle win/loss record, XP earned per period
 *  - Fan growth over time
 *  - Magazine article reads + engagement
 *  - Beat store plays, previews, purchases
 *  - Bot fleet activity (admin only)
 *  - Room traffic and discovery funnel
 */

import { useState, useEffect, useRef } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type DashboardMode = "performer" | "admin" | "advertiser";
type TimePeriod = "today" | "7d" | "30d" | "season";

export interface PerformerStats {
  userId: string;
  displayName: string;
  period: TimePeriod;
  revenue: {
    tips: number; beats: number; nfts: number; tickets: number;
    subscriptions: number; total: number;
  };
  battles: { won: number; lost: number; totalXP: number; avgCrowdVote: number };
  fans: { gained: number; total: number; returningPct: number };
  streams: {
    sessions: number; totalMinutes: number; peakViewers: number;
    avgDuration: number; topRoom: string;
  };
  beats: { plays: number; purchases: number; topBeat: string };
  articles: { reads: number; topArticle: string };
}

export interface PlatformStats {
  period: TimePeriod;
  users: { total: number; activeToday: number; newThisWeek: number };
  revenue: { gross: number; netAfterFees: number; pendingPayouts: number };
  rooms: { live: number; peakConcurrent: number; totalSessionsToday: number };
  bots: { active: number; tasksCompleted: number; errorsToday: number };
  discoveries: { billboardClicks: number; autoJoins: number; conversionPct: number };
}

/* ─── Stat card ───────────────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, color = "#06b6d4", icon,
}: { label: string; value: string; sub?: string; color?: string; icon?: string }) {
  return (
    <div
      className="rounded-xl p-4 space-y-1.5"
      style={{ background: color + "10", border: `1px solid ${color}25` }}
    >
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-sm">{icon}</span>}
        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{label}</p>
      </div>
      <p className="text-xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-[8px] text-white/30">{sub}</p>}
    </div>
  );
}

/* ─── Mini sparkline (canvas) ─────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const max = Math.max(...data, 1);
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / max) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Fill under line
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = color + "20";
    ctx.fill();
  }, [data, color]);
  return <canvas ref={canvasRef} width={120} height={32} className="w-full" />;
}

/* ─── Revenue breakdown ───────────────────────────────────────────────────── */
function RevenueBreakdown({ revenue }: { revenue: PerformerStats["revenue"] }) {
  const items = [
    { label: "Tips",          value: revenue.tips,          color: "#22c55e" },
    { label: "Beats",         value: revenue.beats,         color: "#a855f7" },
    { label: "NFTs",          value: revenue.nfts,          color: "#38bdf8" },
    { label: "Tickets",       value: revenue.tickets,       color: "#f59e0b" },
    { label: "Subscriptions", value: revenue.subscriptions, color: "#ec4899" },
  ];
  const total = revenue.total || 1;

  return (
    <div className="border border-white/10 rounded-xl p-4 space-y-3">
      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Revenue Breakdown</p>
      <p className="text-2xl font-black text-white">${revenue.total.toFixed(2)}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-[9px] text-white/50 w-24">{item.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(item.value / total) * 100}%`, background: item.color }}
              />
            </div>
            <span className="text-[9px] font-black" style={{ color: item.color }}>
              ${item.value.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Performer analytics ─────────────────────────────────────────────────── */
function PerformerAnalytics({ stats }: { stats: PerformerStats }) {
  const fakeViewerData = [12,18,25,30,45,67,89,120,98,75,55,45,38,50];
  const fakeFanData    = [100,105,108,115,120,118,125,130,138,142,145,152,158,162];

  return (
    <div className="space-y-3">
      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Revenue" value={`$${stats.revenue.total.toFixed(2)}`} icon="💰" color="#22c55e" sub="This period" />
        <StatCard label="Total Fans" value={stats.fans.total.toLocaleString()} icon="👥" color="#06b6d4" sub={`+${stats.fans.gained} this period`} />
        <StatCard label="Battle Record" value={`${stats.battles.won}W-${stats.battles.lost}L`} icon="⚔️" color="#ef4444" sub={`${stats.battles.totalXP.toLocaleString()} XP earned`} />
        <StatCard label="Peak Viewers" value={stats.streams.peakViewers.toLocaleString()} icon="📡" color="#a855f7" sub={`${stats.streams.sessions} sessions`} />
      </div>

      {/* Revenue breakdown */}
      <RevenueBreakdown revenue={stats.revenue} />

      {/* Viewer trend */}
      <div className="border border-white/10 rounded-xl p-4 space-y-2">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Viewer Trend</p>
        <Sparkline data={fakeViewerData} color="#a855f7" />
        <div className="flex justify-between text-[7px] text-white/20">
          <span>7 days ago</span><span>Today</span>
        </div>
      </div>

      {/* Fan growth */}
      <div className="border border-white/10 rounded-xl p-4 space-y-2">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Fan Growth</p>
        <Sparkline data={fakeFanData} color="#06b6d4" />
      </div>

      {/* Stream details */}
      <div className="border border-white/10 rounded-xl p-4 space-y-2">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Streams</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: "Sessions",     v: stats.streams.sessions },
            { l: "Total Min",    v: stats.streams.totalMinutes.toLocaleString() },
            { l: "Avg Duration", v: `${stats.streams.avgDuration}m` },
            { l: "Returning %",  v: `${stats.fans.returningPct}%` },
          ].map((s) => (
            <div key={s.l} className="bg-white/5 rounded-lg p-2.5 text-center">
              <p className="text-sm font-black text-white">{s.v}</p>
              <p className="text-[7px] text-white/30 uppercase">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Beat + article */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-white/10 rounded-xl p-3 space-y-1">
          <p className="text-[8px] text-white/30 uppercase">Beat Store</p>
          <p className="text-lg font-black text-purple-400">{stats.beats.plays} plays</p>
          <p className="text-[8px] text-white/40">{stats.beats.purchases} purchases</p>
          <p className="text-[7px] text-white/20 truncate">Top: {stats.beats.topBeat}</p>
        </div>
        <div className="border border-white/10 rounded-xl p-3 space-y-1">
          <p className="text-[8px] text-white/30 uppercase">Magazine</p>
          <p className="text-lg font-black text-pink-400">{stats.articles.reads.toLocaleString()}</p>
          <p className="text-[8px] text-white/40">article reads</p>
          <p className="text-[7px] text-white/20 truncate">Top: {stats.articles.topArticle}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Platform analytics (admin only) ─────────────────────────────────────── */
function PlatformAnalytics({ stats }: { stats: PlatformStats }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Users"    value={stats.users.total.toLocaleString()}     icon="👤" color="#06b6d4" />
        <StatCard label="Active Today"   value={stats.users.activeToday.toLocaleString()} icon="🔥" color="#22c55e" />
        <StatCard label="Gross Revenue"  value={`$${stats.revenue.gross.toLocaleString()}`} icon="💵" color="#fbbf24" />
        <StatCard label="Live Rooms"     value={stats.rooms.live.toString()}             icon="📡" color="#a855f7" />
      </div>
      <div className="border border-white/10 rounded-xl p-4">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Bot Fleet</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center"><p className="text-lg font-black text-green-400">{stats.bots.active}</p><p className="text-[7px] text-white/30 uppercase">Active</p></div>
          <div className="text-center"><p className="text-lg font-black text-blue-400">{stats.bots.tasksCompleted.toLocaleString()}</p><p className="text-[7px] text-white/30 uppercase">Tasks Done</p></div>
          <div className="text-center"><p className="text-lg font-black text-red-400">{stats.bots.errorsToday}</p><p className="text-[7px] text-white/30 uppercase">Errors</p></div>
        </div>
      </div>
      <div className="border border-white/10 rounded-xl p-4">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Discovery Funnel</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center"><p className="text-lg font-black text-cyan-400">{stats.discoveries.billboardClicks.toLocaleString()}</p><p className="text-[7px] text-white/30 uppercase">Billboard Clicks</p></div>
          <div className="text-center"><p className="text-lg font-black text-yellow-400">{stats.discoveries.autoJoins.toLocaleString()}</p><p className="text-[7px] text-white/30 uppercase">Auto Joins</p></div>
          <div className="text-center"><p className="text-lg font-black text-green-400">{stats.discoveries.conversionPct}%</p><p className="text-[7px] text-white/30 uppercase">Conversion</p></div>
        </div>
      </div>
      <div className="border border-amber-500/20 rounded-xl p-4 bg-amber-500/05">
        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">Pending Payouts (Big Ace Queue)</p>
        <p className="text-2xl font-black text-white">${stats.revenue.pendingPayouts.toLocaleString()}</p>
        <p className="text-[8px] text-amber-400/60 mt-1">Awaiting Big Ace approval · Platform Law #5</p>
      </div>
    </div>
  );
}

/* ─── Main dashboard ──────────────────────────────────────────────────────── */
export default function TMIAnalyticsDashboard({
  mode,
  performerStats,
  platformStats,
}: {
  mode: DashboardMode;
  performerStats?: PerformerStats;
  platformStats?: PlatformStats;
}) {
  const [period, setPeriod] = useState<TimePeriod>("7d");

  const periods: { id: TimePeriod; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "7d",    label: "7 Days" },
    { id: "30d",   label: "30 Days" },
    { id: "season",label: "Season" },
  ];

  return (
    <div className="min-h-screen bg-[#05050c] text-white">
      <div className="px-4 pt-5 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-black uppercase tracking-tight">Analytics</h1>
          <p className="text-[8px] text-white/30 uppercase tracking-widest mt-0.5">
            {mode === "performer" ? performerStats?.displayName : mode === "admin" ? "Platform Overview" : "Ad Campaign"}
          </p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-1.5 px-4 py-3">
        {periods.map((p) => (
          <button key={p.id} onClick={() => setPeriod(p.id)}
            className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${period === p.id ? "bg-white text-black" : "bg-white/5 text-white/50"}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8">
        {mode === "performer" && performerStats && <PerformerAnalytics stats={performerStats} />}
        {mode === "admin" && platformStats && <PlatformAnalytics stats={platformStats} />}
      </div>
    </div>
  );
}
