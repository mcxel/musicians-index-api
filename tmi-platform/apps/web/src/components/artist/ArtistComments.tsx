"use client";
import { motion } from "framer-motion";

const STUB_COMMENTS = [
  { user: "CROWN_FAN", text: "The Crown Season Vol. 3 is a straight masterpiece. No skips.", time: "2h ago", color: "#FFD700" },
  { user: "SOUL_VIBES", text: "Caught the live set last week — energy was unreal. 🔥", time: "5h ago", color: "#FF2DAA" },
  { user: "BEATMAKER_X", text: "Production on Midnight Frequencies hits different every listen.", time: "1d ago", color: "#00FFFF" },
  { user: "TMI_WEEKLY", text: "One of the most consistent artists on the platform right now.", time: "2d ago", color: "#AA2DFF" },
];

export default function ArtistComments() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "20px 24px", marginBottom: 20,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
      }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
          FAN WALL
        </div>
        <button style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", background: "none",
          border: "1px solid rgba(0,255,255,0.3)", color: "#00FFFF", borderRadius: 4,
          padding: "4px 12px", cursor: "pointer",
        }}>+ LEAVE A COMMENT</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {STUB_COMMENTS.map((c, i) => (
          <motion.div
            key={c.user + i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: `${c.color}20`, border: `1px solid ${c.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 900, color: c.color,
            }}>{c.user.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: c.color, letterSpacing: "0.08em" }}>{c.user}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{c.text}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
