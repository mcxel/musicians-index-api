"use client";

import { motion } from "framer-motion";
import NeonRouteTile from "@/components/home/NeonRouteTile";
import VerticalNewsTicker from "@/components/home/VerticalNewsTicker";
import CountdownPremiereCard from "@/components/home/CountdownPremiereCard";
import ArtistSpotlightTile from "@/components/editorial/ArtistSpotlightTile";
import { useHomeVerticalFlowEngine } from "@/lib/home/HomeVerticalFlowEngine";

const sections = ["This Week", "Events", "Trending"];

// ── Layer 1 — Color Background Engine (weekly magazine — magenta + red) ────────
const C1 = "#FF2DAA";
const C2 = "#FF4444";

// ── Layer 2 — Underlay A (depth: gradients, fog, light beams) ────────────────
function UnderlayA() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background:
          `radial-gradient(ellipse 70% 55% at 50% 8%, ${C1}0c 0%, transparent 65%),` +
          `radial-gradient(ellipse 50% 65% at 88% 78%, ${C2}0a 0%, transparent 60%),` +
          "linear-gradient(170deg, #020d0e 0%, #05020e 50%, #080210 100%)",
      }} />
      {/* Light beam — diagonal editorial feel */}
      <motion.div
        animate={{ opacity: [0.04, 0.09, 0.04], scaleY: [0.9, 1.1, 0.9] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: 0, left: "38%", width: 1, height: "100%", background: `linear-gradient(180deg, transparent, ${C1}22, transparent)` }}
      />
      <motion.div
        animate={{ opacity: [0.06, 0.18, 0.06], scale: [1, 1.12, 1] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "25%", left: "52%", width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${C1}18 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ opacity: [0.05, 0.14, 0.05], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
        style={{ position: "absolute", bottom: "20%", left: "8%", width: 170, height: 170, borderRadius: "50%", background: `radial-gradient(circle, ${C2}14 0%, transparent 70%)` }}
      />
      {/* Geometric shard — top right */}
      <div style={{ position: "absolute", top: 44, right: 24, width: 80, height: 80, opacity: 0.05, border: `1px solid ${C1}`, transform: "rotate(22deg)" }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${C1}08 3px, ${C1}08 4px)`,
      }} />
    </div>
  );
}

// ── Layer 3 — Underlay B (energy: particles, news-flash streaks) ──────────────
type Particle = { id: number; x: number; delay: number; duration: number; size: number; color: string };
const PARTICLES: Particle[] = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: (i * 6.4) % 93,
  delay: i * 0.28,
  duration: 2.6 + (i % 5) * 0.72,
  size: 2 + (i % 3),
  color: i % 2 === 0 ? `${C1}55` : `${C2}44`,
}));

function UnderlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -46, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${p.x}%`, bottom: "10%", width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 5px ${p.color}` }}
        />
      ))}
      {/* News-flash horizontal streak */}
      <motion.div
        animate={{ x: ["-120%", "120%"] }}
        transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 3.1, ease: "easeInOut" }}
        style={{ position: "absolute", top: "44%", left: 0, width: 90, height: 1, background: `linear-gradient(90deg, transparent, ${C1}99, transparent)` }}
      />
    </div>
  );
}

// ── Layer 4 — Live Content Layer (editorial contributor orbit nodes) ───────────
type MediaNode = { initials: string; color: string; top: string; left?: string; right?: string };
const MEDIA_NODES: MediaNode[] = [
  { initials: "ED", color: C1,       top: "10%", left: "3%" },
  { initials: "RJ", color: "#AA2DFF", top: "34%", left: "2%" },
  { initials: "KR", color: C2,       top: "60%", left: "4%" },
  { initials: "ZB", color: "#FFD700", top: "82%", left: "9%" },
  { initials: "NV", color: C1,       top: "14%", right: "3%" },
  { initials: "BJ", color: C2,       top: "50%", right: "4%" },
  { initials: "OL", color: "#00FF88", top: "75%", right: "7%" },
];

function LiveContentLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
      {/* LIVE NEWS indicator */}
      <motion.div
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 999,
          border: `1px solid ${C1}55`, background: `${C1}0d`,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C1, boxShadow: `0 0 6px ${C1}`, flexShrink: 0 }} />
        <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.2em", color: C1, textTransform: "uppercase" }}>LIVE NEWS</span>
      </motion.div>
      {MEDIA_NODES.map((node, i) => (
        <motion.div
          key={node.initials}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.45, 0.8, 0.45], scale: [0.9, 1, 0.9] }}
          transition={{ duration: 3.8 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.22 }}
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

// ── Layer 5 — Overlay A (words: week label, issue tag) ────────────────────────
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
        WEEKLY EDITION
      </motion.div>
    </div>
  );
}

// ── Layer 6 — Overlay B (power: crown burst, champion badge) ──────────────────
function OverlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        animate={{ opacity: [0.14, 0.32, 0.14] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 22, right: 16, fontSize: 30, lineHeight: 1, filter: `drop-shadow(0 0 14px ${C1}55)` }}
      >
        📰
      </motion.div>
    </div>
  );
}

// ── Layer 7 — Overlay C (celebration: cyan sparks) ────────────────────────────
type Spark = { id: number; x: number; y: number; delay: number };
const SPARKS: Spark[] = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: 6 + (i * 10) % 88, y: 6 + (i * 17) % 80, delay: i * 0.52,
}));

function OverlayC() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none", overflow: "hidden" }}>
      {SPARKS.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1.3, 0.3] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: s.delay, ease: "easeOut" }}
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
    <main className="homev2-root" data-theme="news" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="tmi-bg-1980s" aria-hidden="true" />

      <header className="homev2-issue-header">
        <p className="homev2-issue-header__kicker">TMI · Issue 01 · This Week</p>
        <h1 className="homev2-issue-header__title">Weekly News &amp; Events</h1>
        <p className="homev2-issue-header__subtitle">Battles · Articles · New artists · Live rooms · Trending</p>
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
                {/* Left page — Featured stories + New artists */}
                <div ref={bindSectionRef(0)} className="mag-spread__page mag-left" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--live">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Trending</span>
                        <h2 className="homev2-belt__title">Featured Stories</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <VerticalNewsTicker />
                      </div>
                    </div>
                    <div className="homev2-belt homev2-belt--profile">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">New This Week</span>
                        <h2 className="homev2-belt__title">Fresh Artists</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)" }}>
                          <NeonRouteTile title="Artists" subtitle="Browse talent" href="/artists" accent={C1} />
                          <NeonRouteTile title="Magazine" subtitle="Read articles" href="/magazine" accent={C2} />
                          <NeonRouteTile title="Battles" subtitle="Upcoming matchups" href="/cypher" accent="#AA2DFF" />
                          <NeonRouteTile title="Discover" subtitle="New drops" href="/discover/1" accent="#FFD700" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right page — Live rooms + This week's events */}
                <div ref={bindSectionRef(1)} className="mag-spread__page mag-right" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--live">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Rising Artists</span>
                        <h2 className="homev2-belt__title">Artist Spotlight</h2>
                      </div>
                      <div className="homev2-belt__content" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <ArtistSpotlightTile artistName="Wavetek" blurb="Houston's independent crown holder" statLabel="Monthly Listeners" statValue="2.1M" accent="#FF2DAA" />
                        <ArtistSpotlightTile artistName="Neon Vibe" blurb="Monday Stage resident DJ" statLabel="Sets This Month" statValue="12" accent="#00FFFF" />
                      </div>
                    </div>
                    <div ref={bindSectionRef(2)} className="homev2-belt homev2-belt--events">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">This Week</span>
                        <h2 className="homev2-belt__title">Upcoming Events</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <CountdownPremiereCard label="Battle Card Opens" minutesFromNow={9} />
                        <CountdownPremiereCard label="Crown Cypher Night" minutesFromNow={6} />
                        <CountdownPremiereCard label="Genre Drop Show" minutesFromNow={4} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <NeonRouteTile title="Events" subtitle="Full calendar" href="/events/1" accent={C1} />
                          <NeonRouteTile title="Games →" subtitle="Play &amp; compete" href="/home/4" accent={C2} />
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
