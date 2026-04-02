"use client";
import { motion } from "framer-motion";

const STUB_SPONSORS = [
  { name: "AMPLIFY RECORDS", tier: "PLATINUM", color: "#E0E0FF" },
  { name: "BEATLAB STUDIOS", tier: "GOLD", color: "#FFD700" },
  { name: "NOVA MEDIA GROUP", tier: "SILVER", color: "#C0C0C0" },
];

export default function ArtistSponsors() {
  if (STUB_SPONSORS.length === 0) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "20px 24px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
        SPONSORS
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {STUB_SPONSORS.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.04 }}
            style={{
              padding: "10px 18px", borderRadius: 8,
              border: `1px solid ${s.color}30`,
              background: `${s.color}08`,
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", color: `${s.color}70`, marginBottom: 3 }}>{s.tier}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: "0.08em" }}>{s.name}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
