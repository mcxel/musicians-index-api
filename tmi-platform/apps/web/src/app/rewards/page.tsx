"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const TABS = ["PRIZES", "WINNERS", "AUDIENCE DROPS", "CLAIMS", "SPONSOR ITEMS", "BUNDLES"] as const;
type Tab = typeof TABS[number];

const PRIZE_POOL = [
  { name: "Monthly Idol Grand Prize", value: "$5,000 + Studio Time", sponsor: "Crown Audio", icon: "🏆", tier: "WINNER" },
  { name: "Cypher Champion Pack", value: "Beats + Sample Pack", sponsor: "Beat Bots", icon: "⚔️", tier: "WINNER" },
  { name: "Dirty Dozens Champion", value: "$1,000 + NFT Crown", sponsor: "Platform", icon: "😤", tier: "WINNER" },
  { name: "Runner-Up Prize Pack", value: "Outfit + Digital Pack", sponsor: "Glow Apparel", icon: "🥈", tier: "RUNNER_UP" },
  { name: "Audience Random Drop", value: "$50 Platform Credits", sponsor: "Platform", icon: "🎰", tier: "AUDIENCE" },
  { name: "Consolation Energy Pack", value: "Year Supply Energy Drink", sponsor: "Power Boost", icon: "⚡", tier: "CONSOLATION" },
];

const TIER_COLORS: Record<string, string> = {
  WINNER: "#FFD700",
  RUNNER_UP: "#C0C0C0",
  AUDIENCE: "#00FFFF",
  CONSOLATION: "#AA2DFF",
};

export default function RewardsPage() {
  const [tab, setTab] = useState<Tab>("PRIZES");

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "40px 32px 0", borderBottom: "1px solid rgba(255,215,0,0.15)" }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>REWARD ENGINE</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, letterSpacing: 4, margin: 0, lineHeight: 1 }}>
                  REWARDS
                </h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Win prizes. Claim drops. Collect sponsor gifts. Every room has a prize pool.
                </p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Link href="/rewards/claims" style={{
                  display: "inline-block", padding: "10px 22px", borderRadius: 8,
                  background: "linear-gradient(135deg, #FFD700, #FF9500)",
                  color: "#050510", fontWeight: 800, fontSize: 11, letterSpacing: 2,
                  textDecoration: "none",
                }}>CHECK CLAIMS</Link>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, paddingBottom: 20 }}>
              {[
                { label: "ACTIVE PRIZES", val: "6", col: "#FFD700" },
                { label: "PENDING CLAIMS", val: "0", col: "#FF2DAA" },
                { label: "DROPS THIS WEEK", val: "12", col: "#00FFFF" },
                { label: "YOUR POINTS", val: "0", col: "#AA2DFF" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, padding: "0 32px", borderBottom: "1px solid rgba(255,215,0,0.1)", overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "14px 18px", border: "none", cursor: "pointer", background: "transparent",
                borderBottom: tab === t ? "2px solid #FFD700" : "2px solid transparent",
                color: tab === t ? "#FFD700" : "#666",
                fontSize: 9, fontWeight: 800, letterSpacing: 2, whiteSpace: "nowrap",
              }}>{t}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: "28px 32px" }}>
            <AnimatePresence mode="wait">
              {tab === "PRIZES" && (
                <motion.div key="prizes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {PRIZE_POOL.map(prize => (
                      <div key={prize.name} style={{
                        background: `${TIER_COLORS[prize.tier] || "#888"}08`,
                        border: `1px solid ${TIER_COLORS[prize.tier] || "#888"}25`,
                        borderRadius: 12, padding: 20,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ fontSize: 32 }}>{prize.icon}</div>
                          <div style={{
                            padding: "2px 8px", borderRadius: 10,
                            background: `${TIER_COLORS[prize.tier]}15`,
                            fontSize: 7, fontWeight: 900, letterSpacing: 2,
                            color: TIER_COLORS[prize.tier],
                          }}>{prize.tier}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{prize.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: TIER_COLORS[prize.tier], marginBottom: 4 }}>{prize.value}</div>
                        <div style={{ fontSize: 9, color: "#888" }}>Sponsored by {prize.sponsor}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab !== "PRIZES" && (
                <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{
                    padding: 40, textAlign: "center",
                    background: "rgba(255,215,0,0.03)", border: "1px solid rgba(255,215,0,0.1)", borderRadius: 12,
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
                    <div style={{ fontSize: 14, color: "#888" }}>{tab} coming soon</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
