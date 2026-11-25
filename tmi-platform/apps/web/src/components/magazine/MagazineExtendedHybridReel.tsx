"use client";

/**
 * MagazineExtendedHybridReel — visual reel for extended magazine inventory.
 * AdSense units stay technically separate from TMI-controlled cards.
 * Page links / navigation are never owned by this component.
 */

import React from "react";
import Link from "next/link";
import AdSenseSlot from "@/components/ads/AdSenseSlot";
import {
  type ExtendedReelPlacement,
} from "@/lib/magazine/MagazineExtendedReelPlacementAuthority";
import CommunityGossipHappyDaysRotatingPreview from "@/components/magazine/CommunityGossipHappyDaysRotatingPreview";

type Props = {
  placement: ExtendedReelPlacement;
  accent?: string;
};

function CardShell({
  children,
  accent,
  label,
  testId,
}: {
  children: React.ReactNode;
  accent: string;
  label: string;
  testId: string;
}) {
  return (
    <aside
      data-testid={testId}
      data-reel-label={label}
      style={{
        marginTop: 10,
        border: "2px solid #061028",
        boxShadow: `3px 4px 0 ${accent}`,
        background: "linear-gradient(160deg, #0a0614 0%, #12081f 100%)",
        color: "#fff",
        padding: "10px 12px",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: accent,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </aside>
  );
}

export default function MagazineExtendedHybridReel({
  placement,
  accent = "#00E5FF",
}: Props) {
  if (placement.mode === "NONE") return null;

  if (placement.mode === "COMMUNITY_GOSSIP") {
    return (
      <div
        data-testid="magazine-extended-reel-gossip-only"
        data-reel-mode="COMMUNITY_GOSSIP"
        data-position-id={placement.positionId}
      >
        <CommunityGossipHappyDaysRotatingPreview
          lockedDestination="COMMUNITY_GOSSIP"
          gossipNotes={[]}
          happyNotes={[]}
        />
      </div>
    );
  }

  if (placement.mode === "HAPPY_DAYS") {
    return (
      <div
        data-testid="magazine-extended-reel-happy-only"
        data-reel-mode="HAPPY_DAYS"
        data-position-id={placement.positionId}
      >
        <CommunityGossipHappyDaysRotatingPreview
          lockedDestination="HAPPY_DAYS"
          gossipNotes={[]}
          happyNotes={[]}
        />
      </div>
    );
  }

  if (placement.mode === "ADSENSE") {
    return (
      <CardShell accent={accent} label="ADVERTISEMENT · GOOGLE ADSENSE" testId="magazine-extended-reel-adsense">
        <div data-position-id={placement.positionId} data-reel-mode="ADSENSE">
          {placement.adsenseSlotId ? (
            <AdSenseSlot
              slot={placement.adsenseSlotId}
              format="rectangle"
              label="ADVERTISEMENT"
              style={{ minHeight: 120, width: "100%" }}
            />
          ) : (
            <Link
              href="/sponsors/advertise"
              style={{ color: accent, fontSize: 12, fontWeight: 800 }}
            >
              Ad inventory preparing · Advertise with TMI →
            </Link>
          )}
        </div>
      </CardShell>
    );
  }

  if (placement.mode === "TMI_PAID" && placement.paidSponsor) {
    const s = placement.paidSponsor;
    return (
      <CardShell accent={s.accentColor || accent} label="SPONSORED · TMI DIRECT" testId="magazine-extended-reel-paid">
        <div data-position-id={placement.positionId} data-reel-mode="TMI_PAID">
          <div style={{ fontSize: 14, fontWeight: 900 }}>{s.name}</div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>{s.tagline}</div>
          <Link
            href={s.ctaHref}
            style={{
              display: "inline-block",
              marginTop: 10,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#050510",
              background: s.accentColor || accent,
              padding: "8px 12px",
              textDecoration: "none",
              border: "2px solid #061028",
            }}
          >
            {s.ctaLabel || "LEARN MORE"} →
          </Link>
        </div>
      </CardShell>
    );
  }

  if (placement.mode === "PERFORMER_SPOTLIGHT" && placement.performerSlug) {
    return (
      <CardShell accent="#FFD700" label="PERFORMER SPOTLIGHT" testId="magazine-extended-reel-performer">
        <div data-position-id={placement.positionId} data-reel-mode="PERFORMER_SPOTLIGHT">
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
            Featured artist from this story — authorized profile media only.
          </div>
          <Link
            href={`/performers/${placement.performerSlug}`}
            style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#050510",
              background: "#FFD700",
              padding: "8px 12px",
              textDecoration: "none",
              border: "2px solid #061028",
            }}
          >
            OPEN {placement.performerSlug.replace(/-/g, " ").toUpperCase()} →
          </Link>
        </div>
      </CardShell>
    );
  }

  if (placement.mode === "ADVERTISE_CTA") {
    return (
      <CardShell accent="#FF2DAA" label="ADVERTISE WITH TMI" testId="magazine-extended-reel-advertise">
        <div data-position-id={placement.positionId} data-reel-mode="ADVERTISE_CTA">
          <div style={{ fontSize: 12, marginBottom: 8 }}>
            This magazine spot is available. Reach readers across Issue pages, Lobby Walls, and live rooms.
          </div>
          <Link
            href="/sponsors/advertise"
            style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#050510",
              background: "#FF2DAA",
              padding: "8px 12px",
              textDecoration: "none",
              border: "2px solid #061028",
            }}
          >
            SPONSOR THIS SPOT →
          </Link>
        </div>
      </CardShell>
    );
  }

  // PLATFORM_PROMO default
  const promo = placement.platformPromo;
  if (!promo) return null;
  return (
    <CardShell accent={promo.accentColor || accent} label="TMI PLATFORM" testId="magazine-extended-reel-platform">
      <div data-position-id={placement.positionId} data-reel-mode="PLATFORM_PROMO">
        <div style={{ fontSize: 14, fontWeight: 900 }}>{promo.headline}</div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>{promo.body}</div>
        <Link
          href={promo.ctaHref}
          style={{
            display: "inline-block",
            marginTop: 10,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#050510",
            background: promo.accentColor || accent,
            padding: "8px 12px",
            textDecoration: "none",
            border: "2px solid #061028",
          }}
        >
          {promo.ctaLabel} →
        </Link>
      </div>
    </CardShell>
  );
}
