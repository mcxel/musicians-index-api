"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Zone = {
  id: string;
  label: string;
  activity: number;   // 0–10
  color: string;
  href: string;
};

const ZONES: Zone[] = [
  { id: "z1",  label: "R&B",     activity: 9,  color: "#FF2DAA", href: "/cypher" },
  { id: "z2",  label: "Trap",    activity: 7,  color: "#AA2DFF", href: "/cypher" },
  { id: "z3",  label: "Rock",    activity: 4,  color: "#00FFFF", href: "/cypher" },
  { id: "z4",  label: "Afro",    activity: 8,  color: "#FFD700", href: "/cypher" },
  { id: "z5",  label: "Gospel",  activity: 5,  color: "#00FF88", href: "/cypher" },
  { id: "z6",  label: "Jazz",    activity: 6,  color: "#FF6B35", href: "/cypher" },
  { id: "z7",  label: "Country", activity: 2,  color: "#00FFFF", href: "/cypher" },
  { id: "z8",  label: "Open",    activity: 3,  color: "#AA2DFF", href: "/lobbies" },
  { id: "z9",  label: "Prod",    activity: 7,  color: "#FFD700", href: "/cypher" },
  { id: "z10", label: "Guitar",  activity: 5,  color: "#FF2DAA", href: "/cypher" },
  { id: "z11", label: "Battle",  activity: 10, color: "#CC0000", href: "/battles" },
  { id: "z12", label: "Crown",   activity: 9,  color: "#FFD700", href: "/battles" },
  { id: "z13", label: "Lobby 1", activity: 4,  color: "#00FFFF", href: "/lobbies" },
  { id: "z14", label: "Lobby 2", activity: 3,  color: "#00FF88", href: "/lobbies" },
  { id: "z15", label: "Stage",   activity: 6,  color: "#FF2DAA", href: "/events/monday-night-stage" },
  { id: "z16", label: "Arena",   activity: 8,  color: "#CC0000", href: "/battles" },
];

function heatColor(activity: number, base: string): string {
  const alpha = Math.round((activity / 10) * 0.55 * 100).toString(16).padStart(2, "0");
  return `${base}${alpha}`;
}

export default function PresenceHeatMap() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 6px #00FF88", flexShrink: 0 }}
        />
        <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
          PRESENCE HEAT MAP
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
        {ZONES.map((zone, i) => (
          <Link key={zone.id} href={zone.href} style={{ textDecoration: "none" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.06 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              style={{
                position: "relative", borderRadius: 6,
                border: `1px solid ${zone.color}${Math.round((zone.activity / 10) * 55).toString(16).padStart(2, "0")}`,
                background: heatColor(zone.activity, zone.color),
                padding: "5px 4px",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              {/* Activity glow on hot zones */}
              {zone.activity >= 8 && (
                <motion.div
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                  style={{ position: "absolute", inset: 0, borderRadius: 6, border: `1px solid ${zone.color}`, pointerEvents: "none" }}
                />
              )}
              <div style={{ fontSize: 6, fontWeight: 900, color: zone.activity >= 6 ? zone.color : "rgba(255,255,255,0.45)", letterSpacing: "0.06em" }}>
                {zone.label}
              </div>
              {/* Occupancy dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: 1, marginTop: 3 }}>
                {Array.from({ length: Math.min(zone.activity, 5) }, (_, k) => (
                  <div key={k} style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: zone.color }} />
                ))}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {[1, 3, 5, 7, 10].map((v) => (
            <div key={v} style={{ width: 10, height: 5, borderRadius: 2, background: `rgba(255,45,170,${v / 10 * 0.55})` }} />
          ))}
        </div>
        <span style={{ fontSize: 5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>LOW → HOT</span>
      </div>
    </div>
  );
}
