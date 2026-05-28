"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const MAGAZINE_PAGES = [
  { id: 1, label: "Issue 1 — Crown Season",         route: "/magazine/1",                                          bg: "radial-gradient(circle at 25% 40%, rgba(255,45,170,0.14) 0%, transparent 55%), linear-gradient(170deg,#050510,#0a0515)", accent: "#FF2DAA", teaser: "The Musician's Index debut issue. Cover story, 10 features, interviews, and the platform's first editorial." },
  { id: 2, label: "Wavetek's Rise",                  route: "/magazine/article/wavetek-rise-billboard",             bg: "radial-gradient(circle at 55% 25%, rgba(0,255,255,0.08) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(255,45,170,0.12) 0%, transparent 50%), linear-gradient(170deg,#050510,#0a0c22)", accent: "#00FFFF", teaser: "How the Houston rapper built a $2M streaming empire in 18 months — with zero label and zero promotion budget." },
  { id: 3, label: "Neon Vibe Interview",             route: "/magazine/article/neon-vibe-monday-stage",             bg: "radial-gradient(circle at 75% 25%, rgba(255,45,170,0.12) 0%, transparent 55%), linear-gradient(170deg,#050510,#080515)", accent: "#FF2DAA", teaser: "Inside the Monday Stage residency that fans are calling 'The Neon Church.' A DJ/producer redefining live electronic music." },
  { id: 4, label: "Zuri Bloom Feature",              route: "/magazine/article/zuri-bloom-afrobeats-future",        bg: "radial-gradient(circle at 50% 0%, rgba(0,255,136,0.12) 0%, transparent 55%), linear-gradient(170deg,#050510,#051209)", accent: "#00FF88",  teaser: "24 years old. Two continents. One sound. Zuri Bloom is bridging Lagos and Los Angeles one song at a time." },
  { id: 5, label: "TMI Grand Contest Preview",       route: "/magazine/news/tmi-grand-contest-season-1",            bg: "radial-gradient(circle at 80% 60%, rgba(255,215,0,0.12) 0%, transparent 55%), linear-gradient(170deg,#050510,#0b0a1b)",  accent: "#FFD700", teaser: "Everything you need to know about Season 1. Categories, prize pools, and how the crown is earned." },
  { id: 6, label: "Monday Cypher: Bars Born Here",  route: "/magazine/article/monday-cypher-bars-born",            bg: "radial-gradient(circle at 20% 80%, rgba(0,255,136,0.12) 0%, transparent 55%), linear-gradient(170deg,#050510,#050c07)", accent: "#00FF88",  teaser: "TMI's weekly freestyle session draws 15,000+ viewers. Three participants have since signed major deals." },
];

export default function MagazineFlipPage() {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(1);

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
    >
      {/* Masthead */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.3em", color: page.accent, textTransform: "uppercase", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)", transition: "color 0.6s ease" }}>
          THE MUSICIAN&apos;S INDEX
        </div>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", opacity: 0.5, textTransform: "uppercase", marginTop: 3, fontFamily: "var(--font-tmi-rajdhani,'Rajdhani',sans-serif)" }}>
          FLIP THROUGH · THEN ENTER THE MAGAZINE
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
                {page.id === 1 ? "MAGAZINE" : "ARTICLE"} {page.id} OF {MAGAZINE_PAGES.length} · TMI ISSUE 1
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-tmi-bungee,'Bungee',sans-serif)", lineHeight: 1.1, textShadow: `0 0 30px ${page.accent}60` }}>
                {page.label}
              </div>
              <div style={{ width: 40, height: 3, background: page.accent, marginTop: 12, borderRadius: 2 }} />
              <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 520 }}>
                {page.teaser}
              </div>
            </div>

            {/* Corner marks */}
            <div style={{ position: "absolute", top: 12, left: 12, width: 24, height: 24, borderTop: `2px solid ${page.accent}`, borderLeft: `2px solid ${page.accent}` }} />
            <div style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, borderTop: `2px solid ${page.accent}88`, borderRight: `2px solid ${page.accent}88` }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 24, height: 24, borderBottom: `2px solid ${page.accent}88`, borderLeft: `2px solid ${page.accent}88` }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, width: 24, height: 24, borderBottom: `2px solid ${page.accent}`, borderRight: `2px solid ${page.accent}` }} />

            {/* CTA */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ fontSize: 9, opacity: 0.5, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Use arrows to browse · Click to read
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
                {page.id === 1 ? "Open Magazine →" : "Read Article →"}
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

      {/* Footer nav */}
      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/magazine/1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,45,170,0.06)",
            border: "1px solid rgba(255,45,170,0.25)",
            borderRadius: 8,
            padding: "8px 18px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: "#FF2DAA",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          📖 Read Full Issue 1
        </Link>
        <Link
          href="/magazine"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,255,255,0.06)",
            border: "1px solid rgba(0,255,255,0.22)",
            borderRadius: 8,
            padding: "8px 18px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: "#00FFFF",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          📰 All Articles
        </Link>
      </div>

      <button
        type="button"
        onClick={() => router.push("/home/1")}
        style={{
          marginTop: 12,
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        ← Back to Platform Home
      </button>
    </div>
  );
}
