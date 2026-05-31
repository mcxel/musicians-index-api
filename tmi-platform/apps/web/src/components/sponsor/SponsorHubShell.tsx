"use client";

import Link from "next/link";
import { Suspense } from "react";
import SponsorCampaignRail from "@/components/sponsor/SponsorCampaignRail";
import SponsorPlacementRail from "@/components/sponsor/SponsorPlacementRail";
import SponsorPrizeRail from "@/components/sponsor/SponsorPrizeRail";
import SponsorAnalyticsRail from "@/components/sponsor/SponsorAnalyticsRail";
import SponsorContractsRail from "@/components/sponsor/SponsorContractsRail";
import SponsorGiveawayRail from "@/components/sponsor/SponsorGiveawayRail";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";

const ACCENT = "#FFD700";
const BG = "#050510";

const STATS = [
  { label: "Active Campaigns", value: "7",       sub: "Running now",          color: "#FFD700" },
  { label: "Total Impressions", value: "2.4M",   sub: "Last 30 days",         color: "#00FFFF" },
  { label: "Artists Sponsored", value: "18",     sub: "Active agreements",    color: "#AA2DFF" },
  { label: "Budget Deployed",   value: "$42K",   sub: "This season",          color: "#FF2DAA" },
  { label: "Avg Engagement",    value: "8.3%",   sub: "Click-through rate",   color: "#00FF88" },
  { label: "ROI",               value: "3.7×",   sub: "Return on spend",      color: "#FFD700" },
];

const QUICK_LINKS = [
  { href: "/sponsor/campaigns",   label: "Campaigns",       icon: "📣", color: "#FFD700" },
  { href: "/sponsor/placements",  label: "Placements",      icon: "📍", color: "#00FFFF" },
  { href: "/sponsor/contests",    label: "Contests",        icon: "🏆", color: "#AA2DFF" },
  { href: "/sponsor/analytics",   label: "Analytics",       icon: "📊", color: "#FF2DAA" },
  { href: "/sponsor/contracts",   label: "Contracts",       icon: "📋", color: "#00FF88" },
  { href: "/sponsor/payments",    label: "Payments",        icon: "💳", color: "#FFD700" },
  { href: "/giveaway",            label: "Giveaway",        icon: "🎁", color: "#FF6B35" },
  { href: "/sponsor/profile",     label: "Brand Profile",   icon: "🏢", color: "#AA2DFF" },
];

const TOP_ARTISTS = [
  { name: "Nova Cipher",  genre: "EDM",      engagement: "9.4%", slug: "nova-cipher",  color: "#FFD700" },
  { name: "Astra Nova",   genre: "R&B",      engagement: "8.1%", slug: "astra-nova",   color: "#FF2DAA" },
  { name: "Zion Freq",    genre: "Hip-Hop",  engagement: "7.8%", slug: "zion-freq",    color: "#00FFFF" },
  { name: "DJ Lumi",      genre: "House",    engagement: "7.2%", slug: "dj-lumi",      color: "#AA2DFF" },
];

function RailSkeleton() {
  return (
    <div style={{ height: 96, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", animation: "pulse 2s ease-in-out infinite" }} />
  );
}

export default function SponsorHubShell() {
  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80, position: "relative" }}>

      {/* Ambient radial glow */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 20%, rgba(255,215,0,0.07), transparent 50%), radial-gradient(circle at 20% 80%, rgba(170,45,255,0.06), transparent 45%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto", padding: "28px 24px" }}>

        {/* Hero header */}
        <div style={{ padding: "28px 32px", background: `linear-gradient(135deg, rgba(255,215,0,0.12), rgba(5,5,16,0.95))`, border: `1px solid ${ACCENT}30`, borderRadius: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>SPONSOR CONTROL CENTER · TMI PLATFORM</div>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, letterSpacing: "-0.02em" }}>Sponsor Hub</h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              Campaigns · Artist Sponsorships · Prize Pools · Contracts · Analytics
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/sponsor/campaigns/new" style={{ padding: "10px 22px", borderRadius: 10, background: `${ACCENT}18`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
              + NEW CAMPAIGN
            </Link>
            <Link href="/sponsor/analytics" style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              ANALYTICS →
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ padding: "18px 16px", background: `${s.color}08`, border: `1px solid ${s.color}22`, borderRadius: 14, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 800, marginTop: 6, letterSpacing: "0.04em" }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, marginBottom: 28 }}>
          {QUICK_LINKS.map((q) => (
            <Link key={q.href} href={q.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 10px", background: `${q.color}08`, border: `1px solid ${q.color}22`, borderRadius: 12, textDecoration: "none", color: "#fff", transition: "background 120ms" }}>
              <span style={{ fontSize: 22 }}>{q.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", color: q.color }}>{q.label}</span>
            </Link>
          ))}
        </div>

        {/* Top sponsored artists */}
        <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}18`, borderRadius: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: ACCENT, fontWeight: 800 }}>TOP SPONSORED ARTISTS</div>
            <Link href="/artists" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.08em" }}>BROWSE ALL →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {TOP_ARTISTS.map((a) => (
              <Link key={a.slug} href={`/artist/${a.slug}`} style={{ textDecoration: "none", color: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: `${a.color}0A`, border: `1px solid ${a.color}28`, borderRadius: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${a.color}, ${BG})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎤</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{a.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{a.genre}</div>
                    <div style={{ fontSize: 9, color: a.color, fontWeight: 700, marginTop: 2 }}>{a.engagement} CTR</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Rails */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Suspense fallback={<RailSkeleton />}><SponsorCampaignRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><SponsorPlacementRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><SponsorGiveawayRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><SponsorPrizeRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><SponsorAnalyticsRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><SponsorContractsRail /></Suspense>
        </div>
      </div>

      <TMIVideoMonitor label="SPONSOR CAM" position="bottom-right" />
    </div>
  );
}
