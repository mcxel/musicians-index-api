"use client";
import { motion } from "framer-motion";

const BACKSTAGE_CREW = [
  { role: "DJ / Producer", name: "DJ Phantasm", status: "ON DECK", color: "#00FFFF" },
  { role: "Sound Engineer", name: "Marcus L.", status: "READY", color: "#FF2DAA" },
  { role: "Stage Manager", name: "Keisha T.", status: "STANDBY", color: "#FFD700" },
  { role: "Lighting Dir.", name: "Axel V.", status: "READY", color: "#AA2DFF" },
];

const BACKSTAGE_CHECKLIST = [
  { label: "Mic check complete", done: true },
  { label: "Setlist confirmed", done: true },
  { label: "Guest list locked", done: true },
  { label: "Monitor mix approved", done: false },
  { label: "VIP area prepped", done: false },
];

export default function ArtistBackstageRail() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(0,255,255,0.04) 0%, rgba(0,0,0,0) 100%)",
        border: "1px solid rgba(0,255,255,0.12)",
        borderLeft: "3px solid #00FFFF",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#00FFFF" }}>
          ◈ BACKSTAGE
        </div>
        <div
          style={{
            fontSize: 8, fontWeight: 900, letterSpacing: "0.18em",
            color: "#00FFFF", padding: "2px 8px", borderRadius: 4,
            border: "1px solid rgba(0,255,255,0.3)",
            background: "rgba(0,255,255,0.07)",
            animation: "pulse 2s infinite",
          }}
        >
          LIVE
        </div>
      </div>

      {/* Crew grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
        {BACKSTAGE_CREW.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: `rgba(${member.color === "#00FFFF" ? "0,255,255" : member.color === "#FF2DAA" ? "255,45,170" : member.color === "#FFD700" ? "255,215,0" : "170,45,255"},0.05)`,
              border: `1px solid ${member.color}18`,
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: member.color, textTransform: "uppercase", marginBottom: 4 }}>
              {member.role}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>
              {member.name}
            </div>
            <div
              style={{
                display: "inline-block", fontSize: 7, fontWeight: 900,
                letterSpacing: "0.15em", color: member.color,
                border: `1px solid ${member.color}35`, borderRadius: 3,
                padding: "1px 6px",
              }}
            >
              {member.status}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pre-show checklist */}
      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
        PRE-SHOW CHECKLIST
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {BACKSTAGE_CHECKLIST.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                background: item.done ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.04)",
                border: item.done ? "1px solid rgba(0,255,255,0.5)" : "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, color: "#00FFFF",
              }}
            >
              {item.done ? "✓" : ""}
            </div>
            <span style={{ fontSize: 11, color: item.done ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", textDecoration: item.done ? "none" : "none" }}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
