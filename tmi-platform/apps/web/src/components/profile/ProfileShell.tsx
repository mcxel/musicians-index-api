import { ImageSlotWrapper } from '@/components/visual-enforcement';
// Universal Profile Shell — shared by artist, performer, fan, sponsor, venue, advertiser.
// Magazine framing with rail system. Server component.

import { type ReactNode } from "react";
import Link from "next/link";

export type ProfileRole =
  | "artist"
  | "performer"
  | "fan"
  | "sponsor"
  | "advertiser"
  | "venue";

const ROLE_CONFIG: Record<ProfileRole, { accent: string; label: string; icon: string; backRoute: string }> = {
  artist:     { accent: "#00FFFF", label: "Artist",     icon: "🎤", backRoute: "/artists" },
  performer:  { accent: "#FF2DAA", label: "Performer",  icon: "🎭", backRoute: "/performers" },
  fan:        { accent: "#FFD700", label: "Fan",        icon: "⭐", backRoute: "/fans" },
  sponsor:    { accent: "#AA2DFF", label: "Sponsor",    icon: "🏆", backRoute: "/sponsors" },
  advertiser: { accent: "#00E5FF", label: "Advertiser", icon: "📣", backRoute: "/advertisers" },
  venue:      { accent: "#FF8C00", label: "Venue",      icon: "🏟", backRoute: "/venues" },
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
}: ProfileShellProps) {
  const cfg = ROLE_CONFIG[role];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #06070d 0%, #040516 55%, #07030f 100%)",
        color: "#e4e4f0",
      }}
    >
      {/* ── Top nav bar ── */}
      <nav
        style={{
          borderBottom: `1px solid ${cfg.accent}22`,
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `${cfg.accent}07`,
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "blur(12px)",
        }}
      >
        <Link
          href={cfg.backRoute}
          style={{
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          ← {cfg.label}s
        </Link>
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
      <header
        style={{
          padding: "32px 24px 24px",
          maxWidth: 960,
          margin: "0 auto",
          borderBottom: `1px solid ${cfg.accent}14`,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          {/* Avatar */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: `2px solid ${cfg.accent}50`,
              background: `${cfg.accent}14`,
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: `0 0 20px ${cfg.accent}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <ImageSlotWrapper imageId="img-8ytxfx" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
            ) : (
              cfg.icon
            )}
          </div>

          {/* Name block */}
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
              {isVerified && (
                <span style={{ fontSize: 12 }} title="Verified">✅</span>
              )}
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
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>{tagline}</p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
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

      {/* ── Rail content area ── */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 60px" }}>
        {children}
      </main>
    </div>
  );
}
