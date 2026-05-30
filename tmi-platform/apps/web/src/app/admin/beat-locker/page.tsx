"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

type Beat = {
  id: string;
  title: string;
  producer: string;
  genre: string;
  bpm: number;
  price: number;
  tags: string[];
  previewUrl: string;
  available: boolean;
};

type LockerBeat = {
  id: string;
  creatorId: string;
  title: string;
  genre: string;
  bpm: number;
  energyScore: number;
  destination: string;
  status: string;
  votes: number;
  plays: number;
  createdAt: number;
};

function StatusBadge({ status, available }: { status?: string; available?: boolean }) {
  const active = available !== undefined ? available : status === "queued" || status === "playing";
  const label = available !== undefined ? (available ? "AVAILABLE" : "UNAVAILABLE") : (status ?? "—").toUpperCase();
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10,
      letterSpacing: "0.1em",
      background: active ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
      border: `1px solid ${active ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
      color: active ? "#86efac" : "#fca5a5",
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#22c55e" : "#ef4444" }} />
      {label}
    </div>
  );
}

function BeatRow({ beat, type }: { beat: Beat | LockerBeat; type: "catalog" | "locker" }) {
  if (type === "catalog") {
    const b = beat as Beat;
    return (
      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{b.title}</td>
        <td style={{ padding: "10px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{b.producer}</td>
        <td style={{ padding: "10px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{b.genre}</td>
        <td style={{ padding: "10px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{b.bpm}</td>
        <td style={{ padding: "10px 8px", fontSize: 11, fontWeight: 700, color: "#fde68a", textAlign: "right" }}>${b.price}</td>
        <td style={{ padding: "10px 8px", textAlign: "center" }}><StatusBadge available={b.available} /></td>
        <td style={{ padding: "10px 8px", fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
          {b.tags.slice(0, 2).join(", ")}
        </td>
      </tr>
    );
  }
  const b = beat as LockerBeat;
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{b.title}</td>
      <td style={{ padding: "10px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{b.genre}</td>
      <td style={{ padding: "10px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{b.bpm}</td>
      <td style={{ padding: "10px 8px", textAlign: "center" }}><StatusBadge status={b.status} /></td>
      <td style={{ padding: "10px 8px", fontSize: 11, color: "#f59e0b", textAlign: "center" }}>↑ {b.votes}</td>
      <td style={{ padding: "10px 8px", fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>▶ {b.plays}</td>
      <td style={{ padding: "10px 8px", fontSize: 9, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
        {b.destination.toUpperCase()}
      </td>
    </tr>
  );
}

export default function BeatLockerAdminPage() {
  const [catalogBeats, setCatalogBeats] = useState<Beat[]>([]);
  const [lockerBeats, setLockerBeats] = useState<LockerBeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"catalog" | "locker">("catalog");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, lockRes] = await Promise.all([
        fetch("/api/beats/list"),
        fetch("/api/beats/ingest?view=all").catch(() => null),
      ]);
      const catData = await catRes.json();
      if (catData.beats) setCatalogBeats(catData.beats);
      if (lockRes) {
        const lockData = await lockRes.json().catch(() => null);
        if (lockData?.beats) setLockerBeats(lockData.beats);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const catalogAvailable = catalogBeats.filter((b) => b.available).length;
  const lockerQueued = lockerBeats.filter((b) => b.status === "queued").length;

  return (
    <main style={{ minHeight: "100vh", background: "#020209", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            style={{ fontSize: 22 }}
          >
            🔒
          </motion.div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "0.06em", color: "#f59e0b" }}>
              BEAT LOCKER
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Overseer Control — Beat Catalog + Locker Queue
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <a href="/admin/mission-control" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← Mission Control</a>
          </div>
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total Beats", value: catalogBeats.length, color: "#818cf8" },
            { label: "Available", value: catalogAvailable, color: "#22c55e" },
            { label: "Queued in Locker", value: lockerQueued, color: "#f59e0b" },
            { label: "Total Locker Entries", value: lockerBeats.length, color: "#60a5fa" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "8px 16px", borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", flexDirection: "column", gap: 2,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", width: "fit-content" }}>
          {(["catalog", "locker"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
                textTransform: "uppercase", cursor: "pointer", border: "none",
                background: tab === t ? "rgba(245,158,11,0.2)" : "transparent",
                color: tab === t ? "#fde68a" : "rgba(255,255,255,0.35)",
                transition: "all 0.15s",
              }}
            >
              {t === "catalog" ? "🎵 Catalog" : "🔒 Live Locker"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, overflow: "hidden",
          background: "rgba(10,10,20,0.8)",
        }}>
          {loading ? (
            <div style={{ padding: 24, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Loading beats…</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {tab === "catalog" ? (
                    <>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Title</th>
                      <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Producer</th>
                      <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Genre</th>
                      <th style={{ padding: "10px 8px", textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>BPM</th>
                      <th style={{ padding: "10px 8px", textAlign: "right", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Price</th>
                      <th style={{ padding: "10px 8px", textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "10px 8px", textAlign: "right", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Tags</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Title</th>
                      <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Genre</th>
                      <th style={{ padding: "10px 8px", textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>BPM</th>
                      <th style={{ padding: "10px 8px", textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "10px 8px", textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Votes</th>
                      <th style={{ padding: "10px 8px", textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Plays</th>
                      <th style={{ padding: "10px 8px", textAlign: "right", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Dest</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {tab === "catalog" && (
                  catalogBeats.length === 0
                    ? <tr><td colSpan={7} style={{ padding: 24, color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center" }}>No beats in catalog</td></tr>
                    : catalogBeats.map((b) => <BeatRow key={b.id} beat={b} type="catalog" />)
                )}
                {tab === "locker" && (
                  lockerBeats.length === 0
                    ? <tr><td colSpan={7} style={{ padding: 24, color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center" }}>Beat Locker queue is empty</td></tr>
                    : lockerBeats.map((b) => <BeatRow key={b.id} beat={b} type="locker" />)
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { label: "Beat Marketplace", href: "/beats" },
            { label: "Beat Submission API", href: "/api/beats/submit" },
            { label: "World Dance Party", href: "/rooms/world-dance-party" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                padding: "7px 14px", borderRadius: 7, fontSize: 10, fontWeight: 700,
                border: "1px solid rgba(245,158,11,0.25)", color: "#fde68a",
                textDecoration: "none", letterSpacing: "0.06em",
                background: "rgba(245,158,11,0.05)",
              }}
            >
              {item.label} ›
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
