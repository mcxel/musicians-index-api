import { ImageSlotWrapper } from "@/components/visual-enforcement";
// Universal Profile Shell — shared by artist, performer, fan, sponsor, venue, advertiser.
// Magazine framing with rail system. Responsive layout calibration.

import { type ReactNode } from "react";
import Link from "next/link";
import UniversalMediaPanel from "@/components/media/UniversalMediaPanel";
import HighFidelityAvatar from "@/components/avatar/HighFidelityAvatar";
import ProfileBackButton from "@/components/profile/ProfileBackButton";

export type ProfileRole =
  | "artist"
  | "performer"
  | "fan"
  | "sponsor"
  | "advertiser"
  | "venue"
  | "promoter";

const ROLE_CONFIG: Record<
  ProfileRole,
  { accent: string; label: string; icon: string; backRoute: string }
> = {
  artist:     { accent: "#00FFFF", label: "Artist",     icon: "🎤", backRoute: "/artists" },
  performer:  { accent: "#FF2DAA", label: "Performer",  icon: "🎭", backRoute: "/performers" },
  fan:        { accent: "#FFD700", label: "Fan",        icon: "⭐", backRoute: "/fans" },
  sponsor:    { accent: "#AA2DFF", label: "Sponsor",    icon: "🏆", backRoute: "/sponsors" },
  advertiser: { accent: "#00E5FF", label: "Advertiser", icon: "📣", backRoute: "/advertisers" },
  venue:      { accent: "#FF8C00", label: "Venue",      icon: "🏟", backRoute: "/venues" },
  promoter:   { accent: "#00FF88", label: "Promoter",  icon: "🎟️", backRoute: "/hub/promoter" },
};

interface ProfileShellProps {
  role: ProfileRole;
  displayName: string;
  slug: string;
  children: ReactNode;
  tagline?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  rank?: number;
  articleRoute?: string;
  avatarMode?: boolean;
  isPlaying?: boolean;
}

export default function ProfileShell({
  role,
  displayName,
  slug,
  children,
  tagline,
  avatarUrl,
  isVerified = false,
  rank,
  articleRoute,
  avatarMode = false,
  isPlaying = false,
}: ProfileShellProps) {
  const cfg = ROLE_CONFIG[role];

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box",
        background: "linear-gradient(160deg, #06070d 0%, #040516 55%, #07030f 100%)",
        color: "#e4e4f0",
      }}
    >
      <style>{`
        .tmi-profile-header {
          padding: 32px 24px 24px;
          max-width: 960px;
          margin: 0 auto;
          border-bottom: 1px solid ${cfg.accent}14;
        }
        .tmi-profile-main {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 24px 60px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 767px) {
          .tmi-profile-header {
            padding: 16px 16px 16px;
          }
          .tmi-profile-main {
            padding: 16px 16px 60px;
          }
        }
      `}</style>

      {/* ── Top nav bar ── */}
      <nav
        style={{
          borderBottom: `1px solid ${cfg.accent}22`,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `${cfg.accent}07`,
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "blur(12px)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <ProfileBackButton
          fallbackHref={cfg.backRoute}
          label={`${cfg.label}s`}
          accentColor={cfg.accent}
        />
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.24em",
            color: cfg.accent,
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: 4,
            border: `1px solid ${cfg.accent}35`,
            background: `${cfg.accent}0c`,
          }}
        >
          {cfg.icon} {cfg.label} Profile
        </span>
      </nav>

      {/* ── Identity header ── */}
      <header className="tmi-profile-header">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          {/* Avatar */}
          <HighFidelityAvatar
            enable3D={role === "fan" || avatarMode}
            imageUrl={avatarUrl}
            name={displayName}
            size={64}
            tierColor={cfg.accent}
            isPlaying={isPlaying}
          />

          {/* Name block */}
          <div style={{ flex: "1 1 220px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: "clamp(18px, 4vw, 30px)",
                  fontWeight: 900,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: "-0.01em",
                  wordBreak: "break-word",
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
                    color: cfg.accent,
                    letterSpacing: "0.18em",
                    padding: "2px 8px",
                    borderRadius: 4,
                    border: `1px solid ${cfg.accent}40`,
                    background: `${cfg.accent}10`,
                    textTransform: "uppercase",
                  }}
                >
                  #{rank} Ranked
                </span>
              )}
            </div>
            {tagline && (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "4px 0 0", lineHeight: 1.4 }}>
                {tagline}
              </p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {articleRoute && (
                <Link
                  href={articleRoute}
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: cfg.accent,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    padding: "4px 12px",
                    borderRadius: 6,
                    border: `1px solid ${cfg.accent}40`,
                    background: `${cfg.accent}0c`,
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
            </div>
          </div>
        </div>
      </header>

      {/* ── Content area ── */}
      <main className="tmi-profile-main">
        {/* Universal video panel — live stream → last video → placeholder */}
        <UniversalMediaPanel slug={slug} displayName={displayName} role={role} />
        {children}
      </main>
    </div>
  );
}
