"use client";
/**
 * NavigationRail — TMI-OS Console Navigation
 *
 * Not a hamburger menu. Not a website nav.
 * A physical console rail that slides from the left edge.
 *
 * Closed: 16px neon handle, zero obstruction of content
 * Open:   240px glass rail with spring physics
 *
 * Every link is wired to a real route. No dead buttons.
 * Excluded on: /auth/*, /subscribe (checkout), /payment-success
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ── Dashboard destination per role — "MY HUB" must never hardcode a single
// role's hub for every signed-in user. Keys match the real Prisma Role enum.
const ROLE_HUB: Record<string, string> = {
  FAN: "/hub/fan",
  PERFORMER: "/hub/performer",
  ARTIST: "/hub/artist",
  BAND: "/hub/performer",
  PROMOTER: "/hub/promoter",
  ADVERTISER: "/hub/advertiser",
  SPONSOR: "/hub/sponsor",
  VENUE: "/hub/venue",
  WRITER: "/hub/writer",
  ADMIN: "/admin/overview",
};

// ── Route exclusions — rail hidden on these paths ──────────────────────────
const EXCLUDED_PREFIXES = [
  "/auth/",
  "/api/",
  "/checkout",
  "/payment-success",
  "/payment-cancelled",
];

// ── Menu items — all real routes ─────────────────────────────────────────────
const RAIL_ITEMS = [
  {
    section: "LIVE",
    items: [
      { label: "LIVE ROOMS",       href: "/live/rooms",               emoji: "📡", color: "#FF2020" },
      { label: "BATTLE ARENA",     href: "/battles/live",             emoji: "⚔️", color: "#FF2DAA" },
      { label: "CHALLENGE ARENA",  href: "/rooms/challenge-arena",    emoji: "⚡", color: "#FFD700" },
      { label: "CYPHER ARENA",     href: "/rooms/cypher?autoSeat=1",  emoji: "🎤", color: "#00FFFF" },
    ],
  },
  {
    section: "CONTENT",
    items: [
      { label: "MAGAZINE",         href: "/magazine",                 emoji: "📰", color: "#FF2DAA" },
      { label: "RANKINGS",         href: "/rankings",                 emoji: "👑", color: "#FFD700" },
      { label: "BEAT VAULT",       href: "/beat-vault",               emoji: "🎛️", color: "#AA2DFF" },
      { label: "AUCTION HOUSE",    href: "/auction",                  emoji: "🏛️", color: "#FF9500" },
    ],
  },
  {
    section: "PROFILE",
    items: [
      { label: "MESSAGES",         href: "/messages",                 emoji: "💬", color: "#00FFFF" },
      { label: "AVATAR CENTER",    href: "/avatar-center",            emoji: "🎭", color: "#AA2DFF" },
      { label: "SUBSCRIBE",        href: "/subscribe",                emoji: "👑", color: "#00FF88" },
      { label: "SOCIAL",           href: "/social",                   emoji: "🌐", color: "#FF6B35" },
    ],
  },
  {
    section: "ADMIN",
    items: [
      { label: "MISSION CONTROL",  href: "/admin/mission-control",    emoji: "🛸", color: "#FF2DAA" },
      { label: "REVENUE",          href: "/admin/revenue",            emoji: "💰", color: "#00FF88" },
    ],
  },
];

export default function NavigationRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Avatar & Inventory is Fan-only (CLAUDE.md Rule 26 Identity Policy,
  // 2026-07-18) — AVATAR CENTER is filtered out of the rail below for any
  // other role. null = not yet resolved, treated as "don't show yet".
  const [role, setRole] = useState<string | null>(null);

  // All hooks must precede any early return (Rules of Hooks)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json())
      .then((d: { role?: string | null }) => { if (active) setRole(d.role ?? null); })
      .catch(() => { if (active) setRole(null); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Hide on excluded paths
  const isExcluded = EXCLUDED_PREFIXES.some(p => (pathname ?? "").startsWith(p));
  if (isExcluded) return null;

  function handleLink(href: string) {
    setOpen(false);
    router.push(href);
  }

  const isActive = (href: string) => (pathname ?? "").startsWith(href.split("?")[0]!);

  return (
    <>
      {/* Backdrop — click to close */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, backdropFilter: "blur(2px)" }}
          />
        )}
      </AnimatePresence>

      {/* The rail */}
      <div style={{ position: "fixed", left: 0, top: 0, height: "100dvh", zIndex: 9999, display: "flex", alignItems: "stretch", willChange: "transform", backfaceVisibility: "hidden" }}>

        {/* Rail content */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 36, mass: 0.8 }}
              style={{ overflow: "hidden", background: "rgba(5,5,16,0.97)", borderRight: "1px solid rgba(0,255,255,0.15)", backdropFilter: "blur(24px)", display: "flex", flexDirection: "column", height: "100%", willChange: "width" }}
            >
              <div style={{ width: 240, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
                {/* Header */}
                <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.2em" }}>TMI-OS</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 2, letterSpacing: "0.12em" }}>NAVIGATION RAIL</div>
                  </div>
                  <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 16, padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                {/* Nav sections */}
                <div style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
                  {RAIL_ITEMS.map(section => (
                    <div key={section.section} style={{ marginBottom: 4 }}>
                      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.22em", fontWeight: 800, padding: "8px 16px 4px" }}>
                        {section.section}
                      </div>
                      {section.items
                        .filter(item => item.href !== '/avatar-center' || role === 'FAN')
                        .map(item => {
                        const active = isActive(item.href);
                        return (
                          <button
                            key={item.href}
                            onClick={() => handleLink(item.href)}
                            style={{
                              width: "100%", display: "flex", alignItems: "center", gap: 10,
                              padding: "9px 16px", background: active ? `${item.color}12` : "transparent",
                              border: "none", cursor: "pointer", textAlign: "left",
                              borderLeft: `2px solid ${active ? item.color : "transparent"}`,
                              transition: "all 0.12s ease",
                            }}
                          >
                            <span style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: "center" }}>{item.emoji}</span>
                            <span style={{ fontSize: 10, fontWeight: active ? 900 : 700, color: active ? item.color : "rgba(255,255,255,0.6)", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                              {item.label}
                            </span>
                            {active && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: item.color, flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                  <button onClick={() => handleLink("/live/go")} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "linear-gradient(90deg, #FF2DAA, #AA2DFF)", border: "none", color: "#fff", fontWeight: 900, fontSize: 10, cursor: "pointer", letterSpacing: "0.1em", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "tmiNavBlink 1s step-end infinite" }} />
                    GO LIVE
                  </button>
                  <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                    <button onClick={() => handleLink("/subscribe")} style={{ flex: 1, padding: "7px", borderRadius: 6, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: "#00FF88", fontSize: 9, fontWeight: 800, cursor: "pointer" }}>SUBSCRIBE</button>
                    <button onClick={() => handleLink(ROLE_HUB[role ?? ""] ?? "/hub/fan")} style={{ flex: 1, padding: "7px", borderRadius: 6, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700", fontSize: 9, fontWeight: 800, cursor: "pointer" }}>MY HUB</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The neon handle — always visible, 16px wide */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: 16, height: "100%", background: open ? "rgba(0,255,255,0.15)" : "rgba(0,255,255,0.06)",
            border: "none", borderRight: `1px solid rgba(0,255,255,${open ? "0.5" : "0.2"})`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.2s ease",
            willChange: "background",
          }}
        >
          <span style={{
            writingMode: "vertical-rl", textOrientation: "mixed",
            fontSize: 7, fontWeight: 900, color: `rgba(0,255,255,${open ? "0.9" : "0.5"})`,
            letterSpacing: "0.2em", userSelect: "none", transform: "rotate(180deg)",
          }}>
            {open ? "CLOSE" : "TMI-OS"}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes tmiNavBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </>
  );
}
