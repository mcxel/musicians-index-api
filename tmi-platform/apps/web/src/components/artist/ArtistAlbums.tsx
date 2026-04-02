"use client";
import { motion } from "framer-motion";

const STUB_ALBUMS = [
  { title: "Crown Season Vol. 3", year: "2026", tracks: 12, color: "#00FFFF" },
  { title: "Midnight Frequencies", year: "2025", tracks: 10, color: "#FF2DAA" },
  { title: "The Vault Sessions", year: "2024", tracks: 8, color: "#AA2DFF" },
  { title: "Origins", year: "2023", tracks: 14, color: "#FFD700" },
];

export default function ArtistAlbums() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "20px 24px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
        DISCOGRAPHY
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {STUB_ALBUMS.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4, boxShadow: `0 8px 24px ${a.color}25` }}
            style={{
              borderRadius: 8, overflow: "hidden",
              border: `1px solid ${a.color}20`, cursor: "pointer",
              background: "#0A0A14",
            }}
          >
            <div style={{
              height: 80,
              background: `linear-gradient(135deg, ${a.color}18 0%, #000 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 24, color: `${a.color}60` }}>♫</span>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "white", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{a.year} · {a.tracks} tracks</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
