"use client";

/**
 * In-world lounge ad chassis — TV / mirror / video panel / glass display.
 * Creative from getAdSlotForZone (Rule 12). Never an empty box.
 * Never AdSense flush against PLAY/BUY/WATCH. Skin ≠ stream.
 */

import type { CSSProperties } from "react";
import type { LoungeAdSurface } from "@/lib/live/loungeVideoPresenceLaw";

const CHASSIS_FRAME: Record<LoungeAdSurface["chassis"], CSSProperties> = {
  TV: {
    background: "linear-gradient(180deg, #1a1a22 0%, #0a0a10 100%)",
    border: "3px solid #2a2a33",
    borderRadius: 6,
    boxShadow: "0 8px 24px rgba(0,0,0,0.55), inset 0 0 0 2px #111",
  },
  MIRROR: {
    background: "linear-gradient(135deg, rgba(180,220,255,0.18), rgba(20,24,40,0.85))",
    border: "2px solid rgba(200,220,255,0.35)",
    borderRadius: 4,
    boxShadow: "inset 0 0 24px rgba(180,220,255,0.2), 0 6px 18px rgba(0,0,0,0.4)",
    transform: "skewY(-2deg)",
  },
  VIDEO_PANEL: {
    background: "#050510",
    border: "1px solid rgba(0,255,255,0.45)",
    borderRadius: 8,
    boxShadow: "0 0 18px rgba(0,255,255,0.22)",
  },
  GLASS_DISPLAY: {
    background: "linear-gradient(160deg, rgba(255,215,0,0.12), rgba(10,8,20,0.8))",
    border: "1px solid rgba(255,215,0,0.4)",
    borderRadius: 2,
    boxShadow: "inset 0 0 20px rgba(255,215,0,0.12), 0 4px 16px rgba(0,0,0,0.45)",
    backdropFilter: "blur(6px)",
  },
};

export default function LoungeAdChassisPanel({ surface }: { surface: LoungeAdSurface }) {
  const { slot, chassis, fill, anchor } = surface;
  const promo = slot.platformPromo;
  const sponsor = slot.sponsor;
  const accent =
    sponsor?.accentColor ?? promo?.accentColor ?? (chassis === "GLASS_DISPLAY" ? "#FFD700" : "#00FFFF");
  const href = sponsor?.ctaHref ?? promo?.ctaHref ?? "/sponsors/advertise";
  const headline = sponsor?.name ?? promo?.headline ?? "ADVERTISE HERE";
  const body = sponsor?.tagline ?? promo?.body ?? "TMI direct / house fill — never empty.";
  const cta = sponsor?.ctaLabel ?? promo?.ctaLabel ?? "ADVERTISE";

  return (
    <a
      href={href}
      data-lounge-ad-chassis={chassis}
      data-lounge-ad-fill={fill}
      data-lounge-ad-engine="getAdSlotForZone"
      data-adsense="false"
      style={{
        position: "absolute",
        left: `${anchor.xPct}%`,
        top: `${anchor.yPct}%`,
        width: chassis === "TV" ? 160 : 132,
        height: chassis === "MIRROR" ? 88 : 78,
        transform: "translate(-50%, -50%)",
        textDecoration: "none",
        overflow: "hidden",
        ...CHASSIS_FRAME[chassis],
      }}
    >
      <div
        style={{
          height: "100%",
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
        }}
      >
        <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.14em", color: accent }}>
          {chassis.replace("_", " ")} · {fill === "TMI_DIRECT_SPONSOR" ? "SPONSOR" : fill === "HOUSE_PLATFORM" ? "HOUSE" : "CTA"}
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{headline}</div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.55)", lineHeight: 1.25 }}>{body}</div>
        <div
          style={{
            marginTop: 4,
            alignSelf: "flex-start",
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: "#050510",
            background: accent,
            borderRadius: 3,
            padding: "2px 6px",
          }}
        >
          {cta}
        </div>
      </div>
    </a>
  );
}
