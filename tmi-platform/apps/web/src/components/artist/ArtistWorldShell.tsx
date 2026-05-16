"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import ArtistBackstageRail from "./ArtistBackstageRail";
import ArtistSetlistRail from "./ArtistSetlistRail";
import ArtistRevenueRail from "./ArtistRevenueRail";
import ArtistTipRail from "./ArtistTipRail";
import ArtistPulseRail from "./ArtistPulseRail";
import ArtistShowRail from "./ArtistShowRail";
import ArtistCurtainShell, { type ArtistShowState, nextShowState } from "./ArtistCurtainShell";
import ArtistStageMonitor from "./ArtistStageMonitor";
import ArtistCommandRail from "./ArtistCommandRail";

interface ArtistWorldShellProps {
  displayName: string;
  slug: string;
  tagline?: string;
  rank?: number;
  isVerified?: boolean;
  articleRoute?: string;
  children?: ReactNode;
  previewWindow?: ReactNode;
}

export default function ArtistWorldShell({
  displayName,
  slug,
  tagline,
  rank,
  isVerified = false,
  articleRoute,
  children,
  previewWindow,
}: ArtistWorldShellProps) {
  const [showState, setShowState] = useState<ArtistShowState>("pre-show");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #040614 0%, #06030f 55%, #030610 100%)",
        color: "#e4e4f0",
        position: "relative",
      }}
    >
      {/* ── Ambient neon glow backdrop ── */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          background:
            "radial-gradient(ellipse 60% 40% at 15% 20%, rgba(0,255,255,0.05) 0%, transparent 70%)," +
            "radial-gradient(ellipse 50% 35% at 85% 70%, rgba(255,45,170,0.05) 0%, transparent 70%)",
        }}
      />

      {/* ── Top navigation bar ── */}
      <nav
        style={{
          position: "sticky", top: 0, zIndex: 40,
          borderBottom: "1px solid rgba(0,255,255,0.12)",
          padding: "10px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(4,6,20,0.85)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link
          href="/artists"
          style={{
            fontSize: 8, fontWeight: 800, letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.25)", textTransform: "uppercase", textDecoration: "none",
          }}
        >
          ← ARTISTS
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 7, fontWeight: 900, letterSpacing: "0.24em",
              color: "#00FFFF", textTransform: "uppercase",
              padding: "2px 8px", borderRadius: 4,
              border: "1px solid rgba(0,255,255,0.3)",
              background: "rgba(0,255,255,0.07)",
            }}
          >
            🎤 ARTIST PROFILE
          </span>
          {rank !== undefined && (
            <span
              style={{
                fontSize: 7, fontWeight: 900, letterSpacing: "0.18em",
                color: "#FFD700", textTransform: "uppercase",
                padding: "2px 8px", borderRadius: 4,
                border: "1px solid rgba(255,215,0,0.3)",
                background: "rgba(255,215,0,0.07)",
              }}
            >
              #{rank}
            </span>
          )}
          {showState === "live" && (
            <span
              style={{
                display: "inline-flex", gap: 5, alignItems: "center",
                fontSize: 7, fontWeight: 900, letterSpacing: "0.18em",
                color: "#ff6b6b",
                padding: "2px 8px", borderRadius: 4,
                border: "1px solid rgba(255,60,60,0.4)",
                background: "rgba(255,60,60,0.10)",
              }}
            >
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff4444", boxShadow: "0 0 4px #ff4444" }} />
              LIVE
            </span>
          )}
        </div>
      </nav>

      {/* ── Identity header ── */}
      <header
        style={{
          position: "relative", zIndex: 1,
          padding: "32px 24px 24px",
          borderBottom: "1px solid rgba(0,255,255,0.08)",
          background: "linear-gradient(180deg, rgba(0,255,255,0.04) 0%, transparent 100%)",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
            {/* Avatar */}
            <div
              style={{
                width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
                border: "2px solid rgba(0,255,255,0.4)",
                background: "rgba(0,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, boxShadow: "0 0 24px rgba(0,255,255,0.15)",
              }}
            >
              🎤
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1
                  style={{
                    fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 900, margin: 0,
                    color: "#fff", letterSpacing: "-0.02em",
                    textShadow: "0 0 30px rgba(0,255,255,0.25)",
                  }}
                >
                  {displayName}
                </h1>
                {isVerified && <span style={{ fontSize: 14 }} title="Verified">✅</span>}
              </div>
              {tagline && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "5px 0 0" }}>{tagline}</p>
              )}
              {children && (
                <div style={{ marginTop: 14 }}>{children}</div>
              )}
            </div>
            {articleRoute && (
              <div style={{ marginLeft: "auto" }}>
                <Link
                  href={articleRoute}
                  style={{
                    fontSize: 8, fontWeight: 800, color: "#00FFFF",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    textDecoration: "none", padding: "6px 14px", borderRadius: 6,
                    border: "1px solid rgba(0,255,255,0.4)",
                    background: "rgba(0,255,255,0.06)",
                  }}
                >
                  READ FEATURE →
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main zone grid ── */}
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 80px", position: "relative", zIndex: 1 }}>

        {previewWindow ? <section style={{ marginBottom: 20 }}>{previewWindow}</section> : null}

        {/* ── Zone: STAGE COMMAND — Curtain + Monitor + Command Rail ── */}
        <section
          data-zone="STAGE_COMMAND"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(160px, 200px) minmax(0, 1fr) minmax(160px, 200px)",
            gap: 16,
            alignItems: "start",
            marginBottom: 20,
          }}
        >
          {/* Curtain state controller */}
          <ArtistCurtainShell
            showState={showState}
            showTitle={`${displayName} — Live Show`}
            onStateChange={setShowState}
          />

          {/* CRT stage monitor */}
          <ArtistStageMonitor
            showState={showState}
            artistName={displayName}
            currentTrack="Underground Signal"
            audienceCount={2847}
          />

          {/* Command rail */}
          <ArtistCommandRail
            showState={showState}
            slug={slug}
            onStateChange={setShowState}
          />
        </section>

        {/* ── Zone: SHOW SCHEDULE — full width ── */}
        <section data-zone="SHOW_RAIL" style={{ marginBottom: 20 }}>
          <ArtistShowRail />
        </section>

        {/* ── Two-column zone grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ── Left: Setlist + Backstage ── */}
          <div>
            <section data-zone="SETLIST_RAIL">
              <ArtistSetlistRail />
            </section>
            <section data-zone="BACKSTAGE_RAIL">
              <ArtistBackstageRail />
            </section>
          </div>

          {/* ── Right: Pulse + Revenue + Tips ── */}
          <div>
            <section data-zone="PULSE_RAIL">
              <ArtistPulseRail />
            </section>
            <section data-zone="REVENUE_RAIL">
              <ArtistRevenueRail />
            </section>
            <section data-zone="TIP_RAIL">
              <ArtistTipRail />
            </section>
          </div>
        </div>

        {/* ── Rankings footer strip ── */}
        <div
          style={{
            marginTop: 24,
            padding: "14px 20px",
            borderRadius: 10,
            border: "1px solid rgba(0,255,255,0.08)",
            background: "rgba(0,255,255,0.03)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
            RANKINGS
          </span>
          <Link
            href={`/rankings?q=${slug}`}
            style={{
              fontSize: 10, color: "rgba(0,255,255,0.5)", textDecoration: "none",
              letterSpacing: "0.08em",
            }}
          >
            View full ranking history →
          </Link>
        </div>
      </main>
    </div>
  );
}
