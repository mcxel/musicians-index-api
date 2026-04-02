"use client";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

const CHART = [
  { rank: 1, title: "Crown Season Vol. 3", artist: "Jaylen Cross", genre: "Hip-Hop", change: "up", plays: "1.2M" },
  { rank: 2, title: "Midnight Frequencies", artist: "Amirah Wells", genre: "R&B", change: "up", plays: "980K" },
  { rank: 3, title: "Neon Cathedral", artist: "DESTINED", genre: "Neo-Soul", change: "same", plays: "876K" },
  { rank: 4, title: "Velocity", artist: "Traxx Monroe", genre: "Trap", change: "up", plays: "742K" },
  { rank: 5, title: "Golden Years", artist: "Savannah J.", genre: "Soul", change: "down", plays: "690K" },
  { rank: 6, title: "Unwritten Maps", artist: "Nova Reign", genre: "Afrobeats", change: "up", plays: "644K" },
  { rank: 7, title: "Mirror Language", artist: "Diana Cross", genre: "Pop", change: "down", plays: "590K" },
  { rank: 8, title: "Deep Cuts", artist: "The Cyphers", genre: "Rap", change: "same", plays: "541K" },
  { rank: 9, title: "Late Night Studio", artist: "Khalil B.", genre: "Lo-Fi", change: "up", plays: "488K" },
  { rank: 10, title: "Frequency Wars", artist: "Static & Bloom", genre: "Electronic", change: "new", plays: "412K" },
];

const CHANGE_COLORS: Record<string, string> = { up: "#00FF99", down: "#FF4466", same: "rgba(255,255,255,0.3)", new: "#FFD700" };
const CHANGE_ICONS: Record<string, string> = { up: "▲", down: "▼", same: "–", new: "★" };

export default function Top10Chart() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0A0A12 0%, #0D0A18 100%)",
      border: "1px solid rgba(255,45,170,0.2)",
      borderRadius: 12,
      padding: "24px 24px 20px",
      boxShadow: "0 0 30px rgba(255,45,170,0.06)",
    }}>
      <SectionTitle title="Top 10 Chart" accent="pink" badge="This Week" />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {CHART.map((song, i) => (
          <motion.div
            key={song.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 10px", borderRadius: 6,
              background: song.rank <= 3 ? "rgba(255,45,170,0.06)" : "transparent",
              border: song.rank === 1 ? "1px solid rgba(255,215,0,0.15)" : "1px solid transparent",
              cursor: "pointer",
            }}
          >
            {/* Rank */}
            <div style={{
              width: 28, flexShrink: 0, textAlign: "center",
              fontSize: song.rank <= 3 ? 16 : 12,
              fontWeight: 900,
              color: song.rank === 1 ? "#FFD700" : song.rank <= 3 ? "#FF2DAA" : "rgba(255,255,255,0.3)",
            }}>
              {song.rank}
            </div>
            {/* Bar */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", flexShrink: 0, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${100 - (song.rank - 1) * 9}%` }}
                transition={{ delay: i * 0.05 + 0.3, duration: 0.6 }}
                style={{ height: "100%", background: song.rank === 1 ? "#FFD700" : "#FF2DAA", borderRadius: 2 }}
              />
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{song.artist} · {song.genre}</div>
            </div>
            {/* Plays */}
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{song.plays}</div>
            {/* Change */}
            <div style={{ fontSize: 10, color: CHANGE_COLORS[song.change], width: 16, textAlign: "center", flexShrink: 0 }}>
              {CHANGE_ICONS[song.change]}
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
        <Link href="/top-10" style={{ fontSize: 10, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.1em", fontWeight: 600 }}>
          Full Chart →
        </Link>
      </div>
    </div>
  );
}
