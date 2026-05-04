"use client";

import { motion } from "framer-motion";
import NeonRouteTile from "@/components/home/NeonRouteTile";
import BattleBracketPreview from "@/components/home/BattleBracketPreview";
import CypherHeatMeter from "@/components/home/CypherHeatMeter";
import PrizeVaultTile from "@/components/home/PrizeVaultTile";
import FanPredictionPoll from "@/components/home/FanPredictionPoll";
import CountdownPremiereCard from "@/components/home/CountdownPremiereCard";
import { useHomeVerticalFlowEngine } from "@/lib/home/HomeVerticalFlowEngine";

const sections = ["Battles", "Winners", "Vote"];

// ── Layer 1 — Color Background Engine (cypher energy — purple + cyan) ─────────
const C1 = "#AA2DFF";
const C2 = "#00FFFF";

// ── Layer 2 — Underlay A (depth: battle shards, cypher glow) ─────────────────
function UnderlayA() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background:
          `radial-gradient(ellipse 65% 52% at 50% 10%, ${C1}10 0%, transparent 65%),` +
          `radial-gradient(ellipse 55% 65% at 15% 85%, ${C2}0c 0%, transparent 60%),` +
          "linear-gradient(170deg, #08020e 0%, #020a0a 50%, #090014 100%)",
      }} />
      {/* Battle lightning shard — top-left */}
      <motion.div
        animate={{ opacity: [0.06, 0.16, 0.06], scaleX: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: 48, left: 18, width: 130, height: 1, background: `linear-gradient(90deg, transparent, ${C2}bb, transparent)`, transform: "rotate(30deg)" }}
      />
      {/* Battle lightning shard — bottom-right */}
      <motion.div
        animate={{ opacity: [0.05, 0.14, 0.05], scaleX: [1, 1.3, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        style={{ position: "absolute", bottom: 72, right: 20, width: 110, height: 1, background: `linear-gradient(90deg, transparent, ${C1}bb, transparent)`, transform: "rotate(-26deg)" }}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.22, 0.08], scale: [1, 1.14, 1] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "26%", left: "52%", width: 230, height: 230, borderRadius: "50%", background: `radial-gradient(circle, ${C1}1e 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ opacity: [0.07, 0.2, 0.07], scale: [1.06, 1, 1.06] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
        style={{ position: "absolute", bottom: "20%", left: "10%", width: 190, height: 190, borderRadius: "50%", background: `radial-gradient(circle, ${C2}1a 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", top: 36, right: 20, width: 98, height: 98, border: `1px solid ${C1}0e`, transform: "rotate(18deg)" }}
      />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${C1}08 3px, ${C1}08 4px)`,
      }} />
    </div>
  );
}

// ── Layer 3 — Underlay B (energy: heavy cypher spark particles) ───────────────
type Particle = { id: number; x: number; delay: number; duration: number; size: number; color: string };
const PARTICLES: Particle[] = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: (i * 4.6) % 95,
  delay: i * 0.21,
  duration: 2.2 + (i % 6) * 0.58,
  size: 2 + (i % 4),
  color: i % 2 === 0 ? `${C1}66` : `${C2}55`,
}));

function UnderlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -55, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${p.x}%`, bottom: "6%", width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 5px ${p.color}` }}
        />
      ))}
      {/* Fast horizontal battle flash */}
      <motion.div
        animate={{ x: ["-110%", "110%"] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.8, ease: "easeIn" }}
        style={{ position: "absolute", top: "50%", left: 0, width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${C2}cc, transparent)` }}
      />
      {/* Second flash — offset */}
      <motion.div
        animate={{ x: ["110%", "-110%"] }}
        transition={{ duration: 3.1, repeat: Infinity, repeatDelay: 3.6, ease: "easeIn", delay: 1.4 }}
        style={{ position: "absolute", top: "38%", right: 0, width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${C1}99, transparent)` }}
      />
    </div>
  );
}

// ── Layer 4 — Live Content Layer (battle contestant orbit) ────────────────────
type MediaNode = { initials: string; color: string; top: string; left?: string; right?: string };
const MEDIA_NODES: MediaNode[] = [
  { initials: "WV", color: C1,       top: "9%",  left: "3%" },
  { initials: "KR", color: C2,       top: "32%", left: "2%" },
  { initials: "ZB", color: "#FF4444", top: "58%", left: "4%" },
  { initials: "NV", color: "#FFD700", top: "80%", left: "9%" },
  { initials: "BJ", color: C1,       top: "13%", right: "3%" },
  { initials: "OL", color: C2,       top: "48%", right: "4%" },
  { initials: "RJ", color: "#FF2DAA", top: "74%", right: "7%" },
];

function LiveContentLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
      {/* VS battle indicator */}
      <motion.div
        animate={{ opacity: [0.4, 0.82, 0.4], scale: [0.94, 1.06, 0.94] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
          padding: "3px 12px", borderRadius: 999,
          border: `1px solid ${C2}55`, background: `${C2}0d`,
          fontSize: 9, fontWeight: 900, letterSpacing: "0.24em", color: C2, textTransform: "uppercase",
        }}
      >
        VS
      </motion.div>
      {MEDIA_NODES.map((node, i) => (
        <motion.div
          key={node.initials}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.5, 0.88, 0.5], scale: [0.88, 1, 0.88] }}
          transition={{ duration: 3.2 + i * 0.36, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          style={{
            position: "absolute", top: node.top, left: node.left, right: node.right,
            width: 28, height: 28, borderRadius: "50%",
            border: `1px solid ${node.color}44`, background: `${node.color}0e`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 8px ${node.color}22`,
          }}
        >
          <span style={{ fontSize: 7, fontWeight: 900, color: node.color, letterSpacing: "0.04em" }}>{node.initials}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Layer 5 — Overlay A (words: battle zone label) ────────────────────────────
function OverlayA() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.38 }}
        style={{
          position: "absolute", bottom: 16, left: 14,
          padding: "2px 10px", borderRadius: 999,
          border: `1px solid ${C2}33`, background: `${C2}0a`,
          fontSize: 7, fontWeight: 900, letterSpacing: "0.2em",
          color: C2, textTransform: "uppercase",
        }}
      >
        CYPHER ZONE
      </motion.div>
    </div>
  );
}

// ── Layer 6 — Overlay B (power: cypher sword burst) ───────────────────────────
function OverlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        animate={{ opacity: [0.14, 0.38, 0.14], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 22, right: 16, fontSize: 30, lineHeight: 1, filter: `drop-shadow(0 0 14px ${C1}66)` }}
      >
        ⚔️
      </motion.div>
    </div>
  );
}

// ── Layer 7 — Overlay C (celebration: heavy cypher sparks — two colors) ───────
type Spark = { id: number; x: number; y: number; delay: number; color: string };
const SPARKS: Spark[] = Array.from({ length: 18 }, (_, i) => ({
  id: i, x: 4 + (i * 5.6) % 92, y: 4 + (i * 13) % 84, delay: i * 0.36,
  color: i % 2 === 0 ? C1 : C2,
}));

function OverlayC() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none", overflow: "hidden" }}>
      {SPARKS.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: [0, 1, 0], scale: [0.2, 1.5, 0.2] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: s.delay, ease: "easeOut" }}
          style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 3, height: 3, borderRadius: "50%", background: s.color, boxShadow: `0 0 7px ${s.color}` }}
        />
      ))}
    </div>
  );
}

// ── Main artifact ─────────────────────────────────────────────────────────────
export default function HomePage05Artifact() {
  const { activeIndex, onWheel, onTouchStart, onTouchEnd, bindSectionRef, scrollToIndex } =
    useHomeVerticalFlowEngine({ sectionCount: sections.length, prevRoute: "/home/4" });

  return (
    <main className="homev2-root" data-theme="cypher" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="tmi-bg-1980s" aria-hidden="true" />

      <header className="homev2-issue-header">
        <p className="homev2-issue-header__kicker">TMI · Issue 01 · Cypher</p>
        <h1 className="homev2-issue-header__title">Weekly Cyphers</h1>
        <p className="homev2-issue-header__subtitle">Battles · Winners · Contestants · Voting · Highlights</p>
      </header>

      <div className="homev2-stage">
        <div className="mag-shell" style={{ position: "relative" }}>
          {/* Layer 0 — Magazine Shell Base */}
          <div className="mag-page-stack" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>

          <UnderlayA />
          <UnderlayB />
          <LiveContentLayer />

          <div className="mag-shell__object" style={{ position: "relative", zIndex: 6 }}>
            <nav aria-label="Section navigation" style={{ display: "flex", justifyContent: "center", gap: 8, padding: "0 0 8px", flexShrink: 0 }}>
              {sections.map((label, index) => (
                <button
                  key={label} type="button" onClick={() => scrollToIndex(index)}
                  style={{ height: 10, width: activeIndex === index ? 32 : 10, borderRadius: 999, background: activeIndex === index ? C1 : "rgba(255,255,255,0.22)", border: "none", cursor: "pointer", transition: "all 220ms ease", padding: 0 }}
                  aria-label={label}
                />
              ))}
            </nav>

            <div className="mag-shell__spread">
              <div className="mag-spread">
                {/* Left page — Current battles + heat meters */}
                <div ref={bindSectionRef(0)} className="mag-spread__page mag-left" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--ranking">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">This Week</span>
                        <h2 className="homev2-belt__title">Cypher Battles</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <BattleBracketPreview />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <CountdownPremiereCard label="Round 1 Opens" minutesFromNow={7} />
                          <CountdownPremiereCard label="Voting Window" minutesFromNow={4} />
                          <CountdownPremiereCard label="Crown Drop" minutesFromNow={2} />
                        </div>
                      </div>
                    </div>
                    <div ref={bindSectionRef(1)} className="homev2-belt homev2-belt--discovery">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Cypher Energy</span>
                        <h2 className="homev2-belt__title">Heat Meters</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--tmi-gutter)" }}>
                          <CypherHeatMeter value={94} />
                          <CypherHeatMeter value={81} />
                          <CypherHeatMeter value={87} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <NeonRouteTile title="Enter Cypher" subtitle="Live rooms" href="/cypher" accent={C2} />
                          <NeonRouteTile title="Battle Queue" subtitle="Join the line" href="/lobbies" accent={C1} />
                          <NeonRouteTile title="Rankings" subtitle="Leaderboard" href="/charts" accent="#FFD700" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right page — Winners + vote & claim */}
                <div ref={bindSectionRef(2)} className="mag-spread__page mag-right" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--ranking">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Champions</span>
                        <h2 className="homev2-belt__title">This Week&apos;s Winners</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <PrizeVaultTile title="Cypher Champion" amount="$12,500" />
                        <PrizeVaultTile title="Weekly Runner-Up" amount="$5,000" showStoreRotation />
                        <PrizeVaultTile title="Fan Vote Winner" amount="$2,000" />
                      </div>
                    </div>
                    <div className="homev2-belt homev2-belt--editorial">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Cast Your Vote</span>
                        <h2 className="homev2-belt__title">Vote &amp; Highlights</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <FanPredictionPoll />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <NeonRouteTile title="← Games" subtitle="Contests &amp; prizes" href="/home/4" accent="#FFD700" />
                          <NeonRouteTile title="Rewards" subtitle="Claim payouts" href="/rewards" accent={C1} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <OverlayA />
          <OverlayB />
          <OverlayC />
        </div>
      </div>
    </main>
  );
}
