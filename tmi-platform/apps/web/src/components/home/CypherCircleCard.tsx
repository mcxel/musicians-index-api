"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MotionPortraitCard from "@/components/cards/MotionPortraitCard";

// CypherCircleCard — host rendered in center, participants on orbit ring
// Distinct from CypherCircle (which puts all on ring with no host-center)

export type CypherParticipant = {
  id: string;
  name: string;
  image?: string;
  accentColor?: string;
  role?: string;
  isHost?: boolean;
};

export type CypherCircleCardProps = {
  genre: string;
  instrumentBadge: string;
  beatBadge: string;
  host: CypherParticipant;
  participants: CypherParticipant[];
  isLive?: boolean;
  joinHref?: string;
  accentColor?: string;
};

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function CypherCircleCard({
  genre,
  instrumentBadge,
  beatBadge,
  host,
  participants,
  isLive = false,
  joinHref = "/cypher",
  accentColor = "#AA2DFF",
}: CypherCircleCardProps) {
  const orbCount = Math.min(participants.length, 6);
  const orb = participants.slice(0, orbCount);

  return (
    <div style={{
      borderRadius: 14, overflow: "hidden",
      border: `1.5px solid ${accentColor}2a`,
      background: `linear-gradient(135deg, ${accentColor}0c 0%, rgba(0,0,0,0) 100%)`,
    }}>
      {/* Header: instrument + genre + beat badges */}
      <div style={{
        padding: "6px 12px",
        background: "rgba(0,0,0,0.55)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.26em", color: accentColor, textTransform: "uppercase" }}>
            {instrumentBadge}
          </span>
          <span style={{
            padding: "1px 7px", borderRadius: 999,
            border: `1px solid ${accentColor}44`, background: `${accentColor}12`,
            fontSize: 6, fontWeight: 900, letterSpacing: "0.18em", color: accentColor, textTransform: "uppercase",
          }}>
            {genre}
          </span>
          <span style={{
            padding: "1px 7px", borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)",
            fontSize: 6, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            {beatBadge}
          </span>
        </div>
        {isLive && (
          <motion.span
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: "#FF2DAA", textTransform: "uppercase" }}
          >
            ● LIVE
          </motion.span>
        )}
      </div>

      {/* Circle area */}
      <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", gap: 16 }}>
        {/* Circle formation: host center + participants orbit */}
        <div style={{ position: "relative", width: 148, height: 148, flexShrink: 0 }}>
          {/* Orbit ring */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 124, height: 124,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `1px solid ${accentColor}22`,
            boxShadow: `0 0 20px ${accentColor}0a inset`,
          }} />

          {/* Ambient center glow */}
          <motion.div
            animate={{ opacity: [0.08, 0.2, 0.08], scale: [0.85, 1.1, 0.85] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", top: "50%", left: "50%",
              width: 52, height: 52,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${host.accentColor ?? accentColor}66 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          {/* Host — center */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}>
            <MotionPortraitCard
              name={host.name}
              image={host.image}
              accent={host.accentColor ?? accentColor}
              size={46}
              isLive={isLive}
              showLabel={false}
            />
          </div>

          {/* Participants — orbit ring */}
          {orb.map((p, i) => {
            const angle = (360 / orbCount) * i - 90;
            const rad = (angle * Math.PI) / 180;
            const x = 50 + Math.cos(rad) * 41;
            const y = 50 + Math.sin(rad) * 41;
            const pAccent = p.accentColor ?? "#00FFFF";

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 + i * 0.08, duration: 0.28, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 38% 36%, ${pAccent}55, ${pAccent}18)`,
                  border: `1.5px solid ${pAccent}44`,
                  boxShadow: `0 0 8px ${pAccent}1a`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >
                <span style={{ fontSize: 8, fontWeight: 900, color: pAccent }}>{initials(p.name)}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Info panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Host spotlight */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: accentColor, textTransform: "uppercase", marginBottom: 3 }}>
              ● HOST
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{host.name}</div>
            {host.role && (
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{host.role}</div>
            )}
          </div>

          {/* Participant queue */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 6, letterSpacing: "0.18em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 4 }}>
              PERFORMERS · {orb.length}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {orb.map((p) => (
                <span
                  key={p.id}
                  style={{
                    fontSize: 7, fontWeight: 900,
                    color: p.accentColor ?? "rgba(255,255,255,0.45)",
                  }}
                >
                  {p.name.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Slot count */}
          <div style={{
            padding: "4px 8px", borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)",
          }}>
            <span style={{ fontSize: 6, color: "rgba(255,255,255,0.28)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Open slots · {Math.max(0, 6 - orb.length)} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Join CTA */}
      <Link href={joinHref} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          padding: "8px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.28)" }}>
            {isLive ? "Session live now" : "Open · All welcome"}
          </span>
          <motion.span
            whileHover={{ scale: 1.04 }}
            style={{
              padding: "4px 14px", borderRadius: 999,
              border: `1px solid ${accentColor}55`, background: `${accentColor}14`,
              fontSize: 7, fontWeight: 900, letterSpacing: "0.16em", color: accentColor, textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Join Cypher
          </motion.span>
        </div>
      </Link>
    </div>
  );
}
