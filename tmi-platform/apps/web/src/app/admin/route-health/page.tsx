"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HealthRow = {
  route: string;
  status: "ok" | "warn";
  latencyMs: number;
};

const ROUTES = [
  "/admin",
  "/admin/style-debug",
  "/admin/observatory",
  "/home/1",
  "/home/2",
  "/home/3",
  "/home/4",
  "/home/5",
  "/artists/onyx-lyric",
] as const;

export default function AdminRouteHealthPage() {
  const [rows, setRows] = useState<HealthRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const next: HealthRow[] = [];
      for (const route of ROUTES) {
        const start = performance.now();
        try {
          const res = await fetch(route, { method: "GET" });
          const elapsed = Math.round(performance.now() - start);
          next.push({ route, status: res.ok ? "ok" : "warn", latencyMs: elapsed });
        } catch {
          const elapsed = Math.round(performance.now() - start);
          next.push({ route, status: "warn", latencyMs: elapsed });
        }
      }
      if (!cancelled) setRows(next);
    };

    void run();
    const id = window.setInterval(run, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const warnCount = rows.filter((r) => r.status !== "ok").length;

  return (
    <main style={{ minHeight: "100vh", background: "#0b0a14", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Admin Route Health</h1>
      <p style={{ opacity: 0.78 }}>Live route probe for admin and home surfaces.</p>
      <div style={{ marginBottom: 16 }}>
        <Link href="/admin" style={{ color: "#facc15", textDecoration: "none" }}>← Back to Overseer Deck</Link>
      </div>

      <div style={{
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 12,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
        marginBottom: 14,
      }}>
        <strong>Warnings:</strong> {warnCount}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((row) => (
          <div key={row.route} style={{
            display: "flex",
            justifyContent: "space-between",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: "10px 12px",
            background: row.status === "ok" ? "rgba(34,197,94,0.08)" : "rgba(249,115,22,0.08)",
          }}>
            <span>{row.route}</span>
            <span style={{ color: row.status === "ok" ? "#22c55e" : "#f97316", fontWeight: 700 }}>
              {row.status.toUpperCase()} · {row.latencyMs}ms
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
