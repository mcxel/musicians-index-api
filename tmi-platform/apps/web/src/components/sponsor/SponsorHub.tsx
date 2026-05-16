"use client";

import Link from "next/link";
import HubAssetPortraitLayer from "@/components/avatar/HubAssetPortraitLayer";
import SponsorAdViewer from "@/components/sponsor/SponsorAdViewer";
import CapabilityBadge from "@/components/common/CapabilityBadge";
import ControlProofOverlay from "@/components/common/ControlProofOverlay";
import type { ArtifactRouteContract } from "@/lib/artifactRouteContract";
import { trackPipelineRoute } from "@/lib/artifactEventTracker";
import { getComponentCapability } from "@/lib/capabilities/componentCapabilityRegistry";

type SponsorHubProps = {
  sponsorId: string;
};

export default function SponsorHub({ sponsorId }: SponsorHubProps) {
  const capability = getComponentCapability("sponsor-hub");
  const contract: ArtifactRouteContract = {
    id: `sponsor-${sponsorId}`,
    type: "sponsor-ad",
    route: `/sponsors/${sponsorId}`,
    previewRoute: `/sponsors/${sponsorId}?preview=1`,
    fallbackRoute: "/sponsors",
    onClickAction: "preview",
    dataSource: "sponsorCampaignFeed",
  };

  return (
    <main
      data-testid="sponsor-hub"
      aria-label="Sponsor hub page"
      data-fallback-route="/sponsors"
      style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 12 }}>
        <Link data-testid="sponsor-back-home" aria-label="Back to homepage" data-fallback-route="/home/1" href="/home/5" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>Back to Homepage</Link>
        <h1 style={{ margin: 0 }}>Sponsor Hub - {sponsorId}</h1>
        <p style={{ margin: 0, color: "#cbd5e1" }}>Brand profile, active campaigns, linked billboards/lobbies/games, and ad viewer chain.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href={`/sponsors/${sponsorId}/placements`} style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 8, background: "rgba(15,23,42,0.7)", color: "#e2e8f0", textDecoration: "none", fontSize: 12, padding: "6px 9px" }}>Placements</Link>
          <Link href={`/sponsors/${sponsorId}/deals`} style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 8, background: "rgba(15,23,42,0.7)", color: "#e2e8f0", textDecoration: "none", fontSize: 12, padding: "6px 9px" }}>Deals</Link>
          <Link href={`/sponsors/${sponsorId}/gifts`} style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 8, background: "rgba(15,23,42,0.7)", color: "#e2e8f0", textDecoration: "none", fontSize: 12, padding: "6px 9px" }}>Gifts</Link>
          <Link href={`/sponsors/${sponsorId}/inventory`} style={{ border: "1px solid rgba(56,189,248,0.45)", borderRadius: 8, background: "rgba(2,132,199,0.15)", color: "#bae6fd", textDecoration: "none", fontSize: 12, padding: "6px 9px" }}>Inventory</Link>
        </div>
        {capability ? <CapabilityBadge capability={capability} /> : null}
        <HubAssetPortraitLayer
          name={`Sponsor ${sponsorId}`}
          accent="#2dd4bf"
          variant="cutout"
          state="featured"
          assetId={`asset-sponsor-${sponsorId}`}
          avatarId={`avatar-sponsor-${sponsorId}`}
        />

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <SponsorAdViewer contract={contract} campaignName="Prime Wave Spring Launch" ctaRoute="/lobbies/live-world" />
          <section style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 12, background: "rgba(15,23,42,0.7)", padding: 10 }}>
            <h3 style={{ marginTop: 0, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a5f3fc" }}>Linked Systems</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <ChainLink href="/billboards/crown-weekly" label="Linked Billboard" onClick={() => trackPipelineRoute(contract, "billboard", { routeOverride: "/billboards/crown-weekly" })} />
              <ChainLink href="/lobbies/live-world" label="Linked Lobby" onClick={() => trackPipelineRoute(contract, "lobby", { routeOverride: "/lobbies/live-world" })} />
              <ChainLink href="/games/name-that-tune" label="Linked Game" onClick={() => trackPipelineRoute(contract, "game", { routeOverride: "/games/name-that-tune" })} />
              <ChainLink href="/admin?monitor=live-feed" label="Admin Feed" onClick={() => trackPipelineRoute(contract, "sponsor", { routeOverride: "/admin?monitor=live-feed" })} />
            </div>
          </section>
        </div>
      </div>
      <ControlProofOverlay
        title="Sponsor Control Proof"
        items={[
          { id: "inline", label: "inline preview button", ok: true },
          { id: "full", label: "fullscreen control", ok: true },
          { id: "cta", label: "CTA route chain", ok: true },
          { id: "fallback", label: "fallback route metadata", ok: true },
        ]}
      />
    </main>
  );
}

function ChainLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link data-testid={`sponsor-chain-${href.replace(/\//g, "-")}`} aria-label={`${label} route`} data-fallback-route="/sponsors" href={href} onClick={onClick} style={{ border: "1px solid rgba(45,212,191,0.35)", borderRadius: 8, background: "rgba(13,148,136,0.16)", color: "#ccfbf1", textDecoration: "none", fontSize: 12, padding: "8px 10px", display: "block" }}>
      {label}
      <div style={{ color: "#99f6e4", fontSize: 10, marginTop: 2 }}>{href}</div>
    </Link>
  );
}
