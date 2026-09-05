"use client";

/**
 * PerformerNetworkCommandCenter — Discover + Near You + Promote + Booking rails.
 * Mounted at /hub/performer/network (avoids mid-edit conflict with PerformerShell root).
 * Rule 26: real photo/video/live only — no fan avatars.
 */

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import PerformerDiscoveryWall from "./PerformerDiscoveryWall";
import PerformerVenueNearYouMap from "./PerformerVenueNearYouMap";
import PerformerBoostPromotePanel from "./PerformerBoostPromotePanel";
import PerformerBookingProfilePanel from "./PerformerBookingProfilePanel";
import PerformerOpportunityInsightsRail from "./PerformerOpportunityInsightsRail";
import PerformerCollabLookingForRail from "./PerformerCollabLookingForRail";
import DigitalTicketPricingPanel from "./DigitalTicketPricingPanel";
import BookingDemandHeatMap from "./BookingDemandHeatMap";

type TabId =
  | "discover"
  | "near"
  | "promote"
  | "booking"
  | "insights"
  | "collab"
  | "tickets"
  | "heatmap";

const TABS: { id: TabId; label: string }[] = [
  { id: "discover", label: "Discover" },
  { id: "near", label: "Near You" },
  { id: "promote", label: "Promote" },
  { id: "booking", label: "Booking" },
  { id: "insights", label: "Insights" },
  { id: "collab", label: "Collab" },
  { id: "tickets", label: "Digital Tickets" },
  { id: "heatmap", label: "Demand Map" },
];

interface Props {
  ownerId?: string;
  displayName?: string;
  mode?: "performer" | "venue";
}

export default function PerformerNetworkCommandCenter({
  ownerId = "me",
  displayName = "Performer",
  mode = "performer",
}: Props) {
  const [tab, setTab] = useState<TabId>("discover");
  const accent = mode === "venue" ? "#22c55e" : "#00FFFF";

  const title = useMemo(
    () =>
      mode === "venue"
        ? "Venue Discovery & Booking Command"
        : "Performer Discovery & Booking Command",
    [mode],
  );

  return (
    <div style={page}>
      <div style={glow} />
      <div style={wrap}>
        <header style={hero(accent)}>
          <div>
            <div style={eyebrow(accent)}>
              {mode === "venue" ? "VENUE HUB · NETWORK" : "PERFORMER COMMAND CENTER · NETWORK"}
            </div>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 900 }}>
              {title}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              {displayName} · Discover · Near You · Promote · Book — one tap to real destinations.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={mode === "venue" ? "/hub/venue" : "/hub/performer"} style={ghostBtn}>
              ← Hub
            </Link>
            <Link href="/booking" style={primaryBtn(accent)}>
              Open Booking
            </Link>
          </div>
        </header>

        <nav style={tabNav} aria-label="Network command tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={tabBtn(tab === t.id, accent)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tab === "discover" && (
            <PerformerDiscoveryWall
              kind={mode === "venue" ? "performer" : "all"}
              accent={accent}
            />
          )}
          {tab === "near" && <PerformerVenueNearYouMap accent="#AA2DFF" />}
          {tab === "promote" && (
            <PerformerBoostPromotePanel
              ownerId={ownerId}
              ownerRole={mode === "venue" ? "venue" : "performer"}
              accent="#FFD700"
            />
          )}
          {tab === "booking" && (
            <PerformerBookingProfilePanel
              entityId={ownerId}
              entityType={mode === "venue" ? "venue" : "performer"}
              accent="#00FF88"
            />
          )}
          {tab === "insights" && (
            <PerformerOpportunityInsightsRail
              ownerId={ownerId}
              mode={mode}
              accent={accent}
            />
          )}
          {tab === "collab" && <PerformerCollabLookingForRail />}
          {tab === "tickets" && <DigitalTicketPricingPanel />}
          {tab === "heatmap" && <BookingDemandHeatMap />}
        </div>
      </div>
    </div>
  );
}

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#050510",
  color: "#fff",
  position: "relative",
  paddingBottom: 80,
};
const glow: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(circle at 70% 10%, rgba(0,255,255,0.08), transparent 40%), radial-gradient(circle at 20% 80%, rgba(255,45,170,0.06), transparent 40%)",
};
const wrap: CSSProperties = {
  position: "relative",
  zIndex: 1,
  maxWidth: 1200,
  margin: "0 auto",
  padding: "24px 20px",
};
function hero(accent: string): CSSProperties {
  return {
    padding: "24px 28px",
    borderRadius: 18,
    marginBottom: 16,
    background: `linear-gradient(135deg, ${accent}14, rgba(5,5,16,0.95))`,
    border: `1px solid ${accent}33`,
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "flex-start",
  };
}
function eyebrow(accent: string): CSSProperties {
  return {
    fontSize: 9,
    letterSpacing: "0.32em",
    color: accent,
    fontWeight: 800,
    marginBottom: 6,
  };
}
const ghostBtn: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.7)",
  textDecoration: "none",
  fontSize: 11,
  fontWeight: 800,
};
function primaryBtn(accent: string): CSSProperties {
  return {
    padding: "10px 16px",
    borderRadius: 10,
    border: `1px solid ${accent}55`,
    background: `${accent}18`,
    color: accent,
    textDecoration: "none",
    fontSize: 11,
    fontWeight: 800,
  };
}
const tabNav: CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginBottom: 16,
};
function tabBtn(active: boolean, accent: string): CSSProperties {
  return {
    borderRadius: 999,
    border: `1px solid ${active ? accent : "rgba(255,255,255,0.12)"}`,
    background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
    color: active ? accent : "rgba(255,255,255,0.55)",
    padding: "8px 12px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.08em",
    cursor: "pointer",
  };
}
