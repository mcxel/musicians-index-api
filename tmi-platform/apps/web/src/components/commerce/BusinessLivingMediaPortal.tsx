"use client";

/**
 * BusinessLivingMediaPortal — single 16:9 Living Media Player surface for
 * Sponsor / Advertiser / Admin business roles. No second player engine.
 * Honest empty/standby until a real placement creative is bound.
 */

import { useState } from "react";
import Link from "next/link";
import LivingPlayerControlBed from "@/components/monitors/LivingPlayerControlBed";
import {
  resolveLivingPlayerCapabilities,
  type LivingViewCount,
} from "@/lib/monitors/livingPlayerControlContract";

export type BusinessLivingMediaPortalProps = {
  role: "SPONSOR" | "ADVERTISER" | "ADMIN";
  accent?: string;
  title?: string;
  emptyHint?: string;
  browseHref?: string;
};

export default function BusinessLivingMediaPortal({
  role,
  accent = "#FFD700",
  title = "LIVING MEDIA PLAYER · 16:9",
  emptyHint = "No active creative bound. Select a placement to preview image or video here.",
  browseHref = "/magazine/advertise",
}: BusinessLivingMediaPortalProps) {
  const [viewCount, setViewCount] = useState<LivingViewCount>(1);
  const destinationId = `business-living-media-${role.toLowerCase()}`;
  const capabilities = resolveLivingPlayerCapabilities(role);

  return (
    <section
      data-business-living-media-portal={role}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${accent}44`,
        background: "#000",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          borderBottom: `1px solid ${accent}33`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accent }}>{title}</span>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>
          {role} · STANDBY
        </span>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          maxHeight: "min(52vh, 420px)",
          background: "radial-gradient(ellipse at center, rgba(10,8,24,0.95), #000)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: 20, maxWidth: 420 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
            No media available
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 14px", lineHeight: 1.45 }}>
            {emptyHint}
          </p>
          <Link
            href={browseHref}
            style={{
              display: "inline-block",
              padding: "10px 16px",
              borderRadius: 8,
              background: accent,
              color: "#050510",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            BROWSE PLACEMENTS
          </Link>
        </div>
      </div>

      <LivingPlayerControlBed
        destinationId={destinationId}
        capabilities={capabilities}
        viewCount={viewCount}
        onViewCountChange={setViewCount}
        accent={accent}
        compact
      />
    </section>
  );
}
