"use client";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

const STATS = [
  { label: "Followers", value: "142K" },
  { label: "Releases", value: "28" },
  { label: "Live Shows", value: "6" },
];

export default function FeaturedArtist() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0A0A12 0%, #0D0D1C 100%)",
      border: "1px solid rgba(0,255,255,0.2)",
      borderRadius: 12,
      padding: "24px",
      boxShadow: "0 0 30px rgba(0,255,255,0.05)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "radial-gradient(ellipse, rgba(170,45,255,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <SectionTitle title="Featured Artist" accent="cyan" badge="This Issue" />

      <div style={{ display: "flex", gap: 18, position: "relative", zIndex: 1 }}>
        {/* Avatar placeholder */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <motion.div
            animate={{ boxShadow: ["0 0 15px rgba(0,255,255,0.3)", "0 0 30px rgba(0,255,255,0.5)", "0 0 15px rgba(0,255,255,0.3)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              width: 90, height: 90, borderRadius: 10,
              background: "linear-gradient(135deg, #1A1A2E, #0F3460)",
              border: "2px solid rgba(0,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32,
            }}
          >
            🎵
          </motion.div>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: "absolute", bottom: -4, right: -4,
              fontSize: 8, fontWeight: 700, letterSpacing: "0.1em",
              background: "#00FF99", color: "#000",
              padding: "2px 6px", borderRadius: 3,
            }}
          >
            ● LIVE
          </motion.div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: "#00FFFF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Artist Spotlight</div>
          <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: "white" }}>NOVA REIGN</h3>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Neo-Soul · Los Angeles, CA</div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            Redefining the soul genre with cinematic production and raw lyricism. Her debut album dropped to critical acclaim.
          </p>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#00FFFF" }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <Link href="/artists/nova-reign" style={{
            display: "inline-block", padding: "7px 18px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
            border: "1px solid rgba(0,255,255,0.4)", color: "#00FFFF", borderRadius: 5,
          }}>
            View Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
