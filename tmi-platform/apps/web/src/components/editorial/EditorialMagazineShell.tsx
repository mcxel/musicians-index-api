"use client";

// System B — Editorial Magazine Shell
// Canonical 7-layer magazine surface for all article routes.
// Layer 0: Mag shell base (page stack, hinge, fold seam, peel edge)
// Layer 1: Dynamic color engine (per article category)
// Layer 2: Underlay A (paper grain, glow field, grid texture — low motion)
// Layer 3: Underlay B (stars, particles, strips — high motion)
// Layer 4: Article payload (children — EditorialPageFrame)
// Layer 5: Overlay A (section tag, issue marker — header bar)
// Layer 6: Overlay B (engagement telemetry — read count, reactions)
// Layer 7: Overlay C (power badge — featured/trending/editor)

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { motion, animate } from "framer-motion";

// ── Layer 1 — Dynamic Color Engine ────────────────────────────────────────────

type ArticleCategory = "news" | "artist" | "performer" | "sponsor" | "advertiser";

const COLOR_ENGINE: Record<string, { c1: string; c2: string }> = {
  news:       { c1: "#FF2A00", c2: "#FF6600" },
  artist:     { c1: "#0066FF", c2: "#9B2DFF" },
  performer:  { c1: "#00CC44", c2: "#FFD700" },
  sponsor:    { c1: "#FFD700", c2: "#B8860B" },
  advertiser: { c1: "#FF2DAA", c2: "#00FFFF" },
};

const POWER_BADGE: Record<string, { label: string; emoji: string }> = {
  news:       { label: "TRENDING",         emoji: "🔥" },
  artist:     { label: "FEATURED",         emoji: "⭐" },
  performer:  { label: "SPOTLIGHT",        emoji: "🎤" },
  sponsor:    { label: "SPONSOR SUPP.",    emoji: "💼" },
  advertiser: { label: "EDITOR PICK",      emoji: "✨" },
};

// Simulated engagement data (visual telemetry — not real API)
const ENGAGEMENT: Record<string, { reads: string; reactions: string; comments: string; shares: string }> = {
  news:       { reads: "4.2K", reactions: "318", comments: "47", shares: "91" },
  artist:     { reads: "6.8K", reactions: "512", comments: "84", shares: "136" },
  performer:  { reads: "3.1K", reactions: "247", comments: "32", shares: "68" },
  sponsor:    { reads: "2.4K", reactions: "180", comments: "21", shares: "44" },
  advertiser: { reads: "1.9K", reactions: "145", comments: "18", shares: "36" },
};

// ── Layer 2 — Underlay A (paper grain, glow field, grid texture) ──────────────

function UnderlayA({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <div
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      {/* Base gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background:
          `radial-gradient(ellipse 70% 48% at 50% 0%, ${c1}0d 0%, transparent 58%),` +
          `radial-gradient(ellipse 55% 60% at 88% 78%, ${c2}0a 0%, transparent 55%),` +
          "linear-gradient(160deg, #05040c 0%, #030412 55%, #06030e 100%)",
      }} />
      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${c1}05 1px, transparent 1px), linear-gradient(90deg, ${c1}05 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
      }} />
      {/* Paper grain */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
        backgroundSize: "256px 256px",
        opacity: 0.3,
        mixBlendMode: "overlay" as const,
      }} />
      {/* Glow field — top center */}
      <motion.div
        animate={{ opacity: [0.06, 0.18, 0.06], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "4%", left: "46%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${c1}1c 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ opacity: [0.04, 0.13, 0.04], scale: [1.06, 1, 1.06] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
        style={{ position: "absolute", bottom: "12%", left: "6%", width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, ${c2}16 0%, transparent 70%)` }}
      />
      {/* Motion F — Section glow drift: slow lateral drift behind article body */}
      <motion.div
        animate={{ x: ["-8%", "8%", "-8%"], y: ["0%", "3%", "0%"], opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "38%", left: "28%", width: 420, height: 260, borderRadius: "50%", background: `radial-gradient(ellipse, ${c1}14 0%, transparent 65%)`, pointerEvents: "none" }}
      />
    </div>
  );
}

// ── Layer 3 — Underlay B (stars, particles, strips) ───────────────────────────

type Particle = { id: number; x: number; delay: number; dur: number; size: number };
const PARTICLES: Particle[] = Array.from({ length: 20 }, (_, i) => ({
  id: i, x: (i * 5.2) % 97, delay: i * 0.3, dur: 3.0 + (i % 5) * 0.55, size: 1.5 + (i % 3),
}));

type Star = { id: number; x: number; y: number; delay: number };
const STARS: Star[] = Array.from({ length: 28 }, (_, i) => ({
  id: i, x: (i * 3.7) % 98, y: (i * 6.9) % 94, delay: i * 0.42,
}));

function UnderlayB({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Stars */}
      {STARS.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: [0, 0.55, 0] }}
          transition={{ duration: 2.2 + (s.id % 4) * 0.7, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 1.5, height: 1.5, borderRadius: "50%", background: s.id % 3 === 0 ? c1 : s.id % 3 === 1 ? c2 : "rgba(255,255,255,0.7)", opacity: 0 }}
        />
      ))}
      {/* Rising particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -55, 0], opacity: [0, 0.75, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${p.x}%`, bottom: "6%", width: p.size, height: p.size, borderRadius: "50%", background: p.id % 2 === 0 ? `${c1}66` : `${c2}55`, boxShadow: `0 0 4px ${p.id % 2 === 0 ? c1 : c2}44` }}
        />
      ))}
      {/* Confetti strips — horizontal editorial flash */}
      <motion.div
        animate={{ x: ["-130%", "130%"] }}
        transition={{ duration: 4.4, repeat: Infinity, repeatDelay: 5.2, ease: "easeInOut" }}
        style={{ position: "absolute", top: "28%", left: 0, width: 140, height: 1, background: `linear-gradient(90deg, transparent, ${c1}88, transparent)` }}
      />
      <motion.div
        animate={{ x: ["130%", "-130%"] }}
        transition={{ duration: 5.5, repeat: Infinity, repeatDelay: 6.0, ease: "easeInOut", delay: 2.8 }}
        style={{ position: "absolute", top: "62%", right: 0, width: 100, height: 1, background: `linear-gradient(90deg, transparent, ${c2}77, transparent)` }}
      />
      <motion.div
        animate={{ x: ["-130%", "130%"] }}
        transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 7.1, ease: "easeInOut", delay: 1.4 }}
        style={{ position: "absolute", top: "80%", left: 0, width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${c2}55, transparent)` }}
      />
    </div>
  );
}

// ── Motion E — Read ticker: count-up from 0 to live value on mount ────────────

function useCountUp(target: string, delay: number) {
  const [display, setDisplay] = useState<string>("—");

  useEffect(() => {
    const isKilo = target.endsWith("K");
    const num = isKilo ? parseFloat(target) * 1000 : parseInt(target, 10);
    if (isNaN(num)) { setDisplay(target); return; }

    const controls = animate(0, num, {
      duration: 1.5,
      ease: "easeOut",
      delay,
      onUpdate(v) {
        setDisplay(isKilo ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v)));
      },
      onComplete() { setDisplay(target); },
    });
    return controls.stop;
  }, [target, delay]);

  return display;
}

// ── Motion D — Reaction glow: pulse live-indicator on the reactions stat ───────

function TickerStat({
  icon, label, title, c1, index, isReaction,
}: {
  icon: string; label: string; title: string; c1: string; index: number; isReaction?: boolean;
}) {
  const display = useCountUp(label, index * 0.22);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 9, lineHeight: 1 }}>{icon}</span>
      <motion.span
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.8 }}
        style={{ fontSize: 9, fontWeight: 900, color: c1, letterSpacing: "0.06em", minWidth: 32 }}
      >
        {display}
      </motion.span>
      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {title}
      </span>
      {isReaction && (
        <motion.span
          animate={{ scale: [1, 1.8, 1], opacity: [0.55, 0.1, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 4, height: 4, borderRadius: "50%", background: c1, display: "inline-block" }}
        />
      )}
    </div>
  );
}

// ── Layer 6 — Overlay B (engagement telemetry) ────────────────────────────────

function EngagementOverlay({
  c1,
  stats,
}: {
  c1: string;
  stats: { reads: string; reactions: string; comments: string; shares: string };
}) {
  const items = [
    { icon: "👁", label: stats.reads,     title: "reads",     isReaction: false },
    { icon: "❤",  label: stats.reactions, title: "reactions", isReaction: true  },
    { icon: "💬", label: stats.comments,  title: "comments",  isReaction: false },
    { icon: "↗",  label: stats.shares,    title: "shares",    isReaction: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.44 }}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: "10px 14px",
        borderRadius: 10,
        border: `1px solid ${c1}28`,
        background: `rgba(4,2,12,0.82)`,
        backdropFilter: "blur(10px)",
        pointerEvents: "none",
      }}
    >
      {items.map((item, i) => (
        <TickerStat
          key={item.title}
          icon={item.icon}
          label={item.label}
          title={item.title}
          c1={c1}
          index={i}
          isReaction={item.isReaction}
        />
      ))}
    </motion.div>
  );
}

// ── Layer 7 — Overlay C (power badge) ────────────────────────────────────────

function PowerBadge({
  badge,
  c1,
}: {
  badge: { label: string; emoji: string };
  c1: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.38 }}
      style={{
        position: "fixed",
        top: 72,
        right: 24,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        border: `1px solid ${c1}44`,
        background: `${c1}0e`,
        backdropFilter: "blur(8px)",
        pointerEvents: "none",
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.45, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: 11, lineHeight: 1 }}
      >
        {badge.emoji}
      </motion.span>
      <span
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.2em",
          color: c1,
          textTransform: "uppercase" as const,
        }}
      >
        {badge.label}
      </span>
    </motion.div>
  );
}

// ── Shell Props ───────────────────────────────────────────────────────────────

interface EditorialMagazineShellProps {
  children: ReactNode;
  accentColor: string;
  sectionLabel: string;
  issueLabel?: string;
  backRoute?: string;
  backLabel?: string;
  category?: ArticleCategory;
}

// ── Main Shell ─────────────────────────────────────────────────────────────────

export default function EditorialMagazineShell({
  children,
  accentColor,
  sectionLabel,
  issueLabel = "TMI Magazine · Issue 01",
  backRoute = "/articles",
  backLabel = "← All Articles",
  category = "news",
}: EditorialMagazineShellProps) {
  const engine = COLOR_ENGINE[category] ?? COLOR_ENGINE.news;
  const { c1, c2 } = engine;
  const badge = POWER_BADGE[category] ?? POWER_BADGE.news;
  const stats = ENGAGEMENT[category] ?? ENGAGEMENT.news;

  return (
    <div style={{ minHeight: "100vh", position: "relative", color: "#e4e4f0", fontFamily: "inherit" }}>

      {/* Layer 2 + 3 — Fixed atmosphere behind everything */}
      <UnderlayA c1={c1} c2={c2} />
      <UnderlayB c1={c1} c2={c2} />

      {/* Layer 0 — Magazine shell base (page stack + page surface) */}
      {/* Motion A — Page breathing: very slow scale pulse makes article feel alive */}
      <motion.div
        animate={{ scale: [1, 1.0014, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "relative", zIndex: 2, maxWidth: 980, margin: "0 auto", transformOrigin: "top center" }}
      >
        {/* Page stack depth effect */}
        <div className="mag-page-stack" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>

        {/* Page surface with hinge + fold seam + peel edge */}
        <div
          style={{
            position: "relative",
            background: "rgba(5,4,14,0.90)",
            backdropFilter: "blur(6px)",
            borderRadius: "0 0 10px 10px",
            boxShadow:
              `0 2px 48px rgba(0,0,0,0.55),` +
              `inset 0 0 0 1px rgba(255,255,255,0.04),` +
              `inset -2px 0 0 ${c1}0e`,
            borderLeft: `2px solid ${c1}1a`,
          }}
        >
          {/* Fold seam — vertical center line */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 24,
              bottom: 24,
              left: "50%",
              width: 1,
              background: `linear-gradient(180deg, transparent, ${c1}18 20%, ${c1}22 50%, ${c1}18 80%, transparent)`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          {/* Peel edge — bottom-right corner */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              background: `linear-gradient(225deg, ${c1}20, transparent 70%)`,
              borderRadius: "0 0 10px 0",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Layer 5 — Overlay A: header bar (section tag, issue marker, back link) */}
          <header
            style={{
              borderBottom: `1px solid ${c1}24`,
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: `linear-gradient(90deg, ${c1}0c, transparent 55%)`,
              position: "sticky",
              top: 0,
              zIndex: 50,
              backdropFilter: "blur(14px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link
                href={backRoute}
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                {backLabel}
              </Link>
              <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.12)" }} />
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontSize: 8, fontWeight: 900, letterSpacing: "0.3em",
                  color: c1, textTransform: "uppercase",
                }}
              >
                {issueLabel}
              </motion.span>
            </div>
            {/* Section tag */}
            <span
              style={{
                fontSize: 8, fontWeight: 700, letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
                padding: "3px 10px", borderRadius: 4,
                border: `1px solid ${c1}28`,
                background: `${c1}0c`,
              }}
            >
              {sectionLabel}
            </span>
          </header>

          {/* Layer 4 — Article payload (children) */}
          <main style={{ maxWidth: 940, margin: "0 auto", padding: "0 24px 48px" }}>
            {children}
          </main>

          {/* Footer trim */}
          <footer
            style={{
              borderTop: `1px solid ${c1}14`,
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 7, letterSpacing: "0.3em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>
              The Musician&apos;s Index · Editorial
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Articles", href: "/articles" },
                { label: "Artists",  href: "/artists" },
                { label: "Rankings", href: "/rankings" },
                { label: "Magazine", href: "/home/1" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 7, fontWeight: 700, letterSpacing: "0.14em",
                    color: "rgba(255,255,255,0.25)", textTransform: "uppercase", textDecoration: "none",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </footer>
        </div>
      </motion.div>

      {/* Layer 6 — Engagement telemetry overlay */}
      <EngagementOverlay c1={c1} stats={stats} />

      {/* Layer 7 — Power badge overlay */}
      <PowerBadge badge={badge} c1={c1} />
    </div>
  );
}
