"use client";

/**
 * FanSponsorShelf — eligible fan public-page sponsorship placements.
 * Patterned after PerformerSponsorShelf; shows real FanSponsorship rows or an
 * honest empty state. Never fabricates sponsors, revenue, or LIVE ads.
 */

import Link from "next/link";
import type { FanSponsorship } from "@/lib/registries/FanSponsorRegistry";

export interface FanSponsorShelfProps {
  fanSlug: string;
  fanDisplayName: string;
  tier?: string;
  sponsors?: FanSponsorship[];
  accentColor?: string;
}

function usdMo(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}/mo`;
}

export default function FanSponsorShelf({
  fanSlug,
  fanDisplayName,
  tier,
  sponsors = [],
  accentColor = "#00FFFF",
}: FanSponsorShelfProps) {
  const active = sponsors.filter((s) => s.status === "active");

  return (
    <section
      aria-label="Fan sponsorship placements"
      style={{
        marginTop: 28,
        padding: "18px 16px",
        borderRadius: 14,
        border: `1px solid ${accentColor}33`,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.18em",
          color: accentColor,
          marginBottom: 10,
        }}
      >
        SPONSORS · CREATOR PLACEMENTS
      </div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 14px", lineHeight: 1.5 }}>
        Local & major sponsors on {fanDisplayName}&apos;s fan page use the same approved
        $25+ creator ladder as performers. Platform-wide ads are separate.
        {tier ? ` Tier: ${tier}.` : ""}
      </p>

      {active.length === 0 ? (
        <div
          style={{
            padding: "16px 14px",
            borderRadius: 10,
            border: `1px dashed ${accentColor}40`,
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          No active sponsors on this fan page yet.
          <div style={{ marginTop: 10 }}>
            <Link
              href="/sponsors/advertise"
              style={{ color: accentColor, fontWeight: 800, fontSize: 10, textDecoration: "none" }}
            >
              SPONSOR THIS FAN →
            </Link>
            <span style={{ margin: "0 8px", opacity: 0.35 }}>·</span>
            <Link
              href={`/p/${encodeURIComponent(fanSlug)}`}
              style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, textDecoration: "none" }}
            >
              View profile
            </Link>
          </div>
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {active.map((s) => (
            <li
              key={s.relationId}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px solid ${s.sponsorClass === "major" ? "#FFD70055" : `${accentColor}55`}`,
                background: "rgba(5,5,16,0.85)",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 13 }}>{s.sponsorName}</div>
              <div style={{ fontSize: 10, opacity: 0.55, marginTop: 4 }}>
                {s.sponsorClass.toUpperCase()} · {usdMo(s.monthlyAmountCents)}
                {s.placementId ? ` · ${s.placementId}` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
