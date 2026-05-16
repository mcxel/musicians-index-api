"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const TARGETING_OPTIONS = ["Hip-Hop", "R&B", "Battle Rap", "Cypher", "Afrobeats", "Trap", "All Genres"];
const BUDGET_TIERS = [
  { label: "$250 / wk", tag: "Starter", accent: "#00FFFF" },
  { label: "$850 / wk", tag: "Growth", accent: "#FFD700" },
  { label: "$2,400 / wk", tag: "Pro", accent: "#FF2DAA" },
];

export default function HomePage05CampaignBuilder() {
  return (
    <div style={{
      borderRadius: 10,
      border: "1px solid rgba(255,213,0,0.18)",
      background: "rgba(255,213,0,0.04)",
      padding: "10px 12px",
    }}>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "#FFD700", textTransform: "uppercase", marginBottom: 8 }}>
        CAMPAIGN BUILDER
      </div>

      {/* Genre targeting row */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          GENRE TARGET
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TARGETING_OPTIONS.slice(0, 5).map((g) => (
            <span
              key={g}
              style={{
                padding: "2px 7px", borderRadius: 999,
                border: "1px solid rgba(255,213,0,0.2)", background: "rgba(255,213,0,0.06)",
                fontSize: 6, color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Budget tiers */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          BUDGET
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {BUDGET_TIERS.map((b) => (
            <div key={b.tag} style={{
              flex: 1, borderRadius: 7, border: `1px solid ${b.accent}33`, background: `${b.accent}08`,
              padding: "5px 6px", textAlign: "center",
            }}>
              <div style={{ fontSize: 7, fontWeight: 900, color: b.accent }}>{b.label}</div>
              <div style={{ fontSize: 6, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>{b.tag}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Launch CTA */}
      <Link href="/advertise" style={{ textDecoration: "none", display: "block" }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: "9px", borderRadius: 8, textAlign: "center",
            background: "linear-gradient(90deg, #FFD700, #FF6B35)",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "#000", textTransform: "uppercase" }}>
            ⚡ LAUNCH CAMPAIGN
          </span>
        </motion.div>
      </Link>
    </div>
  );
}
