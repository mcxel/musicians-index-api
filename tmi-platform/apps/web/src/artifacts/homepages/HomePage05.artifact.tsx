"use client";

import { motion } from "framer-motion";
import NeonRouteTile from "@/components/home/NeonRouteTile";
import BattleBracketPreview from "@/components/home/BattleBracketPreview";
import CypherHeatMeter from "@/components/home/CypherHeatMeter";
import PrizeVaultTile from "@/components/home/PrizeVaultTile";
import FanPredictionPoll from "@/components/home/FanPredictionPoll";
import CountdownPremiereCard from "@/components/home/CountdownPremiereCard";
import { useHomeVerticalFlowEngine } from "@/lib/home/HomeVerticalFlowEngine";

const sections = ["Battles", "Cypher Energy", "Prize + Fan Control"];

// ── Theme ─────────────────────────────────────────────────────────────────────
const C1 = "#AA2DFF";
const C2 = "#FF4444";

// ── L2: Underlay A — battle shards + red/purple glow ─────────────────────────
function UnderlayA() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background:
          `radial-gradient(ellipse 65% 50% at 50% 10%, ${C1}0e 0%, transparent 65%),` +
          `radial-gradient(ellipse 55% 60% at 15% 85%, ${C2}0c 0%, transparent 60%),` +
          "linear-gradient(170deg, #08020e 0%, #0a0208 50%, #090014 100%)",
      }} />
      {/* Diagonal lightning shard — top-left */}
      <motion.div
        animate={{ opacity: [0.06, 0.14, 0.06], scaleX: [0.8, 1.1, 0.8] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: 50, left: 20, width: 120, height: 1, background: `linear-gradient(90deg, transparent, ${C2}cc, transparent)`, transform: "rotate(32deg)" }}
      />
      {/* Diagonal lightning shard — bottom-right */}
      <motion.div
        animate={{ opacity: [0.05, 0.12, 0.05], scaleX: [1, 1.2, 1] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        style={{ position: "absolute", bottom: 70, right: 22, width: 100, height: 1, background: `linear-gradient(90deg, transparent, ${C1}cc, transparent)`, transform: "rotate(-28deg)" }}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.12, 1] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "28%", left: "52%", width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${C1}1c 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ opacity: [0.07, 0.18, 0.07], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        style={{ position: "absolute", bottom: "22%", left: "12%", width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${C2}1a 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", top: 40, right: 22, width: 95, height: 95, border: `1px solid ${C1}0d`, transform: "rotate(18deg)" }}
      />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(170,45,255,0.007) 3px, rgba(170,45,255,0.007) 4px)",
      }} />
    </div>
  );
}

// ── L3: Underlay B — battle spark particles ───────────────────────────────────
type Particle = { id: number; x: number; delay: number; duration: number; size: number; color: string };
const PARTICLES: Particle[] = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: (i * 6.3) % 94,
  delay: i * 0.27,
  duration: 2.6 + (i % 5) * 0.65,
  size: 2 + (i % 3),
  color: i % 2 === 0 ? `${C1}55` : `${C2}44`,
}));

function UnderlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -52, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${p.x}%`, bottom: "8%", width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 4px ${p.color}` }}
        />
      ))}
      {/* Horizontal battle flash */}
      <motion.div
        animate={{ x: ["-110%", "110%"] }}
        transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 3.2, ease: "easeIn" }}
        style={{ position: "absolute", top: "52%", left: 0, width: 70, height: 1, background: `linear-gradient(90deg, transparent, ${C2}bb, transparent)` }}
      />
    </div>
  );
}

// ── L4: Media orbit layer — battle contestant nodes ───────────────────────────
type MediaNode = { initials: string; color: string; top: string; left?: string; right?: string };
const MEDIA_NODES: MediaNode[] = [
  { initials: "WV", color: C1,       top: "10%", left: "3%" },
  { initials: "KR", color: "#00FFFF", top: "34%", left: "2%" },
  { initials: "ZB", color: C2,       top: "60%", left: "4%" },
  { initials: "NV", color: "#FFD700", top: "82%", left: "9%" },
  { initials: "BJ", color: C1,       top: "14%", right: "3%" },
  { initials: "OL", color: C2,       top: "50%", right: "4%" },
  { initials: "RJ", color: "#FF2DAA", top: "75%", right: "7%" },
];

function MediaOrbitLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
      {/* VS badge center-top */}
      <motion.div
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
          padding: "2px 10px", borderRadius: 999,
          border: `1px solid ${C2}55`, background: `${C2}0d`,
          fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: C2, textTransform: "uppercase",
        }}
      >
        VS
      </motion.div>
      {MEDIA_NODES.map((node, i) => (
        <motion.div
          key={node.initials}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.5, 0.82, 0.5], scale: [0.9, 1, 0.9] }}
          transition={{ duration: 3.4 + i * 0.38, repeat: Infinity, ease: "easeInOut", delay: i * 0.22 }}
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

// ── L6: Overlay A ─────────────────────────────────────────────────────────────
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
        BATTLE ZONE
      </motion.div>
    </div>
  );
}

// ── L7: Overlay B ─────────────────────────────────────────────────────────────
function OverlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 22, right: 16, fontSize: 34, lineHeight: 1, filter: `drop-shadow(0 0 14px ${C1}55)` }}
      >
        ⚔️
      </motion.div>
    </div>
  );
}

// ── L8: Overlay C — battle sparks ─────────────────────────────────────────────
type Spark = { id: number; x: number; y: number; delay: number; color: string };
const SPARKS: Spark[] = Array.from({ length: 12 }, (_, i) => ({
  id: i, x: 5 + (i * 9) % 90, y: 5 + (i * 16) % 82, delay: i * 0.48,
  color: i % 2 === 0 ? C1 : C2,
}));

function OverlayC() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none", overflow: "hidden" }}>
      {SPARKS.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: s.delay, ease: "easeOut" }}
          style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 3, height: 3, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }}
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
    <main className="homev2-root" data-theme="ranking" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="tmi-bg-1980s" aria-hidden="true" />

      <header className="homev2-issue-header">
        <p className="homev2-issue-header__kicker">TMI · Issue 01 · Battle Zone</p>
        <h1 className="homev2-issue-header__title">Battle Brackets &amp; Prizes</h1>
        <p className="homev2-issue-header__subtitle">Left bracket · Crown center · Right bracket</p>
      </header>

      <div className="homev2-stage">
        <div className="mag-shell" style={{ position: "relative" }}>
          <div className="mag-page-stack" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>

          <UnderlayA />
          <UnderlayB />
          <MediaOrbitLayer />

          <div className="mag-shell__object" style={{ position: "relative", zIndex: 6 }}>
            <nav aria-label="Section navigation" style={{ display: "flex", justifyContent: "center", gap: 8, padding: "0 0 8px", flexShrink: 0 }}>
              {sections.map((label, index) => (
                <button
                  key={label} type="button" onClick={() => scrollToIndex(index)}
                  style={{ height: 10, width: activeIndex === index ? 32 : 10, borderRadius: 999, background: activeIndex === index ? "#a78bfa" : "rgba(255,255,255,0.22)", border: "none", cursor: "pointer", transition: "all 220ms ease", padding: 0 }}
                  aria-label={label}
                />
              ))}
            </nav>

            <div className="mag-shell__spread">
              <div className="mag-spread">
                {/* Left page */}
                <div ref={bindSectionRef(0)} className="mag-spread__page mag-left" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--ranking">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Battle Bracket</span>
                        <h2 className="homev2-belt__title">Match Previews</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <BattleBracketPreview />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <CountdownPremiereCard label="Quarterfinals Launch" minutesFromNow={7} />
                          <CountdownPremiereCard label="Cypher Round Start" minutesFromNow={5} />
                          <CountdownPremiereCard label="Final Vote Window" minutesFromNow={3} />
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
                          <CypherHeatMeter value={91} />
                          <CypherHeatMeter value={76} />
                          <CypherHeatMeter value={84} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <NeonRouteTile title="Open Cypher" subtitle="Live rooms" href="/cypher" accent="#00ffff" />
                          <NeonRouteTile title="Open Games" subtitle="Battle queues" href="/games" accent="#ff2daa" />
                          <NeonRouteTile title="Open Lobbies" subtitle="Audience" href="/lobbies" accent="#facc15" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right page */}
                <div ref={bindSectionRef(2)} className="mag-spread__page mag-right" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--ranking">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Prize Vault</span>
                        <h2 className="homev2-belt__title">Championship Prizes</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--tmi-gutter)" }}>
                          <PrizeVaultTile title="Battle Champion Vault" amount="$25,000" />
                          <PrizeVaultTile title="Cypher Weekly Vault" amount="$12,500" showStoreRotation />
                          <PrizeVaultTile title="Fan Reward Vault" amount="$4,200" />
                        </div>
                      </div>
                    </div>
                    <div className="homev2-belt homev2-belt--editorial">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Fan Prediction</span>
                        <h2 className="homev2-belt__title">Vote &amp; Claim</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <FanPredictionPoll />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <NeonRouteTile title="Back to Home 4" subtitle="Sponsor controls" href="/home/4" accent="#a78bfa" />
                          <NeonRouteTile title="Open Rewards" subtitle="Claim + payouts" href="/rewards" accent="#facc15" />
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
