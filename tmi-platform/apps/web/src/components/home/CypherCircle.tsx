"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type CypherParticipant = {
  id: string;
  name: string;
  role: string;
  accentColor: string;
  isActive?: boolean;
  isHost?: boolean;
};

type CypherReward = {
  label: string;
  color: string;
};

type CypherCircleProps = {
  participants: CypherParticipant[];
  genre: string;
  instrumentType: string;
  beatSource: string;
  rewards: CypherReward[];
  href: string;
  accentColor?: string;
};

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function CypherCircle({
  participants, genre, instrumentType, beatSource, rewards, href, accentColor = "#AA2DFF",
}: CypherCircleProps) {
  const count = participants.length;
  const activeParticipant = participants.find((p) => p.isActive) ?? participants[0];

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        borderRadius: 14, overflow: "hidden",
        border: `1.5px solid ${accentColor}2a`,
        background: `linear-gradient(135deg, ${accentColor}0c 0%, rgba(0,0,0,0) 100%)`,
      }}>
        {/* Header strip */}
        <div style={{
          padding: "6px 12px",
          background: "rgba(0,0,0,0.55)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.26em", color: accentColor, textTransform: "uppercase" }}>
              {instrumentType}
            </span>
            <span style={{
              padding: "1px 7px", borderRadius: 999,
              border: `1px solid ${accentColor}44`, background: `${accentColor}12`,
              fontSize: 6, fontWeight: 900, letterSpacing: "0.18em", color: accentColor, textTransform: "uppercase",
            }}>
              {genre}
            </span>
          </div>
          <span style={{ fontSize: 6, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
            {count} performers
          </span>
        </div>

        {/* Circle layout */}
        <div style={{ padding: "16px 12px", display: "flex", alignItems: "center", gap: 14 }}>
          {/* Circle formation */}
          <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
            {/* Orbit ring */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: 120, height: 120,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: `1px solid ${accentColor}22`,
              boxShadow: `0 0 18px ${accentColor}0a inset`,
            }} />

            {/* Participant nodes */}
            {participants.map((p, i) => {
              const angle = (360 / count) * i - 90;
              const rad = (angle * Math.PI) / 180;
              const x = 50 + Math.cos(rad) * 39;
              const y = 50 + Math.sin(rad) * 39;
              const nodeSize = p.isActive ? 36 : p.isHost ? 32 : 28;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: `${x}%`,
                    top: `${y}%`,
                    width: nodeSize,
                    height: nodeSize,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 38% 36%, ${p.accentColor}55, ${p.accentColor}18)`,
                    border: `${p.isActive ? "2.5px" : "1.5px"} solid ${p.accentColor}${p.isActive ? "bb" : "44"}`,
                    boxShadow: p.isActive ? `0 0 20px ${p.accentColor}66` : `0 0 6px ${p.accentColor}1a`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: p.isActive ? 2 : 1,
                  }}
                >
                  <span style={{ fontSize: p.isActive ? 11 : 9, fontWeight: 900, color: p.accentColor, letterSpacing: "0.02em" }}>
                    {initials(p.name)}
                  </span>
                  {p.isActive && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                      style={{
                        position: "absolute", bottom: -3, left: "50%", transform: "translateX(-50%)",
                        width: 4, height: 4, borderRadius: "50%", background: p.accentColor,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Center spotlight glow */}
            <motion.div
              animate={{ opacity: [0.08, 0.18, 0.08], scale: [0.88, 1.08, 0.88] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", top: "50%", left: "50%",
                width: 44, height: 44,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${accentColor}55 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Session info panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Active spotlight */}
            {activeParticipant && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: accentColor, textTransform: "uppercase", marginBottom: 3 }}>
                  ● SPOTLIGHT
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{activeParticipant.name}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{activeParticipant.role}</div>
              </div>
            )}

            {/* Beat source */}
            <div style={{
              padding: "4px 8px", borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
              marginBottom: 8,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Beat</span>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>{beatSource}</span>
            </div>

            {/* Queue preview */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 6, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 4 }}>QUEUE</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {participants.slice(0, 5).map((p) => (
                  <span
                    key={p.id}
                    style={{
                      fontSize: 7, fontWeight: 900,
                      color: p.isActive ? p.accentColor : "rgba(255,255,255,0.4)",
                      borderBottom: p.isActive ? `1px solid ${p.accentColor}` : "none",
                    }}
                  >
                    {p.name.split(" ")[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Rewards */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {rewards.map((r) => (
                <span
                  key={r.label}
                  style={{
                    padding: "1px 6px", borderRadius: 999,
                    border: `1px solid ${r.color}33`, background: `${r.color}0d`,
                    fontSize: 6, fontWeight: 900, letterSpacing: "0.1em", color: r.color,
                  }}
                >
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{
          padding: "7px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>Open · All welcome</span>
          <span style={{
            padding: "3px 12px", borderRadius: 999,
            border: `1px solid ${accentColor}44`, background: `${accentColor}12`,
            fontSize: 7, fontWeight: 900, letterSpacing: "0.14em", color: accentColor, textTransform: "uppercase",
          }}>
            Join Cypher
          </span>
        </div>
      </div>
    </Link>
  );
}
