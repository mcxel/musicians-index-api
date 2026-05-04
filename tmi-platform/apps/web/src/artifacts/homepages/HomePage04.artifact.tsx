"use client";

import { motion } from "framer-motion";
import NeonRouteTile from "@/components/home/NeonRouteTile";
import NeonStatsStrip from "@/components/home/NeonStatsStrip";
import PlacementIndexGrid from "@/components/home/PlacementIndexGrid";
import DealProgressBars from "@/components/home/DealProgressBars";
import VideoPreviewTile from "@/components/home/VideoPreviewTile";
import type { AdSlotState } from "@/components/home/NeonAdTile";
import { useHomeVerticalFlowEngine } from "@/lib/home/HomeVerticalFlowEngine";

const sections = ["Sponsor Money", "Ad State Guard", "Hand-off"];

const adSlots: Array<{ slot: string; state: AdSlotState; title: string; showStoreRotation?: boolean }> = [
  { slot: "A1", state: "ACTIVE_AD",               title: "Nightwave Energy" },
  { slot: "A2", state: "HOUSE_AD",                title: "TMI Originals" },
  { slot: "B1", state: "SPONSOR_PLACEHOLDER",     title: "Partner Drop" },
  { slot: "B2", state: "AVAILABLE_FOR_PURCHASE",  title: "Open Belt Slot", showStoreRotation: true },
  { slot: "C1", state: "LOCKED_PENDING_APPROVAL", title: "Awaiting Legal" },
  { slot: "C2", state: "ACTIVE_AD",               title: "Pulse Shoes" },
] as const;

// ── Theme ─────────────────────────────────────────────────────────────────────
const C1 = "#FFD700";
const C2 = "#84CC16";

// ── L2: Underlay A — gold grid + glow orbs ────────────────────────────────────
function UnderlayA() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background:
          `radial-gradient(ellipse 65% 50% at 50% 8%, ${C1}0c 0%, transparent 65%),` +
          `radial-gradient(ellipse 55% 60% at 85% 75%, ${C2}0b 0%, transparent 60%),` +
          "linear-gradient(160deg, #080700 0%, #040400 50%, #050900 100%)",
      }} />
      {/* Grid lines — sponsor feel */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          `linear-gradient(${C1}08 1px, transparent 1px),` +
          `linear-gradient(90deg, ${C1}08 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <motion.div
        animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "25%", left: "55%", width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${C1}1c 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ opacity: [0.06, 0.15, 0.06], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
        style={{ position: "absolute", bottom: "18%", left: "10%", width: 170, height: 170, borderRadius: "50%", background: `radial-gradient(circle, ${C2}18 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", top: 28, right: 18, width: 100, height: 100, border: `1px solid ${C1}0e`, transform: "rotate(12deg)" }}
      />
    </div>
  );
}

// ── L3: Underlay B — gold coin particles ─────────────────────────────────────
type Particle = { id: number; x: number; delay: number; duration: number; size: number; color: string };
const PARTICLES: Particle[] = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: (i * 7.2) % 92,
  delay: i * 0.35,
  duration: 4.2 + (i % 5) * 0.6,
  size: 2 + (i % 3),
  color: i % 2 === 0 ? `${C1}55` : `${C2}44`,
}));

function UnderlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -48, 0], opacity: [0, 0.75, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${p.x}%`, bottom: "12%", width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 4px ${p.color}` }}
        />
      ))}
      <motion.div
        animate={{ x: [-18, 18, -18], opacity: [0.04, 0.09, 0.04] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "40%", left: "6%", width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${C1}88, transparent)`, transform: "rotate(-18deg)" }}
      />
    </div>
  );
}

// ── L4: Media orbit layer — sponsor brand nodes ───────────────────────────────
type MediaNode = { initials: string; color: string; top: string; left?: string; right?: string };
const MEDIA_NODES: MediaNode[] = [
  { initials: "NW", color: C1,       top: "10%", left: "3%" },
  { initials: "TM", color: "#00FFFF", top: "34%", left: "2%" },
  { initials: "PL", color: C2,       top: "60%", left: "4%" },
  { initials: "AD", color: C1,       top: "82%", left: "9%" },
  { initials: "SP", color: "#FF2DAA", top: "14%", right: "3%" },
  { initials: "BZ", color: C2,       top: "50%", right: "4%" },
  { initials: "CR", color: C1,       top: "75%", right: "7%" },
];

function MediaOrbitLayer() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
      {MEDIA_NODES.map((node, i) => (
        <motion.div
          key={node.initials}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.92, 1, 0.92] }}
          transition={{ duration: 3.8 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
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
        transition={{ delay: 0.6, duration: 0.38 }}
        style={{
          position: "absolute", bottom: 16, left: 14,
          padding: "2px 10px", borderRadius: 999,
          border: `1px solid ${C1}33`, background: `${C1}0a`,
          fontSize: 7, fontWeight: 900, letterSpacing: "0.2em",
          color: C1, textTransform: "uppercase",
        }}
      >
        SPONSOR ZONE
      </motion.div>
    </div>
  );
}

// ── L7: Overlay B ─────────────────────────────────────────────────────────────
function OverlayB() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div
        animate={{ opacity: [0.15, 0.32, 0.15] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 22, right: 16, fontSize: 34, lineHeight: 1, filter: `drop-shadow(0 0 14px ${C1}66)` }}
      >
        💰
      </motion.div>
    </div>
  );
}

// ── L8: Overlay C — gold sparks ───────────────────────────────────────────────
type Spark = { id: number; x: number; y: number; delay: number };
const SPARKS: Spark[] = Array.from({ length: 9 }, (_, i) => ({
  id: i, x: 7 + (i * 11) % 86, y: 7 + (i * 18) % 79, delay: i * 0.6,
}));

function OverlayC() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none", overflow: "hidden" }}>
      {SPARKS.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.3, 0.4] }}
          transition={{ duration: 2.1, repeat: Infinity, delay: s.delay, ease: "easeOut" }}
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
    <main className="homev2-root" data-theme="market" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="tmi-bg-1980s" aria-hidden="true" />

      <header className="homev2-issue-header">
        <p className="homev2-issue-header__kicker">TMI · Issue 01 · Sponsor</p>
        <h1 className="homev2-issue-header__title">Sponsor Revenue Control</h1>
        <p className="homev2-issue-header__subtitle">Hero ad · Carousel · Inventory map · Contracts</p>
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
                  style={{ height: 10, width: activeIndex === index ? 32 : 10, borderRadius: 999, background: activeIndex === index ? "#84cc16" : "rgba(255,255,255,0.22)", border: "none", cursor: "pointer", transition: "all 220ms ease", padding: 0 }}
                  aria-label={label}
                />
              ))}
            </nav>

            <div className="mag-shell__spread">
              <div className="mag-spread">
                {/* Left page */}
                <div ref={bindSectionRef(0)} className="mag-spread__page mag-left" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--marketplace">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Revenue Dashboard</span>
                        <h2 className="homev2-belt__title">Sponsor Money</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <NeonStatsStrip stats={[
                          { label: "Daily Gross",        value: "$48,220" },
                          { label: "Active Sponsors",    value: "32" },
                          { label: "Fill Rate",          value: "98%" },
                          { label: "Pending Approvals",  value: "3" },
                        ]} />
                      </div>
                    </div>
                    <div className="homev2-belt homev2-belt--marketplace">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Ad Carousel</span>
                        <h2 className="homev2-belt__title">Active Creatives</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--tmi-gutter)" }}>
                          <VideoPreviewTile title="Top Performing Ad Reel" status="live" />
                          <VideoPreviewTile title="Queued Sponsor Creative" status="queued" />
                          <VideoPreviewTile title="House Promo Rotation" status="live" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right page */}
                <div ref={bindSectionRef(1)} className="mag-spread__page mag-right" style={{ overflow: "auto" }}>
                  <div className="mag-page-content">
                    <div className="homev2-belt homev2-belt--marketplace">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Inventory Map</span>
                        <h2 className="homev2-belt__title">Ad Slot States</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <PlacementIndexGrid slots={adSlots} />
                      </div>
                    </div>
                    <div ref={bindSectionRef(2)} className="homev2-belt homev2-belt--marketplace">
                      <div className="homev2-belt__header">
                        <span className="homev2-belt__kicker">Contracts</span>
                        <h2 className="homev2-belt__title">Deal Progress</h2>
                      </div>
                      <div className="homev2-belt__content">
                        <DealProgressBars rows={[
                          { label: "Sponsorship Closure",   percent: 82 },
                          { label: "Creative Approval",     percent: 67 },
                          { label: "Inventory Utilization", percent: 98 },
                        ]} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--tmi-gutter)", marginTop: 8 }}>
                          <NeonRouteTile title="Back to Home 3" subtitle="Live lobbies" href="/home/3" accent="#a78bfa" />
                          <NeonRouteTile title="Home 5 →" subtitle="Battles + prizes" href="/home/5" accent="#22d3ee" />
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
