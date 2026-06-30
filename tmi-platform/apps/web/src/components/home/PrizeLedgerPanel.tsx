"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

type LedgerEntry = {
  id: string;
  prize: string;
  winner: string;
  event: string;
  date: string;
  value: string;
  color: string;
  href: string;
};

export default function PrizeLedgerPanel() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [seasonTotal, setSeasonTotal] = useState("$0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prizes/ledger")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!data || typeof data !== "object") {
          setLoading(false);
          return;
        }
        const d = data as { ledger?: any[]; seasonTotal?: string };
        if (Array.isArray(d.ledger)) {
          setLedger(d.ledger.slice(0, 6));
        }
        if (d.seasonTotal) {
          setSeasonTotal(d.seasonTotal);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
          PRIZE LEDGER · SEASON 1
        </div>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        <span style={{ fontSize: 7, fontWeight: 900, color: "#FFD700" }}>{seasonTotal}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {loading ? (
          <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            Loading prizes...
          </div>
        ) : ledger.length === 0 ? (
          <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            No prizes distributed yet.
          </div>
        ) : (
          ledger.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.22 }}
            >
              <Link href={entry.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px", borderRadius: 8,
                  border: `1px solid ${entry.color}1a`,
                  background: `${entry.color}06`,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 8, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>{entry.winner}</div>
                    <div style={{ fontSize: 6, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>{entry.prize} · {entry.event}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: entry.color }}>{entry.value}</div>
                    <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)" }}>{entry.date}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Season total bar */}
      {!loading && ledger.length > 0 && (
        <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,215,0,0.2)", background: "rgba(255,215,0,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: "#FFD700" }}>👑</span>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.45)" }}>Season 1 Prize Pool Distributed</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 9, fontWeight: 900, color: "#FFD700" }}>{seasonTotal}</span>
        </div>
      )}
    </div>
  );
}
