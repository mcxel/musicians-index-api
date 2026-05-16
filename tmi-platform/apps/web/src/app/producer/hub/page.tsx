"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProducerStats = { totalBeats: number; totalSales: number; totalRevenue: number; pendingPayout: number; plays: number; licenses: number };

const SEED_STATS: ProducerStats = { totalBeats: 6, totalSales: 14, totalRevenue: 892, pendingPayout: 312, plays: 18400, licenses: 14 };

const SEED_BEATS = [
  { id: "b1", title: "Midnight Bars", genre: "Hip-Hop", bpm: 140, status: "LIVE", sales: 5, revenue: 245, plays: 4200 },
  { id: "b2", title: "Battle Code", genre: "Battle Rap", bpm: 95, status: "LIVE", sales: 7, revenue: 343, plays: 7800 },
  { id: "b3", title: "Frequency", genre: "Instrumental", bpm: 110, status: "REVIEW", sales: 0, revenue: 0, plays: 1900 },
  { id: "b4", title: "Gold Standard", genre: "Trap", bpm: 145, status: "LIVE", sales: 2, revenue: 118, plays: 5600 },
];

export default function ProducerHubPage() {
  const [stats, setStats] = useState<ProducerStats>(SEED_STATS);

  useEffect(() => {
    fetch("/api/producer/stats", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        const s = d as ProducerStats;
        if (s?.totalBeats != null) setStats(s);
      })
      .catch(() => {});
  }, []);

  const statCards = [
    { label: "BEATS LIVE", value: stats.totalBeats, color: "#FFD700" },
    { label: "TOTAL SALES", value: stats.totalSales, color: "#00FF88" },
    { label: "REVENUE", value: `$${stats.totalRevenue}`, color: "#00FFFF" },
    { label: "PENDING PAYOUT", value: `$${stats.pendingPayout}`, color: "#FF2DAA" },
    { label: "PLAYS", value: stats.plays.toLocaleString(), color: "#AA2DFF" },
    { label: "LICENSES SOLD", value: stats.licenses, color: "#FFD700" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>PRODUCER HUB</div>
            <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900 }}>My Producer Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/beats/submit" style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#FFD700", borderRadius: 8, textDecoration: "none" }}>
              + SUBMIT BEAT
            </Link>
            <Link href="/producer/analytics" style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 8, textDecoration: "none" }}>
              ANALYTICS
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 40 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}18`, borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.15em", color: s.color, fontWeight: 800, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Beat list */}
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 16 }}>MY BEATS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SEED_BEATS.map(beat => (
            <div key={beat.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{beat.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{beat.genre} · {beat.bpm} BPM</div>
              </div>
              <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>PLAYS</div><div style={{ fontSize: 13, fontWeight: 800 }}>{beat.plays.toLocaleString()}</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>SALES</div><div style={{ fontSize: 13, fontWeight: 800 }}>{beat.sales}</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>REVENUE</div><div style={{ fontSize: 13, fontWeight: 800, color: "#00FF88" }}>${beat.revenue}</div></div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, color: beat.status === "LIVE" ? "#00FF88" : "#FFD700", border: `1px solid ${beat.status === "LIVE" ? "rgba(0,255,136,0.3)" : "rgba(255,215,0,0.3)"}`, borderRadius: 4, padding: "3px 8px" }}>
                {beat.status}
              </span>
            </div>
          ))}
        </div>

        {/* Payout box */}
        <div style={{ marginTop: 32, background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 14, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 6 }}>PENDING PAYOUT</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#00FF88" }}>${stats.pendingPayout}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Paid after platform cut (30% TMI fee)</div>
          </div>
          <button style={{ padding: "12px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FF88", borderRadius: 10, border: "none", cursor: "pointer" }}>
            REQUEST PAYOUT
          </button>
        </div>
      </section>
    </main>
  );
}
