"use client";

/**
 * Discovery Side Panel — global "☰ DISCOVERY" overlay (P0-B, Discovery Loop Phase 3).
 * Mounted once in the root layout so it's available on every page without per-page wiring.
 * Pulls the exact same BillboardLiveWall + GlobalLiveSessionRegistry data that Home 1/3/5
 * and venue pages use — no separate discovery data source (Rule 8: Registry First).
 *
 * Category list is intentionally limited to real GlobalLiveSessionRegistry StreamCategory
 * values (battle/cypher/concert/challenge/game/live/session) plus a real Venues tab from
 * VenueRegistry. "LIVE_COMEDY"/"LIVE_DANCE"/"LIVE_FANS" are NOT included — the registry has
 * no distinct category for those today, and fabricating tabs with no real backing data would
 * just be a new instance of the exact fake-discovery problem Discovery Loop Phase 1-3 fixed.
 */

import { useState } from "react";
import Link from "next/link";
import BillboardLiveWall from "@/components/media/BillboardLiveWall";
import { getLiveVenues } from "@/lib/venues/VenueRegistry";

type Category = { id: string; label: string; icon: string; category?: string };

const CATEGORIES: Category[] = [
  { id: "all",       label: "ALL LIVE",      icon: "🔴" },
  { id: "live",      label: "LIVE MUSIC",    icon: "🎵", category: "live" },
  { id: "battle",    label: "LIVE BATTLES",  icon: "⚔️", category: "battle" },
  { id: "cypher",    label: "LIVE CYPHERS",  icon: "🎤", category: "cypher" },
  { id: "challenge", label: "LIVE CHALLENGES", icon: "🏆", category: "challenge" },
  { id: "concert",   label: "LIVE CONCERTS", icon: "🎸", category: "concert" },
  { id: "game",      label: "GAMES",         icon: "🎮", category: "game" },
  { id: "venues",    label: "LIVE VENUES",   icon: "🏟️" },
];

const ACCENT = "#FF2DAA";

export default function DiscoverySidePanel() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Category>(CATEGORIES[0]!);

  const liveVenues = active.id === "venues" ? getLiveVenues() : [];

  return (
    <>
      {/* Trigger — right edge, mirrors NavigationRail's left-edge placement */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Discovery"
        title="Discovery"
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 9990,
          display: open ? "none" : "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: "14px 8px",
          background: "rgba(5,5,16,0.85)",
          border: `1px solid ${ACCENT}55`,
          borderRight: "none",
          borderRadius: "10px 0 0 10px",
          color: ACCENT,
          cursor: "pointer",
          writingMode: "vertical-rl",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.14em",
          backdropFilter: "blur(8px)",
        }}
      >
        <span style={{ writingMode: "horizontal-tb", fontSize: 14 }}>☰</span>
        DISCOVERY
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10049, backdropFilter: "blur(2px)" }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100dvh",
          width: "min(420px, 92vw)",
          zIndex: 10050,
          background: "linear-gradient(160deg, #0a0614, #050310)",
          borderLeft: `1px solid ${ACCENT}33`,
          boxShadow: open ? "-12px 0 48px rgba(0,0,0,0.6)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: `1px solid ${ACCENT}22` }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: ACCENT }}>☰ DISCOVERY</div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close Discovery"
            title="Close"
            style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 13 }}
          >
            ✕
          </button>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "12px 16px", borderBottom: `1px solid ${ACCENT}14` }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.06em",
                cursor: "pointer",
                background: active.id === c.id ? `${ACCENT}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${active.id === c.id ? ACCENT + "66" : "rgba(255,255,255,0.1)"}`,
                color: active.id === c.id ? ACCENT : "rgba(255,255,255,0.55)",
              }}
            >
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>

        {/* Content — pulls the exact same registry-backed data as Home 1/3/5 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {active.id === "venues" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {liveVenues.length === 0 && (
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "24px 0" }}>No venues live right now.</p>
              )}
              {liveVenues.map((v) => (
                <Link key={v.slug} href={`/venues/${v.slug}`} onClick={() => setOpen(false)} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{v.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{v.city}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <BillboardLiveWall
              mode="home"
              maxTiles={12}
              category={active.id === "all" ? undefined : active.category}
              title={undefined}
            />
          )}
        </div>

        <div style={{ padding: "12px 16px", borderTop: `1px solid ${ACCENT}14` }}>
          <Link href="/live/lobby" onClick={() => setOpen(false)} style={{ display: "block", textAlign: "center", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: ACCENT, textDecoration: "none", padding: "8px 0" }}>
            VIEW ALL LIVE ROOMS →
          </Link>
        </div>
      </div>
    </>
  );
}
