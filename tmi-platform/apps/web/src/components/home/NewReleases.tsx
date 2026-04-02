"use client";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

const RELEASES = [
  { artist: "NOVA REIGN", title: "Frequencies", genre: "Neo-Soul", date: "Apr 1", color: "#FF2DAA" },
  { artist: "JAYLEN CROSS", title: "Crown Season Vol. 3", genre: "Hip-Hop", date: "Mar 28", color: "#00FFFF" },
  { artist: "DIANA CROSS", title: "Mirror Language", genre: "R&B", date: "Mar 25", color: "#AA2DFF" },
  { artist: "CYPHER KINGS", title: "Underground Atlas", genre: "Trap", date: "Mar 22", color: "#FFD700" },
  { artist: "AMIRAH WELLS", title: "Midnight Frequencies", genre: "R&B / Soul", date: "Mar 20", color: "#2DFFAA" },
  { artist: "DESTINED", title: "Unwritten Maps", genre: "Neo-Soul", date: "Mar 18", color: "#FF6B2D" },
];

export default function NewReleases() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0A0810 0%, #0A0A18 100%)",
      border: "1px solid rgba(170,45,255,0.2)",
      borderRadius: 12,
      padding: "22px 24px",
      marginBottom: 20,
      boxShadow: "0 0 40px rgba(170,45,255,0.04)",
    }}>
      <SectionTitle title="New Releases" subtitle="Fresh drops this week" accent="purple" badge="THIS WEEK" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {RELEASES.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: `0 8px 30px ${r.color}30` }}
            style={{
              background: "#0D0D18",
              border: `1px solid ${r.color}25`,
              borderRadius: 10,
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <div style={{
              height: 80,
              background: `linear-gradient(135deg, ${r.color}20 0%, #000 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${r.color}60`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 0, height: 0, borderLeft: `12px solid ${r.color}`, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", marginLeft: 3 }} />
              </div>
              <div style={{ position: "absolute", top: 6, right: 8, fontSize: 8, color: r.color, fontWeight: 700, letterSpacing: "0.1em" }}>
                {r.date}
              </div>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "white", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.title}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{r.artist}</div>
              <div style={{ fontSize: 8, color: r.color, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{r.genre}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ textAlign: "right", marginTop: 14 }}>
        <Link href="/releases" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#AA2DFF", textDecoration: "none", border: "1px solid rgba(170,45,255,0.3)", padding: "5px 14px", borderRadius: 4 }}>
          See All Releases →
        </Link>
      </div>
    </div>
  );
}
