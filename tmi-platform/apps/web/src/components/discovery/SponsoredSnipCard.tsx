"use client";

/**
 * SponsoredSnipCard — native full-frame Sponsored Snip (§10613–§10614).
 * Labeled SPONSORED, swipe-away via parent, intentional CTA only — no tap trap.
 */

import Link from "next/link";
import type { SponsoredSnipCreative } from "@/lib/discovery/SponsoredSnipInsertionAuthority";

type Props = {
  creative: SponsoredSnipCreative;
  onSkip?: () => void;
  onCtaIntentionalClick?: () => void;
};

export default function SponsoredSnipCard({ creative, onSkip, onCtaIntentionalClick }: Props) {
  return (
    <div
      data-testid="sponsored-snip-card"
      data-sponsored="true"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 420,
        borderRadius: 16,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(255,215,0,0.45)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: creative.mediaUrl
            ? `url(${creative.mediaUrl}) center/cover no-repeat`
            : "linear-gradient(135deg,#1a0a2e,#050510)",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.55) 100%)",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 3,
          padding: "14px 16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <span
          data-testid="sponsored-snip-label"
          style={{
            alignSelf: "flex-start",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#050510",
            background: "#FFD700",
            padding: "4px 10px",
            borderRadius: 4,
          }}
        >
          SPONSORED
        </span>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.25 }}>
          {creative.headline}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href={creative.destinationHref}
            data-testid="sponsored-snip-cta"
            onClick={() => onCtaIntentionalClick?.()}
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
              color: "#050510",
              background: "#00E5FF",
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,229,255,0.6)",
            }}
          >
            {creative.ctaLabel}
          </Link>
          {onSkip ? (
            <button
              type="button"
              data-testid="sponsored-snip-skip"
              onClick={onSkip}
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.75)",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                padding: "10px 14px",
                cursor: "pointer",
              }}
            >
              SWIPE PAST
            </button>
          ) : null}
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
          Swipe to continue · return keeps your Snips place
        </div>
      </div>
    </div>
  );
}
