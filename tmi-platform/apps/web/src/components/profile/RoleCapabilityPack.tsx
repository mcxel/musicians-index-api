"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ProfileRole } from "@/components/profile/ProfileShell";

export interface RoleCapabilityPackProps {
  role: "promoter" | "venue" | "advertiser" | "sponsor";
  displayName: string;
  slug: string;
  accentColor?: string;
}

export default function RoleCapabilityPack({
  role,
  displayName,
  slug,
  accentColor = "#00FF88",
}: RoleCapabilityPackProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  const tabStyle = (id: string): React.CSSProperties => ({
    padding: "8px 16px",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    borderRadius: 6,
    border: activeTab === id ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
    background: activeTab === id ? `${accentColor}18` : "rgba(255,255,255,0.03)",
    color: activeTab === id ? accentColor : "rgba(255,255,255,0.6)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${accentColor}25`,
    borderRadius: 8,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  if (role === "promoter") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
        {/* Capability Navigation */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${accentColor}20`, paddingBottom: 10 }}>
          <button style={tabStyle("overview")} onClick={() => setActiveTab("overview")}>Events & Campaigns</button>
          <button style={tabStyle("artists")} onClick={() => setActiveTab("artists")}>Artist Roster</button>
          <button style={tabStyle("analytics")} onClick={() => setActiveTab("analytics")}>Pitch Analytics</button>
          <button style={tabStyle("press")} onClick={() => setActiveTab("press")}>Press Releases</button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <div style={cardStyle}>
              <span style={{ fontSize: 9, color: accentColor, fontWeight: 900, letterSpacing: "0.15em" }}>UPCOMING CAMPAIGNS</span>
              <h3 style={{ fontSize: 16, margin: "2px 0 0", color: "#fff", fontWeight: 800 }}>Summer Festival Launch</h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>4 Artists booked · 12,000 target attendees</p>
              <Link href="/promotions" style={{ fontSize: 9, color: accentColor, textDecoration: "none", fontWeight: 800, marginTop: 4 }}>
                MANAGE PROMOTION OPPORTUNITIES →
              </Link>
            </div>
            <div style={cardStyle}>
              <span style={{ fontSize: 9, color: accentColor, fontWeight: 900, letterSpacing: "0.15em" }}>PRESS RELEASES</span>
              <h3 style={{ fontSize: 16, margin: "2px 0 0", color: "#fff", fontWeight: 800 }}>Official Lineup Drop</h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>Published to TMI News Feed · 8.4K reads</p>
              <Link href="/articles" style={{ fontSize: 9, color: accentColor, textDecoration: "none", fontWeight: 800, marginTop: 4 }}>
                VIEW MAGAZINE FEATURE →
              </Link>
            </div>
          </div>
        )}

        {/* Artists Tab */}
        {activeTab === "artists" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {["Ray Journey", "Zuri Bloom", "Nova Cipher"].map((name, i) => (
              <div key={i} style={cardStyle}>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{name}</span>
                <span style={{ fontSize: 8, color: accentColor }}>Roster Status: Confirmed</span>
                <Link href={`/artists/${name.toLowerCase().replace(/\s+/g, "-")}`} style={{ fontSize: 8, color: accentColor, fontWeight: 800 }}>
                  OPEN PROFILE →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div style={cardStyle}>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>PITCH CONVERSIONS</span>
              <strong style={{ fontSize: 20, color: accentColor }}>84.2%</strong>
            </div>
            <div style={cardStyle}>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>CAMPAIGN REACH</span>
              <strong style={{ fontSize: 20, color: accentColor }}>142.5K</strong>
            </div>
          </div>
        )}

        {/* Press Tab */}
        {activeTab === "press" && (
          <div style={cardStyle}>
            <span style={{ fontSize: 9, color: accentColor, fontWeight: 900 }}>PRESS RELEASE DISTRIBUTION</span>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              Draft, submit, and syndicate press assets across TMI Magazine and platform news slots.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (role === "venue") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${accentColor}20`, paddingBottom: 10 }}>
          <button style={tabStyle("overview")} onClick={() => setActiveTab("overview")}>Shows & Tickets</button>
          <button style={tabStyle("lineups")} onClick={() => setActiveTab("lineups")}>Lineups</button>
          <button style={tabStyle("assets")} onClick={() => setActiveTab("assets")}>Press Assets</button>
          <button style={tabStyle("promo")} onClick={() => setActiveTab("promo")}>Magazine Promo</button>
        </div>

        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <div style={cardStyle}>
              <span style={{ fontSize: 9, color: accentColor, fontWeight: 900, letterSpacing: "0.15em" }}>UPCOMING SHOWS</span>
              <h3 style={{ fontSize: 16, margin: "2px 0 0", color: "#fff", fontWeight: 800 }}>Friday Night Live Cypher</h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>Capacity: 450 · 320 Tickets Sold</p>
              <Link href={`/venue/tickets?slug=${slug}`} style={{ fontSize: 9, color: accentColor, textDecoration: "none", fontWeight: 800, marginTop: 4 }}>
                MANAGE TICKETING →
              </Link>
            </div>
            <div style={cardStyle}>
              <span style={{ fontSize: 9, color: accentColor, fontWeight: 900, letterSpacing: "0.15em" }}>SEATING CONFIG</span>
              <h3 style={{ fontSize: 16, margin: "2px 0 0", color: "#fff", fontWeight: 800 }}>3D Floor Plan Active</h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>VIP Tables + Front Stage Tier</p>
              <Link href={`/venue/seating?slug=${slug}`} style={{ fontSize: 9, color: accentColor, textDecoration: "none", fontWeight: 800, marginTop: 4 }}>
                EDIT FLOOR PLAN →
              </Link>
            </div>
          </div>
        )}

        {activeTab === "lineups" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div style={cardStyle}>
              <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>MAIN STAGE LINEUP</span>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>Headliner: Lyric Stone · Opener: DJ Storm</p>
            </div>
          </div>
        )}

        {activeTab === "assets" && (
          <div style={cardStyle}>
            <span style={{ fontSize: 9, color: accentColor, fontWeight: 900 }}>VENUE PRESS KIT</span>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              High-res stage photos, acoustics technical rider, and booking contacts.
            </p>
          </div>
        )}

        {activeTab === "promo" && (
          <div style={cardStyle}>
            <span style={{ fontSize: 9, color: accentColor, fontWeight: 900 }}>MAGAZINE VENUE SPOTLIGHT</span>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              Featured venue placement in TMI Magazine Random Page pool.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (role === "advertiser") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${accentColor}20`, paddingBottom: 10 }}>
          <button style={tabStyle("overview")} onClick={() => setActiveTab("overview")}>Campaigns</button>
          <button style={tabStyle("inventory")} onClick={() => setActiveTab("inventory")}>Ad Inventory</button>
          <button style={tabStyle("targeting")} onClick={() => setActiveTab("targeting")}>Targeting</button>
          <button style={tabStyle("billing")} onClick={() => setActiveTab("billing")}>Billing & Conversions</button>
        </div>

        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <div style={cardStyle}>
              <span style={{ fontSize: 9, color: accentColor, fontWeight: 900, letterSpacing: "0.15em" }}>ACTIVE CAMPAIGNS</span>
              <h3 style={{ fontSize: 16, margin: "2px 0 0", color: "#fff", fontWeight: 800 }}>Spatial Audio Gear Banner</h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>14.2K Impressions · 3.8% CTR</p>
              <Link href="/advertiser/campaigns" style={{ fontSize: 9, color: accentColor, textDecoration: "none", fontWeight: 800, marginTop: 4 }}>
                BUILD CAMPAIGN →
              </Link>
            </div>
            <div style={cardStyle}>
              <span style={{ fontSize: 9, color: accentColor, fontWeight: 900, letterSpacing: "0.15em" }}>CREATIVE ASSETS</span>
              <h3 style={{ fontSize: 16, margin: "2px 0 0", color: "#fff", fontWeight: 800 }}>4 Active Display Ads</h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>Google AdSense & TMI Direct</p>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div style={cardStyle}>
            <span style={{ fontSize: 9, color: accentColor, fontWeight: 900 }}>MAGAZINE & LOBBY AD SLOTS</span>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              Reserve dedicated ad units on TMI Magazine spreads and venue lobby rails.
            </p>
          </div>
        )}

        {activeTab === "targeting" && (
          <div style={cardStyle}>
            <span style={{ fontSize: 9, color: accentColor, fontWeight: 900 }}>AUDIENCE TARGETING</span>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              Target by music genre, venue location, artist fan affinity, and demographic segment.
            </p>
          </div>
        )}

        {activeTab === "billing" && (
          <div style={cardStyle}>
            <span style={{ fontSize: 9, color: accentColor, fontWeight: 900 }}>BILLING & CONVERSIONS</span>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              Real-time spend tracking, invoice history, and conversion telemetry.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Sponsor
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${accentColor}20`, paddingBottom: 10 }}>
        <button style={tabStyle("overview")} onClick={() => setActiveTab("overview")}>Sponsorships</button>
        <button style={tabStyle("placements")} onClick={() => setActiveTab("placements")}>Placements</button>
        <button style={tabStyle("creative")} onClick={() => setActiveTab("creative")}>Creative Assets</button>
        <button style={tabStyle("integrations")} onClick={() => setActiveTab("integrations")}>Integrations</button>
      </div>

      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          <div style={cardStyle}>
            <span style={{ fontSize: 9, color: accentColor, fontWeight: 900, letterSpacing: "0.15em" }}>EXCLUSIVE SPONSORSHIP</span>
            <h3 style={{ fontSize: 16, margin: "2px 0 0", color: "#fff", fontWeight: 800 }}>Weekly Battle Arena Presenter</h3>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>Brand logo on stage banner & magazine spread</p>
            <Link href="/sponsor/campaigns" style={{ fontSize: 9, color: accentColor, textDecoration: "none", fontWeight: 800, marginTop: 4 }}>
              VIEW SPONSOR CAMPAIGNS →
            </Link>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: 9, color: accentColor, fontWeight: 900, letterSpacing: "0.15em" }}>SPEND & IMPRESSIONS</span>
            <h3 style={{ fontSize: 16, margin: "2px 0 0", color: "#fff", fontWeight: 800 }}>88.4K Total Impressions</h3>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>Direct TMI Sponsor Contract</p>
          </div>
        </div>
      )}

      {activeTab === "placements" && (
        <div style={cardStyle}>
          <span style={{ fontSize: 9, color: accentColor, fontWeight: 900 }}>HIGH-IMPACT PLACEMENTS</span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>
            Full-page magazine spreads, stage marquee banners, and winner circle trophy callouts.
          </p>
        </div>
      )}

      {activeTab === "creative" && (
        <div style={cardStyle}>
          <span style={{ fontSize: 9, color: accentColor, fontWeight: 900 }}>SPONSOR BRAND ASSETS</span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>
            SVG logos, video motion bumpers, and custom color palettes.
          </p>
        </div>
      )}

      {activeTab === "integrations" && (
        <div style={cardStyle}>
          <span style={{ fontSize: 9, color: accentColor, fontWeight: 900 }}>PLATFORM INTEGRATIONS</span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>
            API integration for live battle sponsorship telemetry.
          </p>
        </div>
      )}
    </div>
  );
}
