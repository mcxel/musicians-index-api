"use client";

import { motion } from "framer-motion";
import NeonRouteTile from "@/components/home/NeonRouteTile";
import LiveLobbyWall from "@/components/home/LiveLobbyWall";
import VerticalNewsTicker from "@/components/home/VerticalNewsTicker";
import CountdownPremiereCard from "@/components/home/CountdownPremiereCard";
import { useHomeVerticalFlowEngine } from "@/lib/home/HomeVerticalFlowEngine";

const sections = ["Lobby Pulse", "Talent Drops", "Route Hand-off"];

// ── Theme ─────────────────────────────────────────────────────────────────────
const C1 = "#FF2DAA";
const C2 = "#FF6644";

// ── L2: Underlay A — pulse rings + fuchsia glow ───────────────────────────────
function UnderlayA() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background:
          `radial-gradient(ellipse 65% 55% at 50% 10%, ${C1}0d 0%, transparent 65%),` +
          `radial-gradient(ellipse 50% 60% at 85% 80%, ${C2}0b 0%, transparent 60%),` +
          "linear-gradient(170deg, #0e0408 0%, #080210 50%, #0c0308 100%)",
      }} />
      {/* Expanding pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [0.6, 1.6], opacity: [0.18, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, delay: i * 1.1, ease: "easeOut" }}
          style={{
            position: "absolute", top: "38%", left: "50%",
            width: 160, height: 160, borderRadius: "50%",
            border: `1px solid ${C1}`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      <motion.div
        animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.12, 1] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "30%", left: "50%", width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, ${C1}1e 0%, transparent 70%)`, transform: "translateX(-50%)" }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", bottom: 44, right: 28, width: 90, height: 90, border: `1px solid ${C2}0e`, transform: "rotate(15deg)" }}
      />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,45,170,0.007) 3px, rgba(255,45,170,0.007) 4px)",
      }} />
    </div>
  );
}

// ── L3: Underlay B — energy streaks ───────────────────────────────────────────
type Particle = { id: number; x: number; delay: number; duration: number; size: number; color: string };
const PARTICLES: Particle[] = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: (i * 7.1) % 94,
  delay: i * 0.32,
  duration: 2.8 + (i % 4) * 0.8,
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
          style={{ position: "absolute", left: `${p.x}%`, bottom: "8%", width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 5px ${p.color}` }}
        />
      ))}
      {/* Horizontal energy streak */}
      <motion.div
        animate={{ x: ["-120%", "120%"] }}
        transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.8, ease: "easeInOut" }}
        style={{ position: "absolute", top: "48%", left: 0, width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${C1}99, transparent)` }}
      />
    </div>
  );
}

// ── L4: Media orbit layer — live performer nodes ──────────────────────────────
type MediaNode = { initials: string; color: string; top: string; left?: string; right?: string };
const MEDIA_NODES: MediaNode[] = [
  { initials: "MC", color: C1,       top: "10%", left: "3%" },
  { initials: "DJ", color: "#00FFFF", top: "34%", left: "2%" },
  { initials: "VP", color: C2,       top: "60%", left: "4%" },
  { initials: "LX", color: "#FFD700", top: "82%", left: "9%" },
  { initials: "SR", color: C1,       top: "14%", right: "3%" },
  { initials: "AK", color: "#AA2DFF", top: "50%", right: "4%" },
  { initials: "TW", color: C2,       top: "75%", right: "7%" },
];

function MediaOrbitLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
      {/* Live indicator top-center */}
      <motion.div
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 999,
          border: `1px solid ${C1}55`, background: `${C1}0d`,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C1, boxShadow: `0 0 6px ${C1}`, flexShrink: 0 }} />
        <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.2em", color: C1, textTransform: "uppercase" }}>LIVE</span>
      </motion.div>
      {MEDIA_NODES.map((node, i) => (
        <motion.div
          key={node.initials}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.5, 0.82, 0.5], scale: [0.9, 1, 0.9] }}
          transition={{ duration: 3.6 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.22 }}
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
          border: `1px solid ${C1}33`, background: `${C1}0a`,
          fontSize: 7, fontWeight: 900, letterSpacing: "0.2em",
          color: C1, textTransform: "uppercase",
        }}
      >
        LIVE NOW
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
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 22, right: 16, fontSize: 34, lineHeight: 1, filter: `drop-shadow(0 0 14px ${C1}55)` }}
      >
        🎙️
      </motion.div>
    </div>
  );
}

// ── L8: Overlay C — fuchsia sparks ────────────────────────────────────────────
type Spark = { id: number; x: number; y: number; delay: number };
const SPARKS: Spark[] = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: 6 + (i * 10) % 88, y: 6 + (i * 17) % 80, delay: i * 0.5,
}));

function OverlayC() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none", overflow: "hidden" }}>
      {SPARKS.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1.4, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: s.delay, ease: "easeOut" }}
          style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 3, height: 3, borderRadius: "50%", background: C1, boxShadow: `0 0 6px ${C1}` }}
        />
      ))}
    </div>
  );
}

// ── Main artifact ─────────────────────────────────────────────────────────────
export default function HomePage03Artifact() {
  const { activeIndex, onWheel, onTouchStart, onTouchEnd, bindSectionRef, scrollToIndex } =
    useHomeVerticalFlowEngine({ sectionCount: sections.length, nextRoute: "/home/4", prevRoute: "/home/2" });

  return (
    <main className="homev2-root" data-theme="live" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="tmi-bg-1980s" aria-hidden="true" />

      <header className="homev2-issue-header">
        <p className="homev2-issue-header__kicker">TMI · Issue 01 · Live World</p>
        <h1 className="homev2-issue-header__title">Live Lobbies &amp; Events</h1>
        <p className="homev2-issue-header__subtitle">Lobby pulse · Queue rail · Cypher arena · Calendar</p>
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
                  style={{ height: 10, width: activeIndex === index ? 32 : 10, borderRadius: 999, background: activeIndex === index ? "#f472b6" : "rgba(255,255,255,0.22)", border: "none", cursor: "pointer", transition: "all 220ms ease", padding: 0 }}
                  aria-label={label}
                />
              ))}
            </nav>

            <div className="mag-shell__spread">
              <div className="mag-spread">
                {/* Left page */}
                <div ref={bindSectionRef(0)} className="mag-spread__page mag-left" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--live">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Live Now</span>
                        <h2 className="homev2-belt__title">Lobby Theater</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <LiveLobbyWall />
                      </div>
                    </div>
                    <div className="homev2-belt homev2-belt--profile">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Queue Rail</span>
                        <h2 className="homev2-belt__title">Entry Lanes</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)" }}>
                          <NeonRouteTile title="Lobby Theater" subtitle="Seat + speaking state" href="/lobbies" accent="#00ffff" />
                          <NeonRouteTile title="Queue Rail" subtitle="Performer order lane" href="/lobbies" accent="#ff2daa" />
                          <NeonRouteTile title="Cypher" subtitle="Open room list" href="/cypher" accent="#a78bfa" />
                          <NeonRouteTile title="Artists" subtitle="Talent profiles" href="/artists" accent="#22c55e" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right page */}
                <div ref={bindSectionRef(1)} className="mag-spread__page mag-right" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--live">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Cypher Arena</span>
                        <h2 className="homev2-belt__title">Talent &amp; News</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <VerticalNewsTicker />
                      </div>
                    </div>
                    <div ref={bindSectionRef(2)} className="homev2-belt homev2-belt--events">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Calendar</span>
                        <h2 className="homev2-belt__title">Upcoming Events</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <CountdownPremiereCard label="Cypher Arena Opens" minutesFromNow={9} />
                        <CountdownPremiereCard label="Battle Card Lock" minutesFromNow={6} />
                        <CountdownPremiereCard label="Lobby Spotlight" minutesFromNow={4} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <NeonRouteTile title="Games" subtitle="Battle ladders" href="/games" accent="#facc15" />
                          <NeonRouteTile title="Home 4 →" subtitle="Sponsor controls" href="/home/4" accent="#2dd4bf" />
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
