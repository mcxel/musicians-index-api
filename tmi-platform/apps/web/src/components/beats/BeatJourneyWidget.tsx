"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const STEPS = [
  {
    icon: "🎧",
    label: "Submit",
    desc: "Your beat enters the private vault — watermarked preview auto-generated.",
    color: "#FFD700",
    active: true,
  },
  {
    icon: "🌍",
    label: "Cipher Showcase",
    desc: "Featured in World Beat Economy & Dance Party sessions for crowd exposure.",
    color: "#AA2DFF",
    active: false,
  },
  {
    icon: "🔥",
    label: "Crowd Votes",
    desc: "Fans and artists vote in live battles. Top beats climb the Crown Rankings.",
    color: "#FF2DAA",
    active: false,
  },
  {
    icon: "💰",
    label: "Marketplace Earn",
    desc: "Buyers license your beat. You keep ownership. Revenue hits your dashboard.",
    color: "#00FF88",
    active: false,
  },
];

interface Props {
  /** If true, shows the widget in a compact horizontal strip for dashboards */
  compact?: boolean;
  /** Highlight the step at this index (0-3) as "current" */
  currentStep?: number;
}

export default function BeatJourneyWidget({ compact = false, currentStep = 0 }: Props) {
  if (compact) {
    return (
      <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>BEAT JOURNEY</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>From vault to marketplace — 4 steps</div>
          </div>
          <Link href="/beats/submit" style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "linear-gradient(90deg,#FFD700,#FF9500)", borderRadius: 8, padding: "8px 16px", textDecoration: "none", letterSpacing: "0.08em" }}>
            SUBMIT BEAT
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {STEPS.map((step, i) => {
            const isCurrent = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div key={step.label} style={{ position: "relative", textAlign: "center", padding: "12px 8px", background: isCurrent ? `${step.color}10` : isDone ? "rgba(0,255,136,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${isCurrent ? step.color + "40" : isDone ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10 }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)", fontSize: 9, color: "rgba(255,255,255,0.2)", zIndex: 1 }}>›</div>
                )}
                <div style={{ fontSize: 20, marginBottom: 4 }}>{isDone ? "✅" : step.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: isCurrent ? step.color : isDone ? "#00FF88" : "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>{step.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section style={{ background: "#050510", padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>BEAT JOURNEY</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.02em" }}>Your Beat's Path to the World</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 420, margin: "0 auto", lineHeight: 1.7 }}>
              Every beat submitted follows this pipeline — from private vault to live crown battles and marketplace earnings.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((step, i) => {
              const isCurrent = i === currentStep;
              const isDone = i < currentStep;
              const isLast = i === STEPS.length - 1;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  style={{ display: "flex", gap: 0, position: "relative" }}
                >
                  {/* Connector line */}
                  {!isLast && (
                    <div style={{ position: "absolute", left: 23, top: 52, bottom: 0, width: 2, background: isDone ? "#00FF8840" : "rgba(255,255,255,0.06)", zIndex: 0 }} />
                  )}

                  {/* Step number / icon */}
                  <div style={{ flexShrink: 0, width: 48, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 14, zIndex: 1 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: isCurrent ? `linear-gradient(135deg, ${step.color}, ${step.color}88)` : isDone ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.04)", border: `2px solid ${isCurrent ? step.color : isDone ? "#00FF88" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: isCurrent ? `0 0 16px ${step.color}50` : "none" }}>
                      {isDone ? "✓" : step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: "12px 0 24px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: isCurrent ? step.color : isDone ? "#00FF88" : "rgba(255,255,255,0.6)" }}>{step.label}</span>
                      {isCurrent && (
                        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: step.color, background: `${step.color}18`, border: `1px solid ${step.color}40`, borderRadius: 20, padding: "2px 8px" }}>CURRENT</span>
                      )}
                      {isDone && (
                        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: "#00FF88", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 20, padding: "2px 8px" }}>COMPLETE</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA strip */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/beats/marketplace" style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "10px 20px", textDecoration: "none", letterSpacing: "0.08em" }}>
              MARKETPLACE
            </Link>
            <Link href="/battles" style={{ fontSize: 10, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 8, padding: "10px 20px", textDecoration: "none" }}>
              LIVE BATTLES
            </Link>
            <Link href="/dashboard/performer" style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 20px", textDecoration: "none" }}>
              MY DASHBOARD
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
