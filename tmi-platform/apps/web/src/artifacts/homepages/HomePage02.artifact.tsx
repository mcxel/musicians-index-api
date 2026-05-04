"use client";

import { motion } from "framer-motion";
import NeonRouteTile from "@/components/home/NeonRouteTile";
import GenreClusterHex from "@/components/home/GenreClusterHex";
import LiveLobbyWall from "@/components/home/LiveLobbyWall";
import VerticalNewsTicker from "@/components/home/VerticalNewsTicker";
import CountdownPremiereCard from "@/components/home/CountdownPremiereCard";
import { useHomeVerticalFlowEngine } from "@/lib/home/HomeVerticalFlowEngine";

const beltSections = ["Top Boards", "Live Wall", "Premieres"];

// ── Theme ─────────────────────────────────────────────────────────────────────
const C1 = "#00FFFF";
const C2 = "#AA2DFF";

// ── L2: Underlay A — large slow geometry ──────────────────────────────────────
function UnderlayA() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background:
          `radial-gradient(ellipse 70% 50% at 50% 5%, ${C1}0e 0%, transparent 70%),` +
          `radial-gradient(ellipse 55% 65% at 8% 90%, ${C2}0c 0%, transparent 60%),` +
          "linear-gradient(160deg, #06040e 0%, #030213 50%, #080417 100%)",
      }} />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", top: 36, left: 24, width: 110, height: 110, border: `1px solid ${C1}0c` }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", bottom: 52, right: 20, width: 80, height: 80, border: `1px solid ${C2}0d`, transform: "rotate(20deg)" }}
      />
      <motion.div
        animate={{ opacity: [0.07, 0.17, 0.07], scale: [1, 1.1, 1] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "22%", left: "55%", width: 210, height: 210, borderRadius: "50%", background: `radial-gradient(circle, ${C1}1a 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ opacity: [0.06, 0.14, 0.06], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
        style={{ position: "absolute", bottom: "20%", left: "15%", width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${C2}18 0%, transparent 70%)` }}
      />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,255,0.008) 3px, rgba(0,255,255,0.008) 4px)",
      }} />
    </div>
  );
}

// ── L3: Underlay B — rising particles ─────────────────────────────────────────
type Particle = { id: number; x: number; delay: number; duration: number; size: number; color: string };
const PARTICLES: Particle[] = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: (i * 6.5) % 96,
  delay: i * 0.28,
  duration: 3.6 + (i % 5) * 0.7,
  size: 2 + (i % 3),
  color: i % 2 === 0 ? `${C1}55` : `${C2}44`,
}));

function UnderlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -55, 0], opacity: [0, 0.75, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${p.x}%`, bottom: "10%", width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 4px ${p.color}` }}
        />
      ))}
      <motion.div
        animate={{ x: [-16, 16, -16], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "42%", left: "4%", width: 52, height: 1, background: `linear-gradient(90deg, transparent, ${C1}88, transparent)`, transform: "rotate(-20deg)" }}
      />
    </div>
  );
}

// ── L4: Media orbit layer — artist edge nodes ─────────────────────────────────
type MediaNode = { initials: string; color: string; top: string; left?: string; right?: string };
const MEDIA_NODES: MediaNode[] = [
  { initials: "KR", color: C1,      top: "11%", left: "3%" },
  { initials: "ZB", color: "#00FF88", top: "36%", left: "2%" },
  { initials: "NV", color: C2,      top: "62%", left: "4%" },
  { initials: "BJ", color: "#FFD700", top: "84%", left: "10%" },
  { initials: "OL", color: "#FF6B35", top: "16%", right: "3%" },
  { initials: "RJ", color: C1,      top: "52%", right: "4%" },
  { initials: "KD", color: "#FF2DAA", top: "77%", right: "7%" },
];

function MediaOrbitLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
      {MEDIA_NODES.map((node, i) => (
        <motion.div
          key={node.initials}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.92, 1, 0.92] }}
          transition={{ duration: 3.4 + i * 0.38, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          style={{
            position: "absolute",
            top: node.top,
            left: node.left,
            right: node.right,
            width: 28, height: 28, borderRadius: "50%",
            border: `1px solid ${node.color}44`,
            background: `${node.color}0e`,
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

// ── L6: Overlay A — mode label ────────────────────────────────────────────────
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
        DISCOVERY MODE
      </motion.div>
    </div>
  );
}

// ── L7: Overlay B — hero symbol ───────────────────────────────────────────────
function OverlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        animate={{ opacity: [0.15, 0.32, 0.15] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 22, right: 16, fontSize: 34, lineHeight: 1, filter: `drop-shadow(0 0 14px ${C1}55)` }}
      >
        📊
      </motion.div>
    </div>
  );
}

// ── L8: Overlay C — spark dots ────────────────────────────────────────────────
type Spark = { id: number; x: number; y: number; delay: number };
const SPARKS: Spark[] = Array.from({ length: 9 }, (_, i) => ({
  id: i, x: 8 + (i * 11) % 84, y: 8 + (i * 19) % 78, delay: i * 0.55,
}));

function OverlayC() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none", overflow: "hidden" }}>
      {SPARKS.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.3, 0.4] }}
          transition={{ duration: 1.9, repeat: Infinity, delay: s.delay, ease: "easeOut" }}
          style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 3, height: 3, borderRadius: "50%", background: C1, boxShadow: `0 0 6px ${C1}` }}
        />
      ))}
    </div>
  );
}

// ── Main artifact ─────────────────────────────────────────────────────────────
export default function HomePage02Artifact() {
  const { activeIndex, onWheel, onTouchStart, onTouchEnd, bindSectionRef, scrollToIndex } =
    useHomeVerticalFlowEngine({ sectionCount: beltSections.length, nextRoute: "/home/3", prevRoute: "/home/1-2" });

  return (
    <main className="homev2-root" data-theme="discovery" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="tmi-bg-1980s" aria-hidden="true" />

      <header className="homev2-issue-header">
        <p className="homev2-issue-header__kicker">TMI · Issue 01 · Discovery</p>
        <h1 className="homev2-issue-header__title">Top Boards &amp; Charts</h1>
        <p className="homev2-issue-header__subtitle">Rankings · Genre clusters · Live lobbies</p>
      </header>

      <div className="homev2-stage">
        <div className="mag-shell" style={{ position: "relative" }}>
          <div className="mag-page-stack" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>

          {/* L2–L4: Visual underlays + media */}
          <UnderlayA />
          <UnderlayB />
          <MediaOrbitLayer />

          {/* L5: Functional content */}
          <div className="mag-shell__object" style={{ position: "relative", zIndex: 6 }}>
            <nav aria-label="Section navigation" style={{ display: "flex", justifyContent: "center", gap: 8, padding: "0 0 8px", flexShrink: 0 }}>
              {beltSections.map((label, index) => (
                <button
                  key={label} type="button" onClick={() => scrollToIndex(index)}
                  style={{ height: 10, width: activeIndex === index ? 32 : 10, borderRadius: 999, background: activeIndex === index ? "var(--neon-cyan)" : "rgba(255,255,255,0.22)", border: "none", cursor: "pointer", transition: "all 220ms ease", padding: 0 }}
                  aria-label={label}
                />
              ))}
            </nav>

            <div className="mag-shell__spread">
              <div className="mag-spread">
                {/* Left page */}
                <div ref={bindSectionRef(0)} className="mag-spread__page mag-left" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--editorial">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Top Boards</span>
                        <h2 className="homev2-belt__title">Charts</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)" }}>
                          <NeonRouteTile title="Top Artists" subtitle="Updated live" href="/charts" accent="#00ffff" />
                          <NeonRouteTile title="Top Songs" subtitle="Play + save queue" href="/charts" accent="#ff2daa" />
                          <NeonRouteTile title="Top Venues" subtitle="City rankings" href="/venues" accent="#facc15" />
                          <NeonRouteTile title="Top Fans" subtitle="Engagement ladder" href="/fans" accent="#22c55e" />
                        </div>
                      </div>
                    </div>
                    <div className="homev2-belt homev2-belt--discovery">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Genre Discovery</span>
                        <h2 className="homev2-belt__title">Clusters</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <GenreClusterHex />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right page */}
                <div ref={bindSectionRef(1)} className="mag-spread__page mag-right" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--live">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Live Now</span>
                        <h2 className="homev2-belt__title">Lobbies &amp; News</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <LiveLobbyWall />
                        <VerticalNewsTicker />
                      </div>
                    </div>
                    <div ref={bindSectionRef(2)} className="homev2-belt homev2-belt--events">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Premieres</span>
                        <h2 className="homev2-belt__title">Coming Up</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <CountdownPremiereCard label="Rising Artist Premiere" minutesFromNow={12} />
                        <CountdownPremiereCard label="Battle Entry Cutoff" minutesFromNow={8} />
                        <CountdownPremiereCard label="Sponsor Slot Rotation" minutesFromNow={5} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <NeonRouteTile title="Enter Lobbies" subtitle="Main lobby grid" href="/lobbies" accent="#ff2daa" />
                          <NeonRouteTile title="Home 3 →" subtitle="Live world" href="/home/3" accent="#2dd4bf" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* L6–L8: Visual overlays */}
          <OverlayA />
          <OverlayB />
          <OverlayC />
        </div>
      </div>
    </main>
  );
}
