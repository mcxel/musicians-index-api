"use client";
import { motion } from "framer-motion";

const STUB_VIDEOS = [
  { title: "Crown Season Vol. 3 — Official Video", views: "2.1M", duration: "4:22", color: "#FF2DAA" },
  { title: "Midnight Frequencies — Lyric Video", views: "980K", duration: "3:55", color: "#00FFFF" },
  { title: "Live at TMI Cypher Arena", views: "650K", duration: "12:08", color: "#AA2DFF" },
];

export default function ArtistVideos() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "20px 24px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
        VIDEOS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {STUB_VIDEOS.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 4 }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 14px", borderRadius: 8, cursor: "pointer",
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${v.color}18`,
            }}
          >
            <div style={{
              width: 64, height: 40, borderRadius: 6, flexShrink: 0,
              background: `linear-gradient(135deg, ${v.color}20 0%, #000 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${v.color}25`,
            }}>
              <span style={{ fontSize: 14, color: v.color }}>▶</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{v.views} views · {v.duration}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
