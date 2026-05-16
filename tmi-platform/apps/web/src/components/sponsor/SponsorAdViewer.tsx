"use client";

import { useState } from "react";
import Link from "next/link";
import SponsorFullscreen from "@/components/sponsor/SponsorFullscreen";
import { useVisualRouting } from "@/lib/hooks/useVisualAuthority";
import type { ArtifactRouteContract } from "@/lib/artifactRouteContract";
import { trackArtifactClick, trackArtifactPreview } from "@/lib/artifactEventTracker";

type SponsorAdViewerProps = {
  contract: ArtifactRouteContract;
  campaignName: string;
  ctaRoute: string;
};

const VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export default function SponsorAdViewer({ contract, campaignName, ctaRoute }: SponsorAdViewerProps) {
  const [showInline, setShowInline] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const { assetId: governedVideoAsset } = useVisualRouting(
    `sponsor-ad-${campaignName.toLowerCase().replace(/\s+/g, "-")}`,
    "sponsor-video",
    "home",
    {
      displayName: campaignName,
      sourceRoute: "/sponsors",
      targetSlot: "sponsor-ad-viewer",
      telemetry: "visual_authority_applied",
      lineage: "lineage_registered",
      recovery: "degraded",
    }
  );
  const resolvedVideoUrl = governedVideoAsset || VIDEO_URL;

  return (
    <section style={{ border: "1px solid rgba(56,189,248,0.4)", borderRadius: 12, padding: 10, background: "rgba(2,6,23,0.75)" }}>
      <h3 style={{ margin: 0, color: "#bae6fd", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>Ad Viewer</h3>
      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          data-testid="inline-preview"
          aria-label="Open inline sponsor preview"
          data-fallback-route="/sponsors"
          onClick={() => {
            setShowInline(true);
            trackArtifactPreview(contract, { actor: "Sponsor Hub" });
          }}
          style={btnStyle}
        >
          Inline Preview
        </button>
        <button
          type="button"
          data-testid="open-fullscreen"
          aria-label="Open sponsor fullscreen"
          data-fallback-route="/sponsors"
          onClick={() => {
            setShowInline(true);
            setShowFullscreen(true);
            trackArtifactClick(contract, { actor: "Sponsor Hub", routeOverride: `${contract.route}?fullscreen=1` });
          }}
          style={btnStyle}
        >
          Fullscreen
        </button>
        <Link
          href={ctaRoute}
          data-testid="cta-visit"
          aria-label="Visit sponsor CTA destination"
          data-fallback-route="/lobbies/live-world"
          onClick={() => trackArtifactClick(contract, { actor: "Sponsor CTA", routeOverride: ctaRoute })}
          style={{ ...btnStyle, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
        >
          CTA: Visit
        </Link>
      </div>

      {showInline ? (
        <div style={{ marginTop: 10, border: "1px solid rgba(125,211,252,0.35)", borderRadius: 10, overflow: "hidden" }}>
          <video className="w-full" src={resolvedVideoUrl} autoPlay muted loop playsInline />
          <div style={{ padding: 8, fontSize: 11, color: "#cbd5e1" }}>Campaign: {campaignName} · Inline preview (muted)</div>
        </div>
      ) : null}

      {showFullscreen ? <SponsorFullscreen title={campaignName} videoUrl={resolvedVideoUrl} onClose={() => setShowFullscreen(false)} /> : null}
    </section>
  );
}

const btnStyle: React.CSSProperties = {
  borderRadius: 999,
  border: "1px solid rgba(56,189,248,0.5)",
  background: "rgba(14,116,144,0.22)",
  color: "#e0f2fe",
  padding: "6px 10px",
  fontSize: 11,
  cursor: "pointer",
};
