"use client";

// Canon source: Tmi Homepage 2.png — issue header strip
// Structure: TMI logo · CURRENT WEEK badge · Weekly Crown Winner chip · Search · Notifications · Profile icon

import Link from "next/link";

interface MagazineIssueHeaderProps {
  issueLabel?: string;          // "CURRENT WEEK" | "ISSUE 001"
  crownWinner?: string;         // artist name for the crown chip
  crownWinnerHref?: string;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  profileHref?: string;
  notificationCount?: number;
}

export default function MagazineIssueHeader({
  issueLabel = "CURRENT WEEK",
  crownWinner,
  crownWinnerHref = "/artists",
  onSearchClick,
  onNotificationsClick,
  profileHref = "/profile",
  notificationCount = 0,
}: MagazineIssueHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 20px",
        background: "rgba(5,5,16,0.92)",
        borderBottom: "1px solid rgba(255,45,170,0.15)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        flexWrap: "wrap",
      }}
    >
      {/* TMI Logo */}
      <Link
        href="/magazine"
        style={{
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.25em", color: "#FF2DAA" }}>THE</span>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#fff" }}>MUSICIAN'S</span>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#00FFFF" }}>INDEX</span>
      </Link>

      {/* Issue badge */}
      <div
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.25em",
          color: "#FF2DAA",
          border: "1px solid rgba(255,45,170,0.35)",
          borderRadius: 5,
          padding: "3px 10px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {issueLabel}
      </div>

      {/* Crown winner chip */}
      {crownWinner && (
        <Link
          href={crownWinnerHref}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 8,
            fontWeight: 800,
            color: "#FFD700",
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.3)",
            borderRadius: 20,
            padding: "3px 10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <span>WEEKLY CROWN WINNER</span>
          <span
            style={{
              background: "#FFD700",
              color: "#050510",
              fontWeight: 900,
              borderRadius: 10,
              padding: "1px 8px",
              fontSize: 9,
            }}
          >
            {crownWinner}
          </span>
          {/* Lightning bolt — canon detail */}
          <span style={{ fontSize: 10 }}>⚡</span>
        </Link>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Action icons */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {/* Search */}
        <button
          onClick={onSearchClick}
          aria-label="Search"
          style={iconBtnStyle}
        >
          <SearchIcon />
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ""}`}
          style={{ ...iconBtnStyle, position: "relative" }}
        >
          <BellIcon />
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#FF2DAA",
                fontSize: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
              }}
            >
              {notificationCount > 9 ? "9" : notificationCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <Link
          href={profileHref}
          aria-label="Profile"
          style={{ ...iconBtnStyle, textDecoration: "none" }}
        >
          <PersonIcon />
        </Link>
      </div>
    </header>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "rgba(255,255,255,0.6)",
  flexShrink: 0,
};

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
