"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const MAGAZINE_PAGES = [
  { id: 1, label: "Crown Cover",      route: "/home/1",       bg: "radial-gradient(circle at 25% 40%, rgba(0,255,255,0.12) 0%, transparent 55%), linear-gradient(170deg,#050510,#07081a)", accent: "#00FFFF" },
  { id: 2, label: "Open Spread",      route: "/home/1-2",     bg: "radial-gradient(circle at 55% 25%, rgba(0,255,255,0.08) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(255,45,170,0.12) 0%, transparent 50%), linear-gradient(170deg,#050510,#0a0c22)", accent: "#36e4ff" },
  { id: 3, label: "Dashboard Core",   route: "/home/2",       bg: "radial-gradient(circle at 75% 25%, rgba(255,45,170,0.12) 0%, transparent 55%), linear-gradient(170deg,#050510,#080515)", accent: "#FF2DAA" },
  { id: 4, label: "Live World",       route: "/home/3",       bg: "radial-gradient(circle at 50% 0%, rgba(255,68,68,0.12) 0%, transparent 55%), linear-gradient(170deg,#050510,#120914)",  accent: "#FF4444" },
  { id: 5, label: "Sponsor World",    route: "/home/4",       bg: "radial-gradient(circle at 80% 60%, rgba(255,215,0,0.12) 0%, transparent 55%), linear-gradient(170deg,#050510,#0b0a1b)",  accent: "#FFD700" },
  { id: 6, label: "Charts & Store",   route: "/home/5",       bg: "radial-gradient(circle at 20% 80%, rgba(170,45,255,0.12) 0%, transparent 55%), linear-gradient(170deg,#050510,#07081a)", accent: "#AA2DFF" },
];

const FLIP_INTERVAL = 6000;

export default function MagazineFlipPage() {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setPageIndex(idx);
  }, []);

  const next = useCallback(() => {
    goTo((pageIndex + 1) % MAGAZINE_PAGES.length, 1);
  }, [pageIndex, goTo]);

  const prev = useCallback(() => {
    goTo((pageIndex - 1 + MAGAZINE_PAGES.length) % MAGAZINE_PAGES.length, -1);
  }, [pageIndex, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(next, FLIP_INTERVAL);
    return () => clearTimeout(id);
  }, [paused, next]);

  const page = MAGAZINE_PAGES[pageIndex]!;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#03020d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Masthead */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.3em", color: page.accent, textTransform: "uppercase", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)", transition: "color 0.6s ease" }}>
          THE MUSICIAN&apos;S INDEX
        </div>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", opacity: 0.5, textTransform: "uppercase", marginTop: 3, fontFamily: "var(--font-tmi-rajdhani,'Rajdhani',sans-serif)" }}>
          MAGAZINE PREVIEW · AUTO-FLIP
        </div>
      </div>

      {/* Magazine flip area */}
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          position: "relative",
          perspective: "1800px",
        }}
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={page.id}
            custom={direction}
            initial={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: direction > 0 ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.645, 0.045, 0.355, 1] }}
            style={{
              transformOrigin: direction > 0 ? "left center" : "right center",
              borderRadius: 16,
              overflow: "hidden",
              background: page.bg,
              border: `1px solid ${page.accent}33`,
              boxShadow: `0 0 60px ${page.accent}18, 4px 0 0 #ddd, 8px 0 0 #bbb, 24px 26px 50px rgba(0,0,0,0.6)`,
              borderLeft: `10px solid ${page.accent}`,
              minHeight: 520,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "28px 32px",
            }}
          >
            {/* Page content preview */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.25em", color: page.accent, textTransform: "uppercase", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)", marginBottom: 10 }}>
                PAGE {page.id} OF {MAGAZINE_PAGES.length} · {page.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-tmi-bungee,'Bungee',sans-serif)", lineHeight: 1.1, textShadow: `0 0 30px ${page.accent}60` }}>
                {page.label}
              </div>
              <div style={{ width: 40, height: 3, background: page.accent, marginTop: 12, borderRadius: 2 }} />
            </div>

            {/* Corner marks */}
            <div style={{ position: "absolute", top: 12, left: 12, width: 24, height: 24, borderTop: `2px solid ${page.accent}`, borderLeft: `2px solid ${page.accent}` }} />
            <div style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, borderTop: `2px solid ${page.accent}88`, borderRight: `2px solid ${page.accent}88` }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 24, height: 24, borderBottom: `2px solid ${page.accent}88`, borderLeft: `2px solid ${page.accent}88` }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, width: 24, height: 24, borderBottom: `2px solid ${page.accent}`, borderRight: `2px solid ${page.accent}` }} />

            {/* CTA */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ fontSize: 9, opacity: 0.5, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Hover to pause · Click page to enter
              </div>
              <Link
                href={page.route}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: `${page.accent}22`,
                  border: `1px solid ${page.accent}66`,
                  color: page.accent,
                  borderRadius: 999,
                  padding: "8px 18px",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)",
                }}
              >
                Enter →
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page dots + nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24 }}>
        <button
          type="button"
          onClick={prev}
          style={{ background: "none", border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 999, width: 36, height: 36, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Previous page"
        >
          ‹
        </button>
        {MAGAZINE_PAGES.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => goTo(i, i > pageIndex ? 1 : -1)}
            aria-label={`Go to page ${p.id}`}
            style={{
              width: i === pageIndex ? 24 : 8,
              height: 8,
              borderRadius: 999,
              background: i === pageIndex ? page.accent : "rgba(255,255,255,0.22)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
        <button
          type="button"
          onClick={next}
          style={{ background: "none", border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 999, width: 36, height: 36, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      {/* Exit */}
      <button
        type="button"
        onClick={() => router.push("/home/1")}
        style={{
          marginTop: 20,
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}
