"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  getAnalyticsSnapshot,
  ENGINE_META,
  TIER_ORDER,
  type SubscriptionTier,
  type InsightEngine,
} from "@/lib/analytics/TieredAnalyticsEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  context: "artist" | "fan" | "sponsor" | "advertiser" | "venue";
  roleLabel: string;
  tier: SubscriptionTier;
}

// ─── Tier display config ──────────────────────────────────────────────────────

const TIER_COLOR: Record<SubscriptionTier, string> = {
  free:     "#888888",
  pro:      "#00FFFF",
  bronze:   "#CD7F32",
  silver:   "#C0C0C0",
  gold:     "#FFD700",
  platinum: "#E5E4E2",
  diamond:  "#AA2DFF",
};

const URGENCY_ICON: Record<string, string> = {
  warning:     "🔴",
  opportunity: "💚",
  info:        "🔵",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HubAnalyticsDashboard({ context, roleLabel, tier }: Props) {
  const snapshot = getAnalyticsSnapshot(tier, context);
  const { capabilities, metrics, insights, upgradePrompt } = snapshot;
  const tierColor = TIER_COLOR[tier];
  const tierIndex = TIER_ORDER.indexOf(tier);
  const isDiamond = tier === "diamond";

  return (
    <div style={{ minHeight: "100vh", background: "#060410", color: "#fff", padding: "32px 24px 64px" }}>

      {/* Background grid */}
      <div aria-hidden style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(0,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}
        >
          <div>
            <div style={{ fontSize: "clamp(16px,3vw,26px)", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#fff" }}>
              {roleLabel}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", marginTop: 3, textTransform: "uppercase" }}>
              {capabilities.historyDays} days of history · {capabilities.enabledEngines.length} AI engines active
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${tierColor}88`, background: `${tierColor}15`, fontSize: 10, fontWeight: 900, letterSpacing: "0.25em", color: tierColor, textTransform: "uppercase" }}>
              {tier.toUpperCase()} TIER
            </div>
            <Link href="/subscriptions" style={{ textDecoration: "none" }}>
              <div style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(0,255,255,0.25)", background: "rgba(0,255,255,0.06)", fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#00FFFF", cursor: "pointer", textTransform: "uppercase" }}>
                Upgrade
              </div>
            </Link>
          </div>
        </motion.div>

        {/* ── Upgrade prompt banner ──────────────────────────────── */}
        {upgradePrompt && !isDiamond && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ marginBottom: 24 }}
          >
            <Link href="/subscriptions" style={{ textDecoration: "none" }}>
              <div style={{ padding: "14px 20px", borderRadius: 10, background: "linear-gradient(135deg,rgba(0,255,255,0.08),rgba(170,45,255,0.08))", border: "1px solid rgba(170,45,255,0.35)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#AA2DFF", textTransform: "uppercase" }}>UNLOCK MORE  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{upgradePrompt}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#AA2DFF", whiteSpace: "nowrap" }}>Upgrade →</div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── Stats grid ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 14 }}>
            PERFORMANCE METRICS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                style={{ position: "relative", borderRadius: 12, border: `1px solid ${metric.locked ? "rgba(255,255,255,0.06)" : metric.color + "44"}`, background: metric.locked ? "rgba(255,255,255,0.02)" : `${metric.color}08`, padding: "16px 14px", overflow: "hidden" }}
              >
                {/* Neon top bar */}
                {!metric.locked && (
                  <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "60%", height: 2, background: `linear-gradient(90deg,${metric.color},transparent)` }} />
                )}

                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: metric.locked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 8 }}>
                  {metric.label}
                </div>

                {metric.locked ? (
                  // Locked state
                  <div style={{ position: "relative" }}>
                    <div style={{ filter: "blur(5px)", userSelect: "none" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: metric.color }}>——</div>
                    </div>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <div style={{ fontSize: 16 }}>🔒</div>
                      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
                        {metric.requiredTier.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Unlocked state
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, color: metric.color, lineHeight: 1 }}>
                      {metric.value}
                    </div>
                    {metric.delta && (
                      <div style={{ fontSize: 10, fontWeight: 900, color: metric.delta.startsWith("+") ? "#00FF88" : metric.delta.startsWith("-") ? "#FF4444" : "rgba(255,255,255,0.4)" }}>
                        {metric.delta}
                      </div>
                    )}
                  </div>
                )}

                {/* Tier requirement pill */}
                {metric.locked && (
                  <div style={{ marginTop: 6, fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: TIER_COLOR[metric.requiredTier], opacity: 0.7 }}>
                    Unlock with {metric.requiredTier.toUpperCase()}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── AI Insight engines ──────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 14 }}>
            AI INSIGHT ENGINES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {insights.map((insight, i) => {
              const meta = ENGINE_META[insight.engine as InsightEngine];
              return (
                <motion.div
                  key={insight.engine}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
                  style={{ borderRadius: 12, border: `1px solid ${insight.locked ? "rgba(255,255,255,0.05)" : meta.color + "33"}`, background: insight.locked ? "rgba(255,255,255,0.01)" : `${meta.color}06`, padding: "14px 16px", position: "relative", overflow: "hidden" }}
                >
                  {/* Locked blur overlay */}
                  {insight.locked && (
                    <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.5)", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>🔒</div>
                        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: TIER_COLOR[tierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[tierIndex + 1] : "diamond"], textTransform: "uppercase" }}>
                          {TIER_ORDER[Math.max(0, TIER_ORDER.indexOf(tier) + 1)].toUpperCase()} Required
                        </div>
                        <Link href="/subscriptions" style={{ textDecoration: "none" }}>
                          <div style={{ marginTop: 8, padding: "4px 12px", borderRadius: 20, border: `1px solid ${meta.color}66`, fontSize: 8, fontWeight: 900, color: meta.color, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", display: "inline-block" }}>
                            Unlock
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ padding: "4px 10px", borderRadius: 20, background: `${meta.color}18`, border: `1px solid ${meta.color}44`, fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", color: meta.color, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {meta.label}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 12 }}>{URGENCY_ICON[insight.urgency] ?? "🔵"}</span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>{insight.headline}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                        {insight.body}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Engine availability strip ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "16px 20px" }}
        >
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>
            ACTIVE ENGINES ({capabilities.enabledEngines.length} / 7)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(ENGINE_META).map(([key, meta]) => {
              const active = capabilities.enabledEngines.includes(key as InsightEngine);
              return (
                <div key={key} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${active ? meta.color + "66" : "rgba(255,255,255,0.06)"}`, background: active ? `${meta.color}12` : "transparent", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: active ? meta.color : "rgba(255,255,255,0.2)", textTransform: "uppercase", transition: "all 0.3s" }}>
                  {active ? "●" : "○"} {meta.label}
                </div>
              );
            })}
          </div>
          {!isDiamond && (
            <div style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
              Upgrade to <Link href="/subscriptions" style={{ color: TIER_COLOR[TIER_ORDER[Math.min(TIER_ORDER.length - 1, tierIndex + 1)]], textDecoration: "none", fontWeight: 900 }}>
                {TIER_ORDER[Math.min(TIER_ORDER.length - 1, tierIndex + 1)].toUpperCase()}
              </Link> to unlock more engines
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
