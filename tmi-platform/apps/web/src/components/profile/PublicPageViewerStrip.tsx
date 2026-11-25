"use client";

/**
 * TMI chrome around a personal page. The owner does not edit this strip.
 * ROOM links only when a live session already exists in the canonical bootstrap store.
 */

import Link from "next/link";
import ProfileDiscoveryNavigation from "@/components/profile/ProfileDiscoveryNavigation";
import { useGoLiveBootstrapStore } from "@/lib/live/goLiveBootstrapStore";

const linkStyle: React.CSSProperties = {
  color: "#00FFFF",
  minHeight: 44,
  display: "inline-flex",
  alignItems: "center",
  padding: "0 10px",
  textDecoration: "none",
  fontSize: 12,
  letterSpacing: "0.08em",
  fontWeight: 800,
};

export default function PublicPageViewerStrip() {
  const roomId = useGoLiveBootstrapStore((state) => state.roomId);
  const liveSessionId = useGoLiveBootstrapStore((state) => state.liveSessionId);
  const roomHref = roomId ? `/live/rooms/${encodeURIComponent(roomId)}` : null;
  return (
    <header data-testid="public-page-viewer-chrome" data-owner-editable="false">
      <nav data-testid="public-page-viewer-nav" aria-label="TMI" style={{ position: "sticky", top: 0, zIndex: 30, display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 12px", background: "rgba(5,5,16,0.92)", borderBottom: "1px solid rgba(0,255,255,0.35)" }}>
        <Link href="/" style={linkStyle}>HOME</Link>
        <Link href="/hub" data-testid="viewer-hub" style={linkStyle}>HUB</Link>
        {roomHref ? (
          <Link href={roomHref} data-testid="viewer-room" data-room={roomId ?? ""} data-session={liveSessionId ?? ""} style={linkStyle}>ROOM</Link>
        ) : (
          <span data-testid="viewer-room" data-room="none" style={{ ...linkStyle, color: "#8d8aa3" }}>ROOM · none</span>
        )}
        <Link href="/explore" style={linkStyle}>DISCOVER</Link>
        <Link href="/magazine/issue/current?discover=unseen" data-testid="open-magazine" style={linkStyle}>OPEN MAGAZINE</Link>
        <Link href="/live/rooms" style={linkStyle}>LIVE NOW</Link>
        <Link href="/messages" style={linkStyle}>MESSAGES</Link>
        <Link href="/profiles" data-testid="viewer-profiles" style={linkStyle}>PROFILES</Link>
      </nav>
      <ProfileDiscoveryNavigation />
    </header>
  );
}
