"use client";

import Link from "next/link";
import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

type VenueLobbyRouteShellProps = {
  venueSlug: string;
  venueName?: string;
};

export default function VenueLobbyRouteShell({ venueSlug, venueName }: VenueLobbyRouteShellProps) {
  const displayName = venueName ?? venueSlug.replace(/-/g, " ").toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #080410, #201237 50%, #090512)" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(8,4,16,0.96)", borderBottom: "1px solid rgba(111,74,165,0.4)", padding: "8px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/venues/${venueSlug}`} style={{ color: "#c4b5fd", fontSize: 10, textDecoration: "none", border: "1px solid rgba(111,74,165,0.4)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← VENUE</Link>
        <strong style={{ color: "#c4b5fd", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>LOBBY THEATER</strong>
        <span style={{ color: "#4e3a6d", fontSize: 10 }}>{displayName}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Link href={`/venues/${venueSlug}/stage`} style={{ color: "#64748b", fontSize: 10, textDecoration: "none", border: "1px solid #334155", borderRadius: 5, padding: "3px 9px" }}>STAGE</Link>
          <Link href={`/venues/${venueSlug}/tickets`} style={{ color: "#64748b", fontSize: 10, textDecoration: "none", border: "1px solid #334155", borderRadius: 5, padding: "3px 9px" }}>TICKETS</Link>
        </div>
      </div>
      <LobbyTheaterShell slug={venueSlug} mode="room" />
    </div>
  );
}
