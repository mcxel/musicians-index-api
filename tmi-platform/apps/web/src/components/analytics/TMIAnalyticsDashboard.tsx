"use client";

import { useMemo, useState } from "react";
import { BarChart, HBarChart, LineChart, PieChart } from "@/components/analytics/TmiChartKit";

type DashboardMode = "performer" | "admin" | "advertiser";
type TimePeriod = "today" | "7d" | "30d" | "season";
type ChartMode = "comparison" | "growth" | "distribution" | "totals";

export interface PerformerStats {
  userId: string;
  displayName: string;
  period: TimePeriod;
  revenue: {
    tips: number;
    beats: number;
    nfts: number;
    tickets: number;
    subscriptions: number;
    total: number;
  };
  battles: { won: number; lost: number; totalXP: number; avgCrowdVote: number };
  fans: { gained: number; total: number; returningPct: number };
  streams: {
    sessions: number;
    totalMinutes: number;
    peakViewers: number;
    avgDuration: number;
    topRoom: string;
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

type ModeMeta = {
  id: ChartMode;
  label: string;
  why: string;
  question: string;
};

const CHART_MODES: ModeMeta[] = [
  {
    id: "comparison",
    label: "Compare",
    why: "Bars are best for side-by-side comparison.",
    question: "Which signal is strongest right now?",
  },
  {
    id: "growth",
    label: "Growth",
    why: "Lines show direction and movement.",
    question: "Are key signals moving up or down?",
  },
  {
    id: "distribution",
    label: "Split",
    why: "Pie/Donut shows composition of totals.",
    question: "Where is total value coming from?",
  },
  {
    id: "totals",
    label: "Totals",
    why: "Metric cards are fastest for current state.",
    question: "What are my current operating numbers?",
  },
];

function MetricCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: `${color}12`,
        border: `1px solid ${color}35`,
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.55)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color, marginTop: 4 }}>{value}</div>
      {sub ? <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{sub}</div> : null}
    </div>
  );
}

function ModeSwitcher({ mode, setMode }: { mode: ChartMode; setMode: (mode: ChartMode) => void }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {CHART_MODES.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => setMode(entry.id)}
          title={`${entry.why} ${entry.question}`}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: `1px solid ${mode === entry.id ? "rgba(255,215,0,0.55)" : "rgba(255,255,255,0.12)"}`,
            background: mode === entry.id ? "rgba(255,215,0,0.14)" : "rgba(255,255,255,0.04)",
            color: mode === entry.id ? "#FFD700" : "rgba(255,255,255,0.6)",
            cursor: "pointer",
          }}
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
}

function ModePurpose({ mode }: { mode: ChartMode }) {
  const selected = CHART_MODES.find((entry) => entry.id === mode)!;
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>
        {selected.label} Mode
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.62)", marginBottom: 2 }}>{selected.why}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>{selected.question}</div>
    </div>
  );
}

function PerformerAnalytics({ stats, mode }: { stats: PerformerStats; mode: ChartMode }) {
  const revenueSplit = useMemo(
    () => [
      { label: "Tips", value: stats.revenue.tips, color: "#22c55e" },
      { label: "Beats", value: stats.revenue.beats, color: "#a855f7" },
      { label: "NFTs", value: stats.revenue.nfts, color: "#38bdf8" },
      { label: "Tickets", value: stats.revenue.tickets, color: "#f59e0b" },
      { label: "Subs", value: stats.revenue.subscriptions, color: "#ec4899" },
    ],
    [stats],
  );

  const growthSignals = useMemo(
    () => [
      { label: "Sessions", value: stats.streams.sessions, color: "#00FFFF" },
      { label: "Peak View", value: stats.streams.peakViewers, color: "#AA2DFF" },
      { label: "Fans", value: stats.fans.total, color: "#FF2DAA" },
      { label: "XP", value: stats.battles.totalXP, color: "#FFD700" },
    ],
    [stats],
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {mode === "comparison" ? (
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, background: "rgba(255,255,255,0.02)" }}>
          <BarChart data={revenueSplit} title="REVENUE SOURCES" accentColor="#FFD700" height={180} />
        </div>
      ) : null}

      {mode === "growth" ? (
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, background: "rgba(255,255,255,0.02)" }}>
          <LineChart data={growthSignals} title="CORE SIGNAL MOMENTUM" accentColor="#00FFFF" height={150} fill />
        </div>
      ) : null}

      {mode === "distribution" ? (
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "center" }}>
          <PieChart data={revenueSplit} title="REVENUE DISTRIBUTION" size={190} donut />
        </div>
      ) : null}

      {mode === "totals" ? (
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          <MetricCard label="Total Revenue" value={`$${stats.revenue.total.toFixed(2)}`} color="#22c55e" />
          <MetricCard label="Battle Record" value={`${stats.battles.won}W-${stats.battles.lost}L`} color="#ef4444" sub={`${stats.battles.totalXP.toLocaleString()} XP`} />
          <MetricCard label="Total Fans" value={stats.fans.total.toLocaleString()} color="#06b6d4" sub={`+${stats.fans.gained} period growth`} />
          <MetricCard label="Streams" value={stats.streams.sessions.toLocaleString()} color="#a855f7" sub={`${stats.streams.totalMinutes.toLocaleString()} min total`} />
          <MetricCard label="Avg Crowd Vote" value={`${stats.battles.avgCrowdVote}%`} color="#FFD700" />
          <MetricCard label="Returning Fans" value={`${stats.fans.returningPct}%`} color="#00FFFF" />
        </div>
      ) : null}

      <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, background: "rgba(255,255,255,0.02)" }}>
        <HBarChart
          title="ENGAGEMENT MIX"
          showPct
          data={[
            { label: "Beat Plays", value: Math.max(stats.beats.plays, 0), color: "#8b5cf6" },
            { label: "Beat Purchases", value: Math.max(stats.beats.purchases, 0), color: "#22c55e" },
            { label: "Article Reads", value: Math.max(stats.articles.reads, 0), color: "#ec4899" },
          ]}
        />
      </div>
    </div>
  );
}

function PlatformAnalytics({ stats, mode }: { stats: PlatformStats; mode: ChartMode }) {
  const platformCompare = useMemo(
    () => [
      { label: "Users", value: stats.users.total, color: "#00FFFF" },
      { label: "Active", value: stats.users.activeToday, color: "#22c55e" },
      { label: "Rooms", value: stats.rooms.live, color: "#AA2DFF" },
      { label: "Bot Tasks", value: stats.bots.tasksCompleted, color: "#FFD700" },
    ],
    [stats],
  );

  const platformGrowth = useMemo(
    () => [
      { label: "New Users", value: stats.users.newThisWeek, color: "#00FFFF" },
      { label: "Sessions", value: stats.rooms.totalSessionsToday, color: "#FF2DAA" },
      { label: "Auto Joins", value: stats.discoveries.autoJoins, color: "#22c55e" },
      { label: "Clicks", value: stats.discoveries.billboardClicks, color: "#FFD700" },
    ],
    [stats],
  );

  const distribution = useMemo(
    () => [
      { label: "Net", value: Math.max(stats.revenue.netAfterFees, 0), color: "#22c55e" },
      { label: "Pending", value: Math.max(stats.revenue.pendingPayouts, 0), color: "#f59e0b" },
      { label: "Fees", value: Math.max(stats.revenue.gross - stats.revenue.netAfterFees, 0), color: "#ef4444" },
    ],
    [stats],
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {mode === "comparison" ? (
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, background: "rgba(255,255,255,0.02)" }}>
          <BarChart data={platformCompare} title="PLATFORM COMPARISON" accentColor="#00FFFF" height={180} />
        </div>
      ) : null}

      {mode === "growth" ? (
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, background: "rgba(255,255,255,0.02)" }}>
          <LineChart data={platformGrowth} title="OPERATIONS MOMENTUM" accentColor="#AA2DFF" height={150} fill />
        </div>
      ) : null}

      {mode === "distribution" ? (
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "center" }}>
          <PieChart data={distribution} title="REVENUE DISTRIBUTION" size={190} donut />
        </div>
      ) : null}

      {mode === "totals" ? (
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          <MetricCard label="Total Users" value={stats.users.total.toLocaleString()} color="#06b6d4" />
          <MetricCard label="Active Today" value={stats.users.activeToday.toLocaleString()} color="#22c55e" />
          <MetricCard label="Gross Revenue" value={`$${stats.revenue.gross.toLocaleString()}`} color="#fbbf24" />
          <MetricCard label="Net Revenue" value={`$${stats.revenue.netAfterFees.toLocaleString()}`} color="#22c55e" />
          <MetricCard label="Pending Payouts" value={`$${stats.revenue.pendingPayouts.toLocaleString()}`} color="#f59e0b" />
          <MetricCard label="Conversion" value={`${stats.discoveries.conversionPct}%`} color="#AA2DFF" />
        </div>
      ) : null}
    </div>
  );
}

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
  const [chartMode, setChartMode] = useState<ChartMode>("growth");

  const periods: { id: TimePeriod; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "season", label: "Season" },
  ];

  return (
    <div className="min-h-screen bg-[#05050c] text-white">
      <div className="px-4 pt-5 pb-2 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-sm font-black uppercase tracking-tight">Analytics</h1>
          <p className="text-[8px] text-white/30 uppercase tracking-widest mt-0.5">
            {mode === "performer" ? performerStats?.displayName : mode === "admin" ? "Platform Overview" : "Ad Campaign"}
          </p>
        </div>
        <ModeSwitcher mode={chartMode} setMode={setChartMode} />
      </div>

      <div className="px-4 pb-3">
        <ModePurpose mode={chartMode} />
      </div>

      <div className="flex gap-1.5 px-4 py-3 flex-wrap">
        {periods.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setPeriod(entry.id)}
            className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${period === entry.id ? "bg-white text-black" : "bg-white/5 text-white/50"}`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8">
        {mode === "performer" && performerStats ? <PerformerAnalytics stats={performerStats} mode={chartMode} /> : null}
        {mode === "admin" && platformStats ? <PlatformAnalytics stats={platformStats} mode={chartMode} /> : null}
        {mode === "advertiser" ? (
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, background: "rgba(255,255,255,0.02)", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            Advertiser mode is routed through role-specific analytics rails and can reuse this same chart-mode pattern when unified.
          </div>
        ) : null}
      </div>
    </div>
  );
}
