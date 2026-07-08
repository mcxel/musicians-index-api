"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BillboardRow = {
  id: string;
  name: string;
  wins: number;
  losses: number;
  fans: number;
  winRate: number;
  score: number;
};

export default function BillboardBoard() {
  const [rows, setRows] = useState<BillboardRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/billboard/rankings?column=best_battle&limit=10")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.ok) setRows(data.rows ?? []);
        else setError(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ color: "#f4f1ff" }}>Billboard</h1>
      <p style={{ color: "rgba(245,239,255,0.65)", marginBottom: 20 }}>
        Top performers ranked by real battle wins and fan count.
      </p>

      {rows === null && !error && (
        <div style={{ color: "rgba(245,239,255,0.55)", fontSize: 13 }}>Loading rankings…</div>
      )}

      {error && (
        <div style={{ color: "rgba(245,239,255,0.55)", fontSize: 13 }}>
          Unable to load rankings right now. Retry shortly.
        </div>
      )}

      {rows !== null && !error && rows.length === 0 && (
        <div style={{ color: "rgba(245,239,255,0.55)", fontSize: 13 }}>
          No ranked performers yet — rankings populate as battles are won.
        </div>
      )}

      {rows !== null && rows.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          {rows.map((row, i) => (
            <Link
              key={row.id}
              href={`/performers/${row.id}`}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#f4f1ff",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: "#00FFFF", width: 24 }}>#{i + 1}</span>
              <span style={{ fontWeight: 700, flex: 1 }}>{row.name}</span>
              <span style={{ fontSize: 12, color: "rgba(245,239,255,0.6)" }}>
                {row.wins}W · {row.fans} fans
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
