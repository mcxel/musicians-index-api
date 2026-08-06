"use client";

/**
 * FanStatsPanel — Fan Statistics & Reputation Runtime (Rule 9 / Rule 24)
 *
 * Loads real metrics from /api/fan/stats (→ readFanAnalytics) and renders
 * categorised stat cards. All values come from real DB counts — no fake
 * numbers (Rule 20). Shows honest empty state when data is absent.
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { FanAnalyticsMetrics } from "@/lib/analytics/roleAnalyticsContracts";

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  accent: string;
  source: "real" | "empty" | "unavailable";
  index: number;
}

function StatCard({ label, value, icon, accent, source, index }: StatCardProps) {
  const displayValue =
    source === "real"
      ? value.toLocaleString("en-US")
      : source === "empty"
      ? "0"
      : "—";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      style={{
        background: `${accent}0a`,
        border: `1px solid ${accent}28`,
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        {source === "real" && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 6px ${accent}`,
            }}
          />
        )}
      </div>
      <div
        style={{
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          fontWeight: 900,
          color: source === "real" ? accent : "rgba(255,255,255,0.2)",
          lineHeight: 1,
        }}
      >
        {displayValue}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.06em" }}>
        {label.toUpperCase()}
      </div>
    </motion.div>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  accent: string;
  children: React.ReactNode;
}

function Section({ title, icon, accent, children }: SectionProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accent, fontWeight: 800 }}>
          {title.toUpperCase()}
        </div>
        <div style={{ flex: 1, height: 1, background: `${accent}22` }} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function cents(val: number): string {
  return `$${(val / 100).toFixed(2)}`;
}

interface FanStatsPanelProps {
  userId?: string;
  /** Pre-loaded metrics — if omitted the component fetches /api/fan/stats */
  metrics?: FanAnalyticsMetrics;
}

export default function FanStatsPanel({ userId, metrics: propMetrics }: FanStatsPanelProps) {
  const [metrics, setMetrics] = useState<FanAnalyticsMetrics | null>(propMetrics ?? null);
  const [loading, setLoading] = useState(!propMetrics);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const url = userId ? `/api/fan/stats?userId=${encodeURIComponent(userId)}` : "/api/fan/stats";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Could not load stats");
      const data = await res.json() as { metrics: FanAnalyticsMetrics };
      setMetrics(data.metrics);
    } catch (e: any) {
      setError(e.message ?? "Stats unavailable");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!propMetrics) load();
  }, [propMetrics, load]);

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>
        Loading stats…
      </div>
    );
  }
  if (error || !metrics) {
    return (
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, padding: "16px 0", textAlign: "center" }}>
        {error ?? "No stats available yet."}
      </div>
    );
  }

  const m = metrics;
  let cardIdx = 0;
  const next = () => cardIdx++;

  return (
    <div style={{ padding: "0 0 24px" }}>

      {/* ── Media Player & Collection ── */}
      <Section title="Media Players & Collection" icon="🎛️" accent="#00FFFF">
        <StatCard label="Players Owned" value={m.mediaPlayersOwned.value} icon="🎛️" accent="#00FFFF" source={m.mediaPlayersOwned.source} index={next()} />
        <StatCard label="Tickets Owned" value={m.ticketsOwned.value} icon="🎟️" accent="#00FFFF" source={m.ticketsOwned.source} index={next()} />
        <StatCard label="Fan Clubs" value={m.fanClubsJoined.value} icon="❤️" accent="#00FFFF" source={m.fanClubsJoined.source} index={next()} />
      </Section>

      {/* ── Artist Support ── */}
      <Section title="Artist Support" icon="💸" accent="#FF2DAA">
        <StatCard
          label="Tips Sent"
          value={m.tipsSentCount.value}
          icon="💸"
          accent="#FF2DAA"
          source={m.tipsSentCount.source}
          index={next()}
        />
        <StatCard
          label="Total Tipped"
          value={m.tipsSentCents.value}
          icon="💰"
          accent="#FFD700"
          source={m.tipsSentCents.source}
          index={next()}
        />
      </Section>

      {/* ── Live & Events ── */}
      <Section title="Live & Events" icon="🎪" accent="#AA2DFF">
        <StatCard label="Rooms Joined" value={m.roomsJoined.value} icon="🚪" accent="#AA2DFF" source={m.roomsJoined.source} index={next()} />
        <StatCard label="Votes Cast" value={m.votesCast.value} icon="🗳️" accent="#AA2DFF" source={m.votesCast.source} index={next()} />
        <StatCard label="Events Attended" value={m.eventsAttended.value} icon="📅" accent="#AA2DFF" source={m.eventsAttended.source} index={next()} />
      </Section>

      {/* ── Community ── */}
      <Section title="Community" icon="🤝" accent="#9dffc8">
        <StatCard label="Friends" value={m.friendsCount.value} icon="👥" accent="#9dffc8" source={m.friendsCount.source} index={next()} />
        <StatCard label="Memories" value={m.memoriesSaved.value} icon="📸" accent="#9dffc8" source={m.memoriesSaved.source} index={next()} />
      </Section>

      {/* ── Progression ── */}
      <Section title="Progression" icon="⭐" accent="#FFD700">
        <StatCard label="XP Earned" value={m.xp.value} icon="⚡" accent="#FFD700" source={m.xp.source} index={next()} />
      </Section>

      {/* ── Status footer ── */}
      {m.status === "empty" && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 8 }}>
          No activity recorded yet. Start participating to build your stats.
        </div>
      )}
    </div>
  );
}
