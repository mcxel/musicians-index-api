"use client";

import { motion } from "framer-motion";
import NeonRouteTile from "@/components/home/NeonRouteTile";
import PrizeVaultTile from "@/components/home/PrizeVaultTile";
import FanPredictionPoll from "@/components/home/FanPredictionPoll";
import CountdownPremiereCard from "@/components/home/CountdownPremiereCard";
import { useHomeVerticalFlowEngine } from "@/lib/home/HomeVerticalFlowEngine";

const sections = ["Games", "Contests", "Events"];

// ── Layer 1 — Color Background Engine (games/prizes — gold + purple) ──────────
const C1 = "#FFD700";
const C2 = "#AA2DFF";

// ── Layer 2 — Underlay A (depth: gold grid, prize glow orbs) ─────────────────
function UnderlayA() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background:
          `radial-gradient(ellipse 65% 50% at 50% 8%, ${C1}0c 0%, transparent 65%),` +
          `radial-gradient(ellipse 55% 60% at 85% 78%, ${C2}0b 0%, transparent 60%),` +
          "linear-gradient(160deg, #090700 0%, #060007 50%, #040308 100%)",
      }} />
      {/* Gold grid — game board feel */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${C1}07 1px, transparent 1px), linear-gradient(90deg, ${C1}07 1px, transparent 1px)`,
        backgroundSize: "42px 42px",
      }} />
      <motion.div
        animate={{ opacity: [0.08, 0.22, 0.08], scale: [1, 1.1, 1] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "22%", left: "54%", width: 230, height: 230, borderRadius: "50%", background: `radial-gradient(circle, ${C1}1c 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ opacity: [0.06, 0.16, 0.06], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 1.7 }}
        style={{ position: "absolute", bottom: "18%", left: "10%", width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${C2}18 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 52, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", top: 28, right: 20, width: 96, height: 96, border: `1px solid ${C1}0d`, transform: "rotate(12deg)" }}
      />
    </div>
  );
}

// ── Layer 3 — Underlay B (energy: gold coin particles, prize streaks) ─────────
type Particle = { id: number; x: number; delay: number; duration: number; size: number; color: string };
const PARTICLES: Particle[] = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: (i * 7.3) % 92,
  delay: i * 0.34,
  duration: 3.8 + (i % 5) * 0.65,
  size: 2 + (i % 3),
  color: i % 2 === 0 ? `${C1}55` : `${C2}44`,
}));

function UnderlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -50, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${p.x}%`, bottom: "10%", width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 5px ${p.color}` }}
        />
      ))}
      <motion.div
        animate={{ x: [-18, 18, -18], opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "42%", left: "5%", width: 64, height: 1, background: `linear-gradient(90deg, transparent, ${C1}88, transparent)`, transform: "rotate(-16deg)" }}
      />
    </div>
  );
}

// ── Layer 4 — Live Content Layer (contestant/player orbit nodes) ───────────────
type MediaNode = { initials: string; color: string; top: string; left?: string; right?: string };
const MEDIA_NODES: MediaNode[] = [
  { initials: "P1", color: C1,       top: "10%", left: "3%" },
  { initials: "P2", color: "#00FFFF", top: "34%", left: "2%" },
  { initials: "P3", color: C2,       top: "60%", left: "4%" },
  { initials: "P4", color: "#FF2DAA", top: "82%", left: "9%" },
  { initials: "P5", color: C1,       top: "14%", right: "3%" },
  { initials: "P6", color: C2,       top: "50%", right: "4%" },
  { initials: "P7", color: "#00FF88", top: "75%", right: "7%" },
];

function LiveContentLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
      {/* PLAY indicator */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)",
          padding: "3px 10px", borderRadius: 999,
          border: `1px solid ${C1}55`, background: `${C1}0d`,
          fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: C1, textTransform: "uppercase",
        }}
      >
        PLAY
      </motion.div>
      {MEDIA_NODES.map((node, i) => (
        <motion.div
          key={node.initials}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.5, 0.82, 0.5], scale: [0.92, 1, 0.92] }}
          transition={{ duration: 3.6 + i * 0.38, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
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

// ── Layer 5 — Overlay A (words: game zone label) ──────────────────────────────
function OverlayA() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.38 }}
        style={{
          position: "absolute", bottom: 16, left: 14,
          padding: "2px 10px", borderRadius: 999,
          border: `1px solid ${C1}33`, background: `${C1}0a`,
          fontSize: 7, fontWeight: 900, letterSpacing: "0.2em",
          color: C1, textTransform: "uppercase",
        }}
      >
        GAME ZONE
      </motion.div>
    </div>
  );
}

// ── Layer 6 — Overlay B (power: prize trophy glow) ───────────────────────────
function OverlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        animate={{ opacity: [0.14, 0.34, 0.14] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 22, right: 16, fontSize: 30, lineHeight: 1, filter: `drop-shadow(0 0 14px ${C1}66)` }}
      >
        🏆
      </motion.div>
    </div>
  );
}

// ── Layer 7 — Overlay C (celebration: gold prize sparks) ─────────────────────
type Spark = { id: number; x: number; y: number; delay: number };
const SPARKS: Spark[] = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: 7 + (i * 11) % 86, y: 7 + (i * 18) % 79, delay: i * 0.58,
}));

function OverlayC() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none", overflow: "hidden" }}>
      {SPARKS.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.3, 0.4] }}
          transition={{ duration: 2.0, repeat: Infinity, delay: s.delay, ease: "easeOut" }}
          style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 3, height: 3, borderRadius: "50%", background: C1, boxShadow: `0 0 6px ${C1}` }}
        />
      ))}
    </div>
  );
}

// ── Main artifact ─────────────────────────────────────────────────────────────
export default function HomePage04Artifact() {
  const { activeIndex, onWheel, onTouchStart, onTouchEnd, bindSectionRef, scrollToIndex } =
    useHomeVerticalFlowEngine({ sectionCount: sections.length, nextRoute: "/home/5", prevRoute: "/home/3" });

  return (
    <main className="homev2-root" data-theme="games" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="tmi-bg-1980s" aria-hidden="true" />

      <header className="homev2-issue-header">
        <p className="homev2-issue-header__kicker">TMI · Issue 01 · Play</p>
        <h1 className="homev2-issue-header__title">Games, Events &amp; Contests</h1>
        <p className="homev2-issue-header__subtitle">Game hub · Voting contests · Weekly prizes · Giveaways</p>
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
                {/* Left page — Game hub + Vote now */}
                <div ref={bindSectionRef(0)} className="mag-spread__page mag-left" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--marketplace">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Enter the Arena</span>
                        <h2 className="homev2-belt__title">Game Hub</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)" }}>
                          <NeonRouteTile title="Cypher" subtitle="Open battle rooms" href="/cypher" accent={C1} />
                          <NeonRouteTile title="Games" subtitle="Ladder + queues" href="/games" accent={C2} />
                          <NeonRouteTile title="Contests" subtitle="Weekly prizes" href="/cypher" accent="#FF2DAA" />
                          <NeonRouteTile title="Lobbies" subtitle="Audience seats" href="/lobbies" accent="#00FFFF" />
                        </div>
                      </div>
                    </div>
                    <div ref={bindSectionRef(1)} className="homev2-belt homev2-belt--ranking">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Cast Your Vote</span>
                        <h2 className="homev2-belt__title">Fan Prediction</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <FanPredictionPoll />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right page — Weekly prizes + Events & giveaways */}
                <div ref={bindSectionRef(2)} className="mag-spread__page mag-right" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--marketplace">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Prize Vault</span>
                        <h2 className="homev2-belt__title">Weekly Prizes</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <PrizeVaultTile title="Weekly Champion Prize" amount="$10,000" />
                        <PrizeVaultTile title="Fan Giveaway Pool" amount="$2,500" showStoreRotation />
                        <PrizeVaultTile title="Contest Runner-Up" amount="$1,000" />
                      </div>
                    </div>
                    <div className="homev2-belt homev2-belt--events">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Calendar</span>
                        <h2 className="homev2-belt__title">Events &amp; Giveaways</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <CountdownPremiereCard label="Contest Round Opens" minutesFromNow={8} />
                        <CountdownPremiereCard label="Giveaway Draw" minutesFromNow={5} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <NeonRouteTile title="← News" subtitle="This week" href="/home/3" accent="#00FFFF" />
                          <NeonRouteTile title="Cyphers →" subtitle="Weekly battles" href="/home/5" accent={C2} />
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
