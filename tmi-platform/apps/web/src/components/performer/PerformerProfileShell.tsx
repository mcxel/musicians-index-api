import { ImageSlotWrapper } from '@/components/visual-enforcement';
// Performer Profile Shell — wraps PerformerBattleRail, PerformerBookingRail, PerformerMediaRail.
// Server component.

import { type ReactNode } from "react";
import Link from "next/link";
import type { SponsorSlot } from "@/components/performer/DynamicRadialAura";
import PerformerAvatarAura from "@/components/performer/PerformerAvatarAura";

interface PerformerProfileShellProps {
  displayName: string;
  slug: string;
  children: ReactNode;
  tagline?: string;
  isVerified?: boolean;
  rank?: number;
  battleRecord?: { wins: number; losses: number };
  articleRoute?: string;
  previewWindow?: ReactNode;
  /** Active sponsors shown orbiting the avatar via DynamicRadialAura */
  sponsorAura?: SponsorSlot[];
}

const ACCENT = "#FF2DAA";

export default function PerformerProfileShell({
  displayName,
  slug,
  children,
  tagline,
  isVerified = false,
  rank,
  battleRecord,
  articleRoute,
  previewWindow,
  sponsorAura = [],
}: PerformerProfileShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #06070d 0%, #040516 55%, #07030f 100%)",
        color: "#e4e4f0",
      }}
    >
      {/* ── Top nav ── */}
      <nav
        style={{
          borderBottom: `1px solid ${ACCENT}22`,
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `${ACCENT}07`,
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href="/home/1"
            style={{
              fontSize: 8, fontWeight: 800, letterSpacing: "0.18em",
              color: "rgba(255,45,170,0.5)", textTransform: "uppercase", textDecoration: "none",
            }}
          >
            ⌂ HOME
          </Link>
          <Link
            href="/performers"
            style={{
              fontSize: 8, fontWeight: 800, letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.3)", textTransform: "uppercase", textDecoration: "none",
            }}
          >
            ← PERFORMERS
          </Link>
        </div>
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.24em",
            color: ACCENT,
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: 4,
            border: `1px solid ${ACCENT}35`,
            background: `${ACCENT}0c`,
          }}
        >
          🎭 Performer Profile
        </span>
      </nav>

      {/* ── Identity header ── */}
      <header
        style={{
          padding: "32px 24px 24px",
          maxWidth: 960,
          margin: "0 auto",
          borderBottom: `1px solid ${ACCENT}14`,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          <PerformerAvatarAura
            sponsors={sponsorAura}
            performerName={displayName}
            accentColor={ACCENT}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: "clamp(20px, 4vw, 32px)",
                  fontWeight: 900,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {displayName}
              </h1>
              {isVerified && <span style={{ fontSize: 12 }} title="Verified">✅</span>}
              {rank !== undefined && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    color: ACCENT,
                    letterSpacing: "0.18em",
                    padding: "2px 8px",
                    borderRadius: 4,
                    border: `1px solid ${ACCENT}40`,
                    background: `${ACCENT}10`,
                    textTransform: "uppercase",
                  }}
                >
                  #{rank} Ranked
                </span>
              )}
              {battleRecord && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {battleRecord.wins}W – {battleRecord.losses}L
                </span>
              )}
            </div>
            {tagline && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>{tagline}</p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              {articleRoute && (
                <Link
                  href={articleRoute}
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: ACCENT,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    padding: "4px 12px",
                    borderRadius: 6,
                    border: `1px solid ${ACCENT}40`,
                    background: `${ACCENT}0c`,
                  }}
                >
                  Read Feature →
                </Link>
              )}
              <Link
                href={`/rankings?q=${slug}`}
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Rankings
              </Link>
              <Link
                href={`/battles?performer=${slug}`}
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Battle History
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Rail content ── */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 60px" }}>
        {previewWindow ? <section style={{ marginBottom: 24 }}>{previewWindow}</section> : null}
        {children}
      </main>
    </div>
  );
}
