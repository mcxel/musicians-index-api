"use client";

/**
 * Panel module renderers for Observatory Control Desk (Phase 1/2).
 * Shared by focus mode and layout-mode tiles. Honest empties only.
 */

import Link from "next/link";

import BotSummonDeck from "@/components/admin/BotSummonDeck";
import AdminRevenuePanel from "@/components/admin/AdminRevenuePanel";
import AdminSubmissionPanel from "@/components/admin/AdminSubmissionPanel";
import PresentationTelemetryPanel from "@/components/admin/PresentationTelemetryPanel";
import PlatformCorePanel from "@/components/admin/PlatformCorePanel";
import ObservatoryDeck from "@/components/admin/overseer/ObservatoryDeck";
import ObservatoryIntelligencePanel from "@/components/admin/overseer/ObservatoryIntelligencePanel";
import ScamDefenseCenter from "@/components/admin/overseer/ScamDefenseCenter";
import LegalComplianceCard from "@/components/admin/overseer/LegalComplianceCard";
import MagazineAnalytics from "@/components/admin/overseer/MagazineAnalytics";
import HomeLiveLobbyWall from "@/components/discovery/HomeLiveLobbyWall";
import ObservatoryChampionshipWidget from "@/components/championship/ObservatoryChampionshipWidget";
import LivingRankingsPanel from "@/components/championship/LivingRankingsPanel";
import GauntletControlPanel from "@/components/admin/overseer/GauntletControlPanel";
import type { DeskPanelId, DeskPeriod } from "@/lib/admin/ObservatoryDeskState";

export function HonestEmpty({
  title,
  detail,
  href,
  hrefLabel,
}: {
  title: string;
  detail: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 120,
        borderRadius: 10,
        border: "1px solid rgba(107,114,128,0.45)",
        background: "linear-gradient(160deg, rgba(18,18,22,0.95), rgba(8,8,12,0.98))",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#9CA3AF",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.45 }}>{detail}</div>
      {href ? (
        <Link
          href={href}
          style={{
            alignSelf: "flex-start",
            marginTop: 4,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#00FFFF",
            textDecoration: "none",
            border: "1px solid rgba(0,255,255,0.4)",
            borderRadius: 999,
            padding: "5px 12px",
            background: "rgba(0,255,255,0.08)",
          }}
        >
          {hrefLabel ?? "Open surface →"}
        </Link>
      ) : null}
    </div>
  );
}

function PeriodNote({ period }: { period: DeskPeriod }) {
  if (period === "custom") {
    return (
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
        Custom range picker deferred — filter stored as Custom stub for this session.
      </div>
    );
  }
  return (
    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
      Period filter: <strong style={{ color: "#FFD700" }}>{period.toUpperCase()}</strong>
      {" · "}
      applies when a wired ledger/analytics source exists for this panel.
    </div>
  );
}

export function DeskPanelContent({
  panel,
  period,
}: {
  panel: DeskPanelId;
  period: DeskPeriod;
}) {
  switch (panel) {
    case "overview":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0, height: "100%" }}>
          <PeriodNote period={period} />
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <ObservatoryIntelligencePanel />
          </div>
        </div>
      );
    case "analytics":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
          <PeriodNote period={period} />
          <MagazineAnalytics />
          <HonestEmpty
            title="Analytics ledger"
            detail="No multi-source analytics engine is wired for period charts. Magazine/index signals above are registry-backed. Full analytics charts stay deferred until a real ledger exists."
            href="/admin/analytics"
            hrefLabel="Open Admin Analytics →"
          />
        </div>
      );
    case "revenue":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", overflow: "auto" }}>
          <PeriodNote period={period} />
          <AdminRevenuePanel
            selectedId="billing"
            onSelect={(id) => {
              window.location.href =
                id === "artist-analytics" ? "/admin/artist-analytics" : "/admin/revenue";
            }}
          />
          <Link
            href="/admin/revenue"
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#FFD700",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Open Revenue Desk →
          </Link>
        </div>
      );
    case "audience":
      return (
        <HonestEmpty
          title="Audience"
          detail="No dedicated audience telemetry panel is mounted yet. Live room audience counts appear under Rooms when GlobalLiveSessionRegistry reports sessions."
          href="/admin/live"
          hrefLabel="Open Live Admin →"
        />
      );
    case "rooms":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <PeriodNote period={period} />
          <ObservatoryDeck />
        </div>
      );
    case "lobby-wall":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA" }}>
              LIVE SURFACE PROJECTION
            </span>
            <Link
              href="/live/lobby-wall"
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "#00FFFF",
                textDecoration: "none",
                border: "1px solid rgba(0,255,255,0.35)",
                borderRadius: 999,
                padding: "3px 10px",
              }}
            >
              Full Lobby Wall →
            </Link>
          </div>
          <HomeLiveLobbyWall surface="home3_mosaic" maxTiles={8} showOpenOverlay title="Lobby Wall" />
        </div>
      );
    case "bots":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <BotSummonDeck />
        </div>
      );
    case "rankings":
      return (
        <div style={{ height: "100%", overflow: "auto", padding: 8 }}>
          <LivingRankingsPanel accentColor="#FFD700" maxRows={12} />
        </div>
      );
    case "championships":
      return (
        <div
          style={{
            height: "100%",
            overflow: "auto",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <ObservatoryChampionshipWidget />
          <HonestEmpty
            title="Championship Center"
            detail="Full ESPN hub lives in Fan/Performer Command Center drawer championship_center. Counts above are registry-backed only."
          />
        </div>
      );
    case "presentation":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <PresentationTelemetryPanel />
        </div>
      );
    case "webrtc":
      return (
        <HonestEmpty
          title="WebRTC"
          detail="No Observatory WebRTC health telemetry source is wired. Media Matrix remains on the dual monitors above."
          href="/admin/video-observatory"
          hrefLabel="Open Video Observatory →"
        />
      );
    case "commerce":
      return (
        <HonestEmpty
          title="Commerce"
          detail="Commerce admin surface exists; no period-filtered Observatory commerce ledger is mounted in this desk yet."
          href="/admin/commerce"
          hrefLabel="Open Commerce →"
        />
      );
    case "submissions":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", overflow: "auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href="/admin/beat-locker"
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "#FF2DAA",
                textDecoration: "none",
                border: "1px solid rgba(255,45,170,0.4)",
                borderRadius: 999,
                padding: "3px 10px",
              }}
            >
              Beat Locker →
            </Link>
          </div>
          <AdminSubmissionPanel actorName="Observatory" accentColor="#FF2DAA" />
        </div>
      );
    case "alerts":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <ScamDefenseCenter />
        </div>
      );
    case "legal-compliance":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <LegalComplianceCard />
        </div>
      );
    case "system-health":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <PeriodNote period={period} />
          <PlatformCorePanel />
          <div style={{ marginTop: 10 }}>
            <Link
              href="/admin/platform-core"
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#FFD700",
                textDecoration: "none",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Open Platform Core →
            </Link>
          </div>
        </div>
      );
    case "stats":
      return (
        <HonestEmpty
          title="Stats"
          detail="No unified stats engine is available for this desk panel."
          href="/admin/analytics"
          hrefLabel="Open Analytics →"
        />
      );
    case "geography":
      return (
        <HonestEmpty
          title="Geography"
          detail="No geography / region telemetry source is wired."
          href="/admin/global-pulse"
          hrefLabel="Open Global Pulse →"
        />
      );
    case "engagement":
      return (
        <HonestEmpty
          title="Engagement"
          detail="No engagement ledger is mounted for Observatory period filters."
          href="/admin/analytics"
          hrefLabel="Open Analytics →"
        />
      );
    case "growth":
      return (
        <HonestEmpty
          title="Growth"
          detail="No growth chart source is wired — inventing curves would violate Rule 20."
          href="/admin/artist-analytics"
          hrefLabel="Open Artist Analytics →"
        />
      );
    case "sponsors":
      return (
        <HonestEmpty
          title="Sponsors"
          detail="Sponsor placements use SponsorRegistry on marketplace surfaces. No Observatory sponsor telemetry panel yet."
          href="/admin/sponsors"
          hrefLabel="Open Sponsors →"
        />
      );
    case "prizes":
      return (
        <HonestEmpty
          title="Prizes"
          detail="Cash / prize payouts remain gated by Revenue-First Rewards Governor. No prize ledger in this desk."
          href="/admin/contests"
          hrefLabel="Open Contests →"
        />
      );
    case "gauntlet":
      return (
        <div style={{ height: "100%", overflow: "auto", padding: 8 }}>
          <GauntletControlPanel />
        </div>
      );
    default:
      return <HonestEmpty title="Panel unavailable" detail="Unknown desk panel." />;
  }
}
