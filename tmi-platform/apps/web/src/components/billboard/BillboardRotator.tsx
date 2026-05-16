"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CapabilityBadge from "@/components/common/CapabilityBadge";
import PresenceBar from "@/components/live/PresenceBar";
import LiveFeedTicker, { type TickerEvent } from "@/components/live/LiveFeedTicker";
import { emitSystemEvent } from "@/lib/systemEventBus";
import { getComponentCapability } from "@/lib/capabilities/componentCapabilityRegistry";
import ArtifactMotionFrame from "@/components/common/ArtifactMotionFrame";
import BillboardPreviewHover from "@/components/billboards/BillboardPreviewHover";
import {
  registerBillboardSlot,
  onBillboardHoverStart,
  onBillboardHoverEnd,
  type BillboardPreviewContent,
} from "@/lib/live/BillboardPreviewHoverEngine";

type BillboardRotatorProps = {
  billboardId: string;
};

const ADS = [
  { id: "prime-wave", label: "Prime Wave", route: "/sponsors/prime-wave" },
  { id: "marketplace-max", label: "Marketplace Max", route: "/sponsors/marketplace-max" },
  { id: "urban-stream", label: "Urban Stream", route: "/advertisers/urban-stream" },
];

export default function BillboardRotator({ billboardId }: BillboardRotatorProps) {
  const capability = getComponentCapability("billboard-rotator");
  const [index, setIndex] = useState(0);
  const [hoverPreview, setHoverPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<BillboardPreviewContent | null>(null);
  const [events, setEvents] = useState<TickerEvent[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((current) => (current + 1) % ADS.length), 2500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setEvents((prev) => [
        {
          id: `billboard-${now}`,
          message: `Billboard ${billboardId}: ${ADS[index].label} spotlight updated`,
          level: "info" as const,
          at: now,
        },
        ...prev,
      ].slice(0, 8));
    }, 5500);
    return () => window.clearInterval(id);
  }, [billboardId, index]);

  const ad = ADS[index];
  const slotId = `billboard-${billboardId}-${ad.id}`;

  useEffect(() => {
    const content: BillboardPreviewContent = {
      slotId,
      type: "sponsor_ad",
      title: ad.label,
      subtitle: "Live sponsor placement",
      href: ad.route,
      sponsorName: ad.label,
    };
    registerBillboardSlot(content);
    setPreviewContent(content);
  }, [slotId, ad.label, ad.route]);

  return (
    <main
      data-testid="billboard-rotator"
      aria-label="Billboard rotator page"
      data-fallback-route="/home/5"
      style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gap: 12 }}>
        <Link data-testid="billboard-back-home" aria-label="Back to marketplace" data-fallback-route="/home/1" href="/home/5" style={{ color: "#93c5fd", textDecoration: "none" }}>← Back to Marketplace</Link>
        <h1 style={{ margin: 0 }}>Billboard · {billboardId}</h1>
        {capability ? <CapabilityBadge capability={capability} compact /> : null}
        <PresenceBar roomId={`billboard-${billboardId}`} compact />

        <section style={{ border: "1px solid rgba(251,191,36,0.35)", borderRadius: 12, background: "rgba(15,23,42,0.72)", padding: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fde68a", marginBottom: 8 }}>Rotating Ads</div>
          <div style={{ position: "relative" }}>
          <ArtifactMotionFrame
            artifactId="billboard-featured-preview"
            scope="billboard-featured"
            routeTarget={ad.route}
            featured
            cycleMs={4300}
            data-testid="billboard-hover-preview"
            aria-label="Billboard hover preview"
            data-fallback-route="/billboards/crown-weekly"
            onMouseEnter={() => { setHoverPreview(true); onBillboardHoverStart(slotId); }}
            onMouseLeave={() => { setHoverPreview(false); onBillboardHoverEnd(slotId); }}
            style={{
              minHeight: 220,
              border: "1px solid rgba(148,163,184,0.35)",
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              background: hoverPreview
                ? "linear-gradient(120deg, rgba(255,107,53,0.4), rgba(14,116,144,0.72))"
                : "linear-gradient(120deg, rgba(30,41,59,0.95), rgba(14,116,144,0.55))",
              transition: "background 180ms ease",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "#93c5fd", textTransform: "uppercase" }}>Now Playing</div>
              <div style={{ fontSize: 30, fontWeight: 900 }}>{ad.label}</div>
              {hoverPreview ? (
                <div style={{ marginTop: 8, fontSize: 11, color: "#fde68a" }}>Preview mode active</div>
              ) : null}
            </div>
          </ArtifactMotionFrame>
          {hoverPreview && previewContent ? (
            <BillboardPreviewHover
              active={hoverPreview}
              roomId={previewContent.slotId}
              performerNames={["Nova Kane", "Ari Volt"]}
              topReactions={["🔥 hype", "👏 encore", "💸 tip", "🗳 vote"]}
              crowdLevel={76}
            />
          ) : null}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link data-testid="open-ad-target" aria-label="Open billboard ad target" data-fallback-route="/sponsors/prime-wave" href={ad.route} onClick={() => emitSystemEvent({ type: "homepage.artifact.route", actor: "Billboard", sectionId: `ad-${ad.id}`, route: ad.route, message: `Billboard route ${ad.id}` })} style={btnLink}>Open Ad Target</Link>
            <Link data-testid="open-linked-game" aria-label="Open linked game from billboard" data-fallback-route="/games/name-that-tune" href={`/games/name-that-tune`} onClick={() => emitSystemEvent({ type: "pipeline.game.open", actor: "Billboard", sectionId: "billboard-game-chain", route: "/games/name-that-tune", message: "Billboard to game chain" })} style={btnLink}>Open Linked Game</Link>
          </div>
        </section>

        <LiveFeedTicker events={events} position="inline" maxVisible={3} />
      </div>
    </main>
  );
}

const btnLink: React.CSSProperties = {
  border: "1px solid rgba(125,211,252,0.35)",
  borderRadius: 999,
  background: "rgba(14,116,144,0.18)",
  color: "#e0f2fe",
  textDecoration: "none",
  fontSize: 12,
  padding: "6px 10px",
};
