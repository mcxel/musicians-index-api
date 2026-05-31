"use client";

import Link from "next/link";
import { Suspense } from "react";
import AdvertiserCampaignRail from "@/components/advertiser/AdvertiserCampaignRail";
import AdvertiserPlacementRail from "@/components/advertiser/AdvertiserPlacementRail";
import AdvertiserAnalyticsRail from "@/components/advertiser/AdvertiserAnalyticsRail";
import AdvertiserInventoryRail from "@/components/advertiser/AdvertiserInventoryRail";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";

const ACCENT = "#FF2DAA";
const BG = "#050510";

const STATS = [
  { label: "Active Ads",       value: "12",     sub: "Running now",          color: "#FF2DAA" },
  { label: "Total Impressions",value: "5.1M",   sub: "Last 30 days",         color: "#00FFFF" },
  { label: "CTR",              value: "6.7%",   sub: "Click-through rate",   color: "#FFD700" },
  { label: "Budget Remaining", value: "$8.4K",  sub: "Of $15K allocated",    color: "#AA2DFF" },
  { label: "Conversions",      value: "847",    sub: "Tracked this month",   color: "#00FF88" },
  { label: "ROAS",             value: "4.2×",   sub: "Return on ad spend",   color: "#FF2DAA" },
];

const QUICK_LINKS = [
  { href: "/advertiser/campaigns",  label: "Campaigns",      icon: "📣", color: "#FF2DAA" },
  { href: "/advertiser/placements", label: "Placements",     icon: "📍", color: "#00FFFF" },
  { href: "/advertiser/analytics",  label: "Analytics",      icon: "📊", color: "#FFD700" },
  { href: "/hub/advertiser",        label: "Ad Inventory",   icon: "🗃️", color: "#AA2DFF" },
  { href: "/billing",               label: "Billing",        icon: "💳", color: "#00FF88" },
  { href: "/advertiser/profile",    label: "Brand Profile",  icon: "🏢", color: "#FF6B35" },
];

const AD_SURFACES = [
  { surface: "Home 1 — Cover",     impressions: "142K", ctr: "8.1%", status: "live", color: "#FFD700" },
  { surface: "Home 3 — Live World",impressions: "98K",  ctr: "7.4%", status: "live", color: "#00FF88" },
  { surface: "Magazine Articles",  impressions: "214K", ctr: "5.8%", status: "live", color: "#00FFFF" },
  { surface: "Game Shows",         impressions: "87K",  ctr: "6.9%", status: "live", color: "#AA2DFF" },
  { surface: "Battle Pages",       impressions: "63K",  ctr: "9.2%", status: "live", color: "#FF2DAA" },
  { surface: "Fan Hub",            impressions: "44K",  ctr: "4.1%", status: "paused", color: "#FF6B35" },
];

const NETWORK_STATUS = [
  { name: "Google AdSense", active: true,  fill: 92, color: "#00FF88" },
  { name: "Media.net",      active: true,  fill: 78, color: "#00FFFF" },
  { name: "Amazon APS",     active: false, fill: 0,  color: "#FFD700" },
  { name: "Carbon Ads",     active: true,  fill: 65, color: "#AA2DFF" },
  { name: "Propeller Ads",  active: false, fill: 0,  color: "#FF6B35" },
];

function RailSkeleton() {
  return <div style={{ height: 96, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }} />;
}

export default function AdvertiserHubShell() {
  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80, position: "relative" }}>

      {/* Ambient glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 75% 20%, rgba(255,45,170,0.08), transparent 50%), radial-gradient(circle at 20% 70%, rgba(0,255,255,0.05), transparent 45%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto", padding: "28px 24px" }}>

        {/* Hero header */}
        <div style={{ padding: "28px 32px", background: "linear-gradient(135deg, rgba(255,45,170,0.12), rgba(5,5,16,0.95))", border: `1px solid ${ACCENT}30`, borderRadius: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>ADVERTISER COMMAND CENTER · TMI PLATFORM</div>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, letterSpacing: "-0.02em" }}>Advertiser Hub</h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              Multi-network ad rotation · Live placement tracking · Real-time ROAS analytics
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/advertiser/campaigns" style={{ padding: "10px 22px", borderRadius: 10, background: `${ACCENT}18`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
              + LAUNCH AD
            </Link>
            <Link href="/advertiser/analytics" style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              ANALYTICS →
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ padding: "18px 16px", background: `${s.color}08`, border: `1px solid ${s.color}22`, borderRadius: 14, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 800, marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, marginBottom: 28 }}>
          {QUICK_LINKS.map((q) => (
            <Link key={q.href} href={q.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 10px", background: `${q.color}08`, border: `1px solid ${q.color}22`, borderRadius: 12, textDecoration: "none", color: "#fff" }}>
              <span style={{ fontSize: 22 }}>{q.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", color: q.color, textAlign: "center" }}>{q.label}</span>
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 24 }}>
          {/* Ad surfaces table */}
          <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}18`, borderRadius: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: ACCENT, fontWeight: 800, marginBottom: 16 }}>ACTIVE AD SURFACES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {AD_SURFACES.map((a) => (
                <div key={a.surface} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: `${a.color}08`, border: `1px solid ${a.color}20`, borderRadius: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.surface}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{a.impressions} impressions</div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: a.color }}>{a.ctr}</span>
                    <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", padding: "2px 7px", borderRadius: 4, background: a.status === "live" ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.06)", color: a.status === "live" ? "#00FF88" : "rgba(255,255,255,0.35)", border: `1px solid ${a.status === "live" ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.1)"}` }}>
                      {a.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad network status */}
          <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>AD NETWORKS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {NETWORK_STATUS.map((n) => (
                <div key={n.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: n.active ? "#fff" : "rgba(255,255,255,0.3)" }}>{n.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: n.active ? n.color : "rgba(255,255,255,0.2)" }}>{n.active ? "ACTIVE" : "OFF"}</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${n.fill}%`, background: n.active ? n.color : "transparent", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/settings" style={{ display: "block", marginTop: 16, padding: "9px 0", textAlign: "center", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
              CONFIGURE NETWORKS →
            </Link>
          </div>
        </div>

        {/* Rails */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Suspense fallback={<RailSkeleton />}><AdvertiserCampaignRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><AdvertiserPlacementRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><AdvertiserInventoryRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><AdvertiserAnalyticsRail /></Suspense>
        </div>
      </div>

      <TMIVideoMonitor label="AD CAM" position="bottom-right" />
    </div>
  );
}
