"use client";

/**
 * Advertiser hub shell — Rule 20 honest empty states (no fabricated ROAS/impressions).
 * Discovery + campaign rails consume real registries/APIs or show empty.
 */

import Link from "next/link";
import { Suspense } from "react";
import AdvertiserCampaignRail from "@/components/advertiser/AdvertiserCampaignRail";
import AdvertiserPlacementRail from "@/components/advertiser/AdvertiserPlacementRail";
import AdvertiserAnalyticsRail from "@/components/advertiser/AdvertiserAnalyticsRail";
import AdvertiserInventoryRail from "@/components/advertiser/AdvertiserInventoryRail";
import DiscoveryRail from "@/components/discovery/DiscoveryRail";
import MediaMonitor from "@/components/video/MediaMonitor";

const ACCENT = "#FF2DAA";
const BG = "#050510";

const STATS = [
  { label: "Active Ads", value: "0", sub: "No campaigns running", color: "#FF2DAA" },
  { label: "Total Impressions", value: "0", sub: "Impressions this period", color: "#00FFFF" },
  { label: "CTR", value: "—", sub: "No click data yet", color: "#FFD700" },
  { label: "Budget Remaining", value: "$0", sub: "Allocate budget to start", color: "#AA2DFF" },
  { label: "Conversions", value: "0", sub: "Tracked this month", color: "#00FF88" },
  { label: "ROAS", value: "—", sub: "No spend recorded", color: "#FF2DAA" },
];

const QUICK_LINKS = [
  { href: "/advertiser/campaigns", label: "Campaigns", icon: "📣", color: "#FF2DAA" },
  { href: "/advertiser/placements", label: "Placements", icon: "📍", color: "#00FFFF" },
  { href: "/advertiser/analytics", label: "Analytics", icon: "📊", color: "#FFD700" },
  { href: "/hub/advertiser", label: "Ad Inventory", icon: "🗃️", color: "#AA2DFF" },
  { href: "/billing", label: "Billing", icon: "💳", color: "#00FF88" },
  { href: "/advertiser/profile", label: "Brand Profile", icon: "🏢", color: "#FF6B35" },
];

function RailSkeleton() {
  return (
    <div
      style={{
        height: 96,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}
    />
  );
}

export default function AdvertiserHubShell() {
  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: 80,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 75% 20%, rgba(255,45,170,0.08), transparent 50%), radial-gradient(circle at 20% 70%, rgba(0,255,255,0.05), transparent 45%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto", padding: "28px 24px" }}>
        <div
          style={{
            padding: "28px 32px",
            background: "linear-gradient(135deg, rgba(255,45,170,0.12), rgba(5,5,16,0.95))",
            border: `1px solid ${ACCENT}30`,
            borderRadius: 20,
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>
              ADVERTISER COMMAND CENTER · TMI PLATFORM
            </div>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, letterSpacing: "-0.02em" }}>
              Advertiser Hub
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              Campaign control · Placement inventory · Honest performance (live data only)
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/advertiser/campaigns"
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                background: `${ACCENT}18`,
                border: `1px solid ${ACCENT}45`,
                color: ACCENT,
                fontSize: 11,
                fontWeight: 800,
                textDecoration: "none",
                letterSpacing: "0.08em",
              }}
            >
              + LAUNCH AD
            </Link>
            <Link
              href="/advertiser/analytics"
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              ANALYTICS →
            </Link>
          </div>
        </div>

        {/* Media region — existing MediaMonitor (no second AudioOwner) */}
        <div
          style={{
            marginBottom: 24,
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${ACCENT}28`,
            background: "#000",
            minHeight: 220,
            position: "relative",
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              borderBottom: `1px solid ${ACCENT}22`,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: ACCENT,
            }}
          >
            MEDIA · PLACEMENT PREVIEW
          </div>
          <div style={{ height: 200, position: "relative" }}>
            <MediaMonitor mode="standby" isActive={false} />
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                right: 12,
                background: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "10px 12px",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>
                No ad placement active
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                Launch a campaign to begin serving ads.
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                padding: "18px 16px",
                background: `${s.color}08`,
                border: `1px solid ${s.color}22`,
                borderRadius: 14,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 8,
            marginBottom: 28,
          }}
        >
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "14px 10px",
                background: `${q.color}08`,
                border: `1px solid ${q.color}22`,
                borderRadius: 12,
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <span style={{ fontSize: 22 }}>{q.icon}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: q.color,
                  textAlign: "center",
                }}
              >
                {q.label}
              </span>
            </Link>
          ))}
        </div>

        <div
          style={{
            padding: "20px 24px",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${ACCENT}18`,
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: "0.22em", color: ACCENT, fontWeight: 800, marginBottom: 12 }}>
            ACTIVE AD SURFACES
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: "12px 0" }}>
            No surfaces serving yet.{" "}
            <Link href="/advertiser/placements" style={{ color: ACCENT, textDecoration: "none", fontWeight: 700 }}>
              Choose placements →
            </Link>
          </div>
        </div>

        {/* Discovery — artists / venues / sponsorship opportunities (zero results OK) */}
        <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <DiscoveryRail type="performers" limit={6} accentColor={ACCENT} label="DISCOVER ARTISTS" />
          <DiscoveryRail type="venues" limit={4} accentColor="#00FFFF" label="VENUE OPPORTUNITIES" />
          <DiscoveryRail type="sponsors" limit={4} accentColor="#FFD700" label="SPONSORSHIP SURFACES" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <Suspense fallback={<RailSkeleton />}>
            <AdvertiserCampaignRail />
          </Suspense>
          <Suspense fallback={<RailSkeleton />}>
            <AdvertiserPlacementRail />
          </Suspense>
          <Suspense fallback={<RailSkeleton />}>
            <AdvertiserAnalyticsRail />
          </Suspense>
          <Suspense fallback={<RailSkeleton />}>
            <AdvertiserInventoryRail />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
