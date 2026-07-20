"use client";

// Canon source: Fan Sign up.png + Performer Sign up.png + Sponsor Sign up.png + Advertiser Sign up.png
// Shell layout: hero illustration left (40%) + NeonMarqueeBorder form card right (60%)
// Shared across all 5 role signup flows — role-specific content injected via props

import React from "react";
import NeonMarqueeBorder from "@/components/onboarding/NeonMarqueeBorder";

export type OnboardingRole = "fan" | "artist" | "sponsor" | "advertiser" | "host";

interface OnboardingShellProps {
  /** The signup role — affects hero colors and CTA label */
  role?: OnboardingRole;
  /** Slot: hero left panel content (illustration, badge, benefits list) */
  hero?: React.ReactNode;
  /** Slot: form content rendered inside the NeonMarqueeBorder card */
  form: React.ReactNode;
  /** Slot: rendered below the form card (e.g. AvatarQuickPick + SubscriptionTierRow) */
  extras?: React.ReactNode;
  /** Background override — defaults to deep space radial */
  background?: string;
}

// ─── Per-role visual defaults ──────────────────────────────────────────────────

const ROLE_CONFIG: Record<OnboardingRole, {
  marqueColor: string;
  heroBg: string;
  heroLabel: string;
  heroBadge: string;
}> = {
  fan: {
    marqueColor: "#FFD700",
    heroBg: "radial-gradient(ellipse at bottom-left, #1a0033 0%, #050510 70%)",
    heroLabel: "JOIN THE CROWD",
    heroBadge: "#54 BILLBOARD FANS · 23,410",
  },
  artist: {
    marqueColor: "#FF2DAA",
    heroBg: "radial-gradient(ellipse at bottom-left, #1a0028 0%, #050510 70%)",
    heroLabel: "JOIN THE STAGE",
    heroBadge: "PERFORMER TIER · STAGE ACCESS",
  },
  sponsor: {
    marqueColor: "#00FFFF",
    heroBg: "radial-gradient(ellipse at bottom-left, #00100a 0%, #050510 70%)",
    heroLabel: "START SPONSORING ARTISTS",
    heroBadge: "SPONSOR TIER · BRAND PLACEMENT",
  },
  advertiser: {
    marqueColor: "#AA2DFF",
    heroBg: "radial-gradient(ellipse at bottom-left, #0a0020 0%, #050510 70%)",
    heroLabel: "LAUNCH CAMPAIGN",
    heroBadge: "+127,882 VIEWS · 4,791,245 VWS",
  },
  host: {
    marqueColor: "#FFD700",
    heroBg: "radial-gradient(ellipse at bottom-left, #1a1000 0%, #050510 70%)",
    heroLabel: "BECOME A HOST",
    heroBadge: "HOST TIER · STAGE COMMAND",
  },
};

// ─── Default hero when no hero slot provided ──────────────────────────────────

function DefaultHero({ role }: { role: OnboardingRole }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: cfg.heroBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "16px 32px",
      }}
    >
      {/* Placeholder illustration frame — clamp() so it shrinks naturally
          inside the compact mobile hero panel (max-height: 140px) instead
          of a fixed 160px that would overflow it. */}
      <div
        style={{
          width: "clamp(56px, 15vh, 160px)",
          height: "clamp(56px, 15vh, 160px)",
          borderRadius: "50%",
          border: `2px solid ${cfg.marqueColor}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "clamp(24px, 6vh, 64px)",
          background: `radial-gradient(circle, ${cfg.marqueColor}10 0%, transparent 70%)`,
          flexShrink: 0,
        }}
      >
        {role === "fan" ? "🎵" : role === "artist" ? "🎤" : role === "sponsor" ? "🏢" : role === "advertiser" ? "📊" : "🎙"}
      </div>

      {/* Badge */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.2em",
          color: cfg.marqueColor,
          border: `1px solid ${cfg.marqueColor}40`,
          borderRadius: 6,
          padding: "4px 12px",
          textAlign: "center",
        }}
      >
        {cfg.heroBadge}
      </div>

      {/* CTA label echo */}
      <p
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "0.06em",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        {cfg.heroLabel}
      </p>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function OnboardingShell({
  role = "fan",
  hero,
  form,
  extras,
  background = "radial-gradient(ellipse at top, #0a0020 0%, #050510 60%, #000 100%)",
}: OnboardingShellProps) {
  const cfg = ROLE_CONFIG[role];

  return (
    <div
      data-onboarding-shell
      data-role={role}
      style={{
        minHeight: "100vh",
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* Below 700px: stack vertically instead of a fixed 40/60 side-by-side
          split — on a phone that split squeezes the actual form (name/bio
          fields, camera circle) into ~60% of an already-narrow screen while
          a purely decorative hero panel eats the rest. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 700px) {
          [data-onboarding-shell] > div { flex-direction: column !important; }
          [data-onboarding-shell] [data-slot="hero"] { flex: 0 0 auto !important; min-height: 0 !important; max-height: 140px !important; }
          [data-onboarding-shell] [data-slot="form"] { flex: 1 1 auto !important; }
        }
      `}} />
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          maxHeight: "calc(100vh - 48px)",
          display: "flex",
          gap: 0,
          borderRadius: 16,
          // Was `overflow: hidden` with no scroll fallback anywhere inside —
          // on steps with taller content (Step 4's photo editor: crop
          // preview + 3 sliders + Back/Save buttons), the bottom of the
          // card — including the only way to proceed — got clipped and
          // unreachable on shorter viewports. Real users got stuck with
          // no visible next step (confirmed 2026-07-20). The rounded-corner
          // clip now lives on the two inner panels instead, and the outer
          // card scrolls as a whole when content is taller than the
          // viewport, so nothing can ever be clipped out of reach again.
          overflowY: "auto",
          boxShadow: `0 0 80px ${cfg.marqueColor}18`,
        }}
      >
        {/* ── Left: Hero panel ── */}
        <div
          data-slot="hero"
          style={{
            flex: "0 0 40%",
            minHeight: 560,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {hero ?? <DefaultHero role={role} />}
        </div>

        {/* ── Right: Form panel ── */}
        <div
          data-slot="form"
          style={{
            flex: "1 1 60%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <NeonMarqueeBorder
            color={cfg.marqueColor}
            borderRadius={0}
            style={{
              background: "rgba(5,5,16,0.96)",
              minHeight: 560,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Form content */}
            <div
              style={{
                padding: "36px 32px 24px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {form}
            </div>

            {/* Extras slot (AvatarQuickPick + SubscriptionTierRow) */}
            {extras && (
              <div
                style={{
                  padding: "0 32px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  borderTop: `1px solid ${cfg.marqueColor}15`,
                  paddingTop: 20,
                }}
              >
                {extras}
              </div>
            )}
          </NeonMarqueeBorder>
        </div>
      </div>
    </div>
  );
}
