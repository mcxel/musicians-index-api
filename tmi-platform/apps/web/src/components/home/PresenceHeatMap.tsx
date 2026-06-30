"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

type Zone = {
  id: string;
  label: string;
  activity: number;   // 0–10
  color: string;
  href: string;
};

function heatColor(activity: number, base: string): string {
  const alpha = Math.round((activity / 10) * 0.55 * 100).toString(16).padStart(2, "0");
  return `${base}${alpha}`;
}

export default function PresenceHeatMap() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/presence/zones")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          setLoading(false);
          return;
        }
        setZones(
          (data as Array<any>).map((z) => ({
            id: z.id ?? "unknown",
            label: z.label ?? "Zone",
            activity: Math.min(10, Math.round(z.activity ?? 0)),
            color: z.color ?? "#00FFFF",
            href: z.href ?? "/lobbies",
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 6px #00FF88", flexShrink: 0 }}
        />
        <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
          {loading ? "LOADING" : zones.length === 0 ? "NO ZONES" : "PRESENCE HEAT MAP"}
        </div>
      </div>
      {loading ? (
        <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          Loading zones...
        </div>
      ) : zones.length === 0 ? (
        <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          No zones available.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
            {zones.map((zone, i) => (
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
        </>
      )}
    </div>
  );
}
