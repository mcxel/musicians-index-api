"use client";
import { motion } from "framer-motion";

const STUB_SHOWS = [
  { date: "Apr 10, 2026", title: "TMI Crown Night", venue: "Cypher Arena, Atlanta", status: "UPCOMING", color: "#FFD700" },
  { date: "Apr 25, 2026", title: "Underground Sessions", venue: "The Vault, NYC", status: "UPCOMING", color: "#00FFFF" },
  { date: "May 12, 2026", title: "Neo-Soul Weekend", venue: "Frequency Hall, LA", status: "UPCOMING", color: "#FF2DAA" },
];

export default function ArtistShows() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "20px 24px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
        UPCOMING SHOWS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {STUB_SHOWS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "14px 16px", borderRadius: 8,
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${s.color}15`,
            }}
          >
            <div style={{
              width: 52, flexShrink: 0, textAlign: "center",
              fontSize: 9, fontWeight: 800, letterSpacing: "0.05em",
              color: s.color, lineHeight: 1.4,
            }}>
              {s.date.split(",")[0]}
            </div>
            <div style={{ width: 1, height: 36, background: `${s.color}25`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.venue}</div>
            </div>
            <div style={{
              fontSize: 8, fontWeight: 800, letterSpacing: "0.15em", color: s.color,
              border: `1px solid ${s.color}40`, borderRadius: 4, padding: "3px 8px", flexShrink: 0,
            }}>{s.status}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
