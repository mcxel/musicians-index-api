"use client";

/**
 * ListenOwnTrackCard — Listen vs Own/Support on song surfaces.
 * Listen → existing audio / streaming / radio path.
 * Own / Support → artist commerce storefront or buy CTA.
 * Honest empty when not linked (Rule 20). No dead #.
 */

import Link from "next/link";
import {
  resolveListenFallbackHref,
  resolveListenUrl,
  resolveOwnSupportUrl,
  type LivingCatalogTrack,
} from "@/lib/commerce/LivingCatalog";
import { STREAM_VS_OWN_COPY } from "@/lib/commerce/DistributorConnectorRegistry";
import ListenVsOwnActions from "@/components/commerce/ListenVsOwnActions";

export interface ListenOwnTrackCardProps {
  track: LivingCatalogTrack;
  accentColor?: string;
  /** Show stream-vs-own framing line under actions */
  showMathNote?: boolean;
  compact?: boolean;
}

export default function ListenOwnTrackCard({
  track,
  accentColor = "#FFD700",
  showMathNote = false,
  compact = false,
}: ListenOwnTrackCardProps) {
  const ac = accentColor;
  const listenUrl = resolveListenUrl(track);
  const listenFallback = resolveListenFallbackHref(track.performerId);
  const ownUrl = resolveOwnSupportUrl(track.performerId, track);

  return (
    <div
      style={{
        padding: compact ? "10px 12px" : 12,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: compact ? 12 : 13, fontWeight: 800, color: "#fff" }}>
            {track.title}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            {track.durationSec != null && track.durationSec > 0
              ? `${Math.floor(track.durationSec / 60)}:${String(track.durationSec % 60).padStart(2, "0")}`
              : "Track"}
            {track.isrc ? ` · ISRC ${track.isrc}` : ""}
            {track.distributor ? ` · via ${track.distributor}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <ListenVsOwnActions
            listenUrl={listenUrl}
            ownUrl={ownUrl}
            accentColor={ac}
            compact={compact}
          />
          {!listenUrl ? (
            <Link
              href={listenFallback}
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "#00FFFF",
                textDecoration: "none",
                letterSpacing: "0.06em",
              }}
            >
              LISTEN ON TMI RADIO →
            </Link>
          ) : null}
        </div>
      </div>
      {showMathNote ? (
        <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.32)", lineHeight: 1.4 }}>
          {STREAM_VS_OWN_COPY}
        </p>
      ) : null}
    </div>
  );
}
