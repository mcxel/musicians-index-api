"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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

const LEDGER: LedgerEntry[] = [
  { id: "l1", prize: "Crown Champion",   winner: "KOVA",          event: "Crown Duel Night",   date: "May 3",  value: "$12,500", color: "#FFD700", href: "/artists/kova" },
  { id: "l2", prize: "Beat Bundle",      winner: "BeatArchitect", event: "Producer Cypher",    date: "Apr 28", value: "$850",    color: "#FF6B35", href: "/cypher" },
  { id: "l3", prize: "NFT Drop",         winner: "Nera Vex",      event: "R&B Spotlight",      date: "Apr 21", value: "1 NFT",   color: "#AA2DFF", href: "/artists/nera-vex" },
  { id: "l4", prize: "Feature Slot",     winner: "Drift Sound",   event: "Guitar Battle",      date: "Apr 14", value: "1 Wk",   color: "#00FFFF", href: "/cypher" },
  { id: "l5", prize: "Venue Booking",    winner: "Solara",        event: "Open Cypher",        date: "Apr 7",  value: "1 Show", color: "#00FF88", href: "/artists/solara" },
  { id: "l6", prize: "Studio Session",   winner: "Bass.Nero",     event: "Trap Cypher",        date: "Mar 31", value: "4 Hrs",  color: "#FF2DAA", href: "/cypher" },
];

const SEASON_TOTAL = "$14,625+";

export default function PrizeLedgerPanel() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
          PRIZE LEDGER · SEASON 1
        </div>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        <span style={{ fontSize: 7, fontWeight: 900, color: "#FFD700" }}>{SEASON_TOTAL}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {LEDGER.map((entry, i) => (
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
                {/* Color pip */}
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                {/* Prize + winner */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 8, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>{entry.winner}</div>
                  <div style={{ fontSize: 6, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>{entry.prize} · {entry.event}</div>
                </div>
                {/* Value + date */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: entry.color }}>{entry.value}</div>
                  <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)" }}>{entry.date}</div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Season total bar */}
      <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,215,0,0.2)", background: "rgba(255,215,0,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: "#FFD700" }}>👑</span>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.45)" }}>Season 1 Prize Pool Distributed</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, fontWeight: 900, color: "#FFD700" }}>{SEASON_TOTAL}</span>
      </div>
    </div>
  );
}
