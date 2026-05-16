"use client";

/**
 * Home1MagazineCoverComposition.tsx
 * The complete magazine cover composition for Home 1.
 *
 * Layer 0: World background (radial gradients + ambient)
 * Layer 1: Physical cover shell (spine, page depth, bevel)
 * Layer 2: Cover background engine (polygon field, confetti shimmer, lightning, number scatter)
 * Layer 3: Masthead "The Musician's Index"
 * Layer 4: CrownCenterFeature (center dominant winner)
 * Layer 5: OrbitRankingGrid (ranks 2–10 asymmetric)
 * Layer 6: LiveRibbonSystem (rotating top bar)
 * Layer 7: MiniLiveRoomsStrip (3 clickable live windows)
 * Layer 8: BottomActionRail (5 large CTA buttons)
 * Layer 9: Motion FX overlay (lightning pulses, confetti bursts)
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import CrownCenterFeature from "@/components/home/CrownCenterFeature";
import OrbitRankingGrid, { RankArtist } from "@/components/home/OrbitRankingGrid";
import LiveRibbonSystem from "@/components/home/LiveRibbonSystem";
import MiniLiveRoomsStrip from "@/components/home/MiniLiveRoomsStrip";
import BottomActionRail from "@/components/home/BottomActionRail";
import IssueIdentityBadge from "@/components/home/IssueIdentityBadge";
import Home1EventTimingStrip from "@/components/home/Home1EventTimingStrip";
import HomepageStarfieldBurst from "@/components/home/HomepageStarfieldBurst";
import StarburstLayer from "@/components/motion/StarburstLayer";
import { useHome1CoverMotionEngine } from "@/lib/home/Home1CoverMotionEngine";
import { genreRotationEngine, GenreConfig, ShowcaseConfig } from "@/lib/home/GenreRotationEngine";

// ─── Artist data ────────────────────────────────────────────────────────────
const TOP_10: RankArtist[] = [
  { id: "astra-nova",    rank: 1,  name: "Astra Nova",    score: "98.7", trend: "+2", genre: "Hip Hop",   image: "/tmi-curated/mag-20.jpg" },
  { id: "wave-tek",      rank: 2,  name: "Wave Tek",      score: "97.2", trend: "+1", genre: "R&B",       image: "/tmi-curated/mag-28.jpg" },
  { id: "zuri-bloom",    rank: 3,  name: "Zuri Bloom",    score: "96.4", trend: "+4", genre: "Pop",       image: "/tmi-curated/mag-35.jpg" },
  { id: "lyric-stone",   rank: 4,  name: "Lyric Stone",   score: "94.9", trend: "-1", genre: "Jazz",      image: "/tmi-curated/mag-42.jpg" },
  { id: "echo-dynasty",  rank: 5,  name: "Echo Dynasty",  score: "93.8", trend: "+3", genre: "Rock",      image: "/tmi-curated/mag-50.jpg" },
  { id: "pulse-master",  rank: 6,  name: "Pulse Master",  score: "92.2", trend: "+1", genre: "Country",   image: "/tmi-curated/mag-58.jpg" },
  { id: "dj-lumi",       rank: 7,  name: "DJ Lumi",       score: "90.7", trend: "-2", genre: "EDM",       image: "/tmi-curated/mag-66.jpg" },
  { id: "bar-god",       rank: 8,  name: "Bar God",       score: "89.6", trend: "+2", genre: "Hip Hop",   image: "/tmi-curated/mag-74.jpg" },
  { id: "flow-master",   rank: 9,  name: "Flow Master",   score: "88.1", trend: "0",  genre: "Afrobeat",  image: "/tmi-curated/mag-82.jpg" },
  { id: "verse-knight",  rank: 10, name: "Verse Knight",  score: "87.4", trend: "+1", genre: "Gospel",    image: "/tmi-curated/mag-28.jpg" },
];

const CROWN: RankArtist & { images: [string, string, string] } = {
  ...TOP_10[0]!,
  images: ["/tmi-curated/mag-20.jpg", "/tmi-curated/mag-50.jpg", "/tmi-curated/mag-74.jpg"],
};

// ─── Lightning bolt SVG overlay ──────────────────────────────────────────────
function LightningOverlay({ color, pulseId }: { color: string; pulseId: number }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const t = setTimeout(() => setActive(false), 240);
    return () => clearTimeout(t);
  }, [pulseId]);

  if (!active) return null;
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 48 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="30%" y1="0%" x2="55%" y2="50%" stroke={color} strokeWidth={1} opacity={0.5} />
      <line x1="55%" y1="50%" x2="40%" y2="100%" stroke={color} strokeWidth={1} opacity={0.5} />
      <line x1="70%" y1="0%" x2="90%" y2="60%" stroke={color} strokeWidth={0.8} opacity={0.4} />
    </svg>
  );
}

// ─── Number scatter overlay ──────────────────────────────────────────────────
const NUMBER_SHARDS = Array.from({ length: 8 }, (_, i) => ({
  val: String(i + 1),
  x: `${8 + i * 11}%`,
  y: `${10 + ((i * 17) % 80)}%`,
  opacity: 0.04 + (i % 3) * 0.018,
  size: 40 + (i % 4) * 30,
}));

// ─── Polygon field lines ─────────────────────────────────────────────────────
const POLYGON_LINES = [
  { x1: "0%", y1: "20%", x2: "40%", y2: "0%", opacity: 0.06 },
  { x1: "100%", y1: "30%", x2: "60%", y2: "0%", opacity: 0.05 },
  { x1: "0%", y1: "60%", x2: "35%", y2: "100%", opacity: 0.04 },
  { x1: "100%", y1: "70%", x2: "65%", y2: "100%", opacity: 0.04 },
  { x1: "15%", y1: "0%", x2: "50%", y2: "50%", opacity: 0.03 },
  { x1: "85%", y1: "0%", x2: "50%", y2: "50%", opacity: 0.03 },
];

// ─── Main component ──────────────────────────────────────────────────────────
export default function Home1MagazineCoverComposition() {
  const [genre, setGenre] = useState<GenreConfig>(genreRotationEngine.current());
  const [showcase, setShowcase] = useState<ShowcaseConfig>(genreRotationEngine.currentShowcase());
  const [rankShiftActive, setRankShiftActive] = useState(false);
  const [burstSeed, setBurstSeed] = useState(() => Date.now());
  const [starburstTrigger, setStarburstTrigger] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const motionSignals = useHome1CoverMotionEngine();

  useEffect(() => {
    setRankShiftActive(true);
    const t = setTimeout(() => setRankShiftActive(false), 1000);
    return () => clearTimeout(t);
  }, [motionSignals.rankSwapFlashId]);

  useEffect(() => {
    genreRotationEngine.start(14000);
    const unsub = genreRotationEngine.subscribe((g) => setGenre(g));
    const unsubShowcase = genreRotationEngine.subscribeShowcase((s) => setShowcase(s));
    return () => {
      unsub();
      unsubShowcase();
      genreRotationEngine.stop();
    };
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setBurstSeed(Date.now());
    setStarburstTrigger((t) => !t);
  }, [genre.id]);

  const primary = genre.primary;
  const secondary = genre.secondary;

  return (
    <section
      style={{
        position: "relative",
        width: "min(1120px, 100%)",
        margin: "0 auto",
        padding: "24px 20px 32px",
      }}
    >
      {/* ─── Layer 0: World background ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse at 25% 40%, ${primary}18 0%, transparent 50%),
            radial-gradient(ellipse at 75% 60%, ${secondary}14 0%, transparent 50%)
          `,
          transition: "background 2s ease",
        }}
      />

      {/* ─── Layer 1: Physical cover shell ─── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Open TMI Magazine"
        onClick={() => router.push("/home/magazine")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push("/home/magazine"); }}
        style={{
          position: "relative",
          zIndex: 2,
          borderRadius: 16,
          overflow: "hidden",
          transform: "translateX(-8px) rotate(-1deg)",
          cursor: "pointer",
          transition: "transform 260ms ease, box-shadow 260ms ease",
          // Physical page stack + magazine heft
          boxShadow: `
            4px 0 0 #ddd,
            8px 0 0 #ccc,
            12px 0 0 #bbb,
            24px 26px 50px rgba(0,0,0,0.55),
            0 0 60px ${primary}20,
            inset 0 0 20px rgba(255,255,255,0.08),
            inset 4px 0 10px rgba(0,0,0,0.5)
          `,
          // Spine: physical binding edge
          borderLeft: `10px solid ${primary}`,
          border: `1px solid ${primary}33`,
          borderLeftWidth: 10,
        }}
      >
        {/* ─── Layer 2: Cover background engine ─── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: `
              radial-gradient(circle at 30% 25%, ${primary}1a 0%, transparent 40%),
              radial-gradient(circle at 70% 75%, ${secondary}14 0%, transparent 40%),
              linear-gradient(170deg, #080614 0%, #050510 40%, #0c0618 100%)
            `,
            transition: "background 2.5s ease",
          }}
        />

        <HomepageStarfieldBurst seed={burstSeed} />
        <StarburstLayer trigger={starburstTrigger} color={primary} />

        {/* Cover art background image (low opacity) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            backgroundImage: "url(/tmi-curated/home1.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: isHydrated ? 0 : 0.08,
            transition: "opacity 420ms ease-out",
          }}
        />

        {/* Polygon field layer */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2, pointerEvents: "none" }}
        >
          {POLYGON_LINES.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={primary} strokeWidth={0.6} opacity={l.opacity} />
          ))}
        </svg>

        {/* Number scatter layer */}
        {NUMBER_SHARDS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              fontSize: s.size,
              fontWeight: 900,
              color: primary,
              opacity: s.opacity,
              pointerEvents: "none",
              zIndex: 2,
              lineHeight: 1,
              fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
              userSelect: "none",
              transition: "color 2.5s ease",
            }}
          >
            {s.val}
          </div>
        ))}

        {/* Page bevel — right edge */}
        <div
          style={{
            position: "absolute",
            top: 0, right: 0, bottom: 0,
            width: 3,
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.06))`,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
        {/* Paper gloss — top highlight */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 60,
            background: "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
            zIndex: 3,
            pointerEvents: "none",
            borderRadius: "14px 14px 0 0",
          }}
        />

        {/* Lightning motion FX */}
        <LightningOverlay color={primary} pulseId={motionSignals.electricArcId} />

        {/* ─── Main content container ─── */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            minHeight: 760,
          }}
        >
          {/* ─── Layer 6 (top): Live ribbon ─── */}
          <LiveRibbonSystem accent={primary} />

          {/* Event timing strip */}
          <Home1EventTimingStrip accentColor={primary} activeId={showcase.id} />

          {/* ─── Top bar: masthead + issue badge ─── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 16px 4px",
            }}
          >
            {/* Masthead */}
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.3em",
                  color: primary,
                  textTransform: "uppercase",
                  fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
                  textShadow: `0 0 12px ${primary}60`,
                  transition: "color 2s ease",
                }}
              >
                THE MUSICIAN&apos;S INDEX
              </div>
              <div
                style={{
                  fontSize: 7,
                  letterSpacing: "0.18em",
                  opacity: 0.5,
                  textTransform: "uppercase",
                  fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
                  marginTop: 1,
                }}
              >
                {genre.label} · LIVE CROWN ENGINE
              </div>
            </div>

            {/* Issue identity */}
            <IssueIdentityBadge accentColor={primary} theme={`${genre.name} Crown`} />
          </div>

          {/* ─── Cover canvas: orbit + crown ─── */}
          <div
            style={{
              position: "relative",
              height: 520,
              margin: "0 8px",
            }}
          >
            {/* Rank 2–10 orbit cards — absolutely positioned */}
            <OrbitRankingGrid artists={TOP_10} accentColor={primary} rankShiftPulse={rankShiftActive} />

            {/* Crown center — absolute centered */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "48%",
                transform: "translate(-50%, -50%)",
                zIndex: 6,
              }}
            >
              <motion.div
                animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.24, 0.52, 0.24] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 360,
                  height: 360,
                  borderRadius: 999,
                  background: `radial-gradient(circle, ${primary}66 0%, transparent 64%)`,
                  filter: "blur(1.5px)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              <motion.div
                key={motionSignals.confettiBurstId}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.2 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "-16%",
                  transform: "translate(-50%, -50%)",
                  width: 320,
                  height: 80,
                  pointerEvents: "none",
                  zIndex: 9,
                  background: `radial-gradient(circle at 10% 50%, ${primary}cc 0 2px, transparent 3px), radial-gradient(circle at 30% 40%, #FF2DAAcc 0 2px, transparent 3px), radial-gradient(circle at 50% 60%, #00FFFFcc 0 2px, transparent 3px), radial-gradient(circle at 70% 30%, #FFD700cc 0 2px, transparent 3px), radial-gradient(circle at 90% 50%, #AA2DFFcc 0 2px, transparent 3px)`,
                }}
              />

              <motion.div
                animate={{ opacity: [0.35, 0.95, 0.35], x: [-10, 10, -10] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: "absolute",
                  left: -72,
                  top: 28,
                  color: "#FF2DAA",
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textShadow: "0 0 10px rgba(255,45,170,0.8)",
                  zIndex: 9,
                  pointerEvents: "none",
                }}
              >
                LIVE
              </motion.div>

              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], x: [8, -8, 8] }}
                transition={{ duration: 1.9, repeat: Infinity }}
                style={{
                  position: "absolute",
                  right: -84,
                  top: 44,
                  color: "#00FF88",
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  zIndex: 9,
                  pointerEvents: "none",
                }}
              >
                VOTE OPEN
              </motion.div>

              <CrownCenterFeature
                artist={{ ...CROWN, genre: genre.name }}
                accentColor={primary}
                facePulseKey={motionSignals.facePulseId}
                rankShiftPulse={rankShiftActive}
              />
            </div>

            {/* Genre label bottom center */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.8, repeat: Infinity }}
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.18em",
                color: primary,
                textTransform: "uppercase",
                fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
                textShadow: `0 0 14px ${primary}80`,
                zIndex: 5,
                transition: "color 2s ease",
              }}
            >
              {genre.icon} {genre.label}
            </motion.div>
          </div>

          {/* ─── Mini live rooms (embedded inside bottom quarter) ─── */}
          <div style={{ position: "absolute", left: 14, right: 14, bottom: 78, zIndex: 11 }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: primary,
                marginBottom: 6,
                textTransform: "uppercase",
                opacity: 0.8,
              }}
            >
              Live Rooms · {showcase.label} Focus
            </div>
            <MiniLiveRoomsStrip roomPhase={motionSignals.roomStatusPhase} activeMode={showcase.id} />
          </div>

          {/* ─── Bottom CTA rail ─── */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 11 }}>
            <BottomActionRail />
          </div>
        </div>

        {/* Corner accent marks */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 36, height: 36, borderTop: `2px solid ${primary}`, borderLeft: `2px solid ${primary}`, zIndex: 20, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 36, height: 36, borderTop: `2px solid ${secondary}`, borderRight: `2px solid ${secondary}`, zIndex: 20, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 36, height: 36, borderBottom: `2px solid ${secondary}`, borderLeft: `2px solid ${secondary}`, zIndex: 20, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 36, height: 36, borderBottom: `2px solid ${primary}`, borderRight: `2px solid ${primary}`, zIndex: 20, pointerEvents: "none" }} />
      </div>

      {/* Page thickness stack — fake stacked pages below */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 28,
          right: 16,
          height: 8,
          background: `linear-gradient(180deg, rgba(255,255,255,0.04), transparent)`,
          borderRadius: "0 0 10px 10px",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 25,
          left: 32,
          right: 20,
          height: 8,
          background: `linear-gradient(180deg, rgba(255,255,255,0.02), transparent)`,
          borderRadius: "0 0 10px 10px",
          zIndex: 0,
        }}
      />
    </section>
  );
}
