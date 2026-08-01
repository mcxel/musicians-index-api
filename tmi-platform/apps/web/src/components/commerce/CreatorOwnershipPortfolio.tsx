"use client";

/**
 * CreatorOwnershipPortfolio — measured counts from real registries only.
 * No estimated "catalog net worth" dollars (Rule 20).
 */

import { useMemo } from "react";
import { getPerformerBySlug, type PerformerIdentity } from "@/lib/performers/PerformerRegistry";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import { listBeatCatalog } from "@/lib/beats/BeatStoreEngine";
import { listCreatorProducts } from "@/lib/commerce/CreatorProductRegistry";
import { getPerformerStorefrontLink } from "@/lib/commerce/CommerceConnectorRegistry";

export interface CreatorOwnershipPortfolioProps {
  performerSlug: string;
  accentColor?: string;
}

function countSongs(performer: PerformerIdentity | null): number {
  return performer?.songs?.length ?? 0;
}

export default function CreatorOwnershipPortfolio({
  performerSlug,
  accentColor = "#FFD700",
}: CreatorOwnershipPortfolioProps) {
  const stats = useMemo(() => {
    const performer = getPerformerBySlug(performerSlug);
    const songs = countSongs(performer);
    const articles = MAGAZINE_ISSUE_1.filter((a) => a.performerSlug === performerSlug).length;
    const beats = listBeatCatalog({ producerSlug: performerSlug }).length;
    const linkedProducts = listCreatorProducts(performerSlug).length;
    const storefrontLinked = Boolean(getPerformerStorefrontLink(performerSlug));
    return { songs, articles, beats, linkedProducts, storefrontLinked };
  }, [performerSlug]);

  const rows: { label: string; value: number | string }[] = [
    { label: "Songs (registry)", value: stats.songs },
    { label: "Beats (marketplace)", value: stats.beats },
    { label: "Magazine articles", value: stats.articles },
    { label: "Linked products", value: stats.linkedProducts },
    { label: "Storefront", value: stats.storefrontLinked ? "Linked" : "Not linked" },
  ];

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        border: `1px solid ${accentColor}33`,
        background: `${accentColor}0a`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: accentColor,
          marginBottom: 8,
        }}
      >
        OWNERSHIP PORTFOLIO
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {rows.map((r) => (
          <div
            key={r.label}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{r.value}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: "0.06em" }}>
              {r.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 9, color: "rgba(255,255,255,0.32)", lineHeight: 1.4 }}>
        Counts only — no estimated catalog value or sales figures.
      </p>
    </div>
  );
}
