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
        padding: 32,
      }}
    >
      {/* Placeholder illustration frame */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: `2px solid ${cfg.marqueColor}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          background: `radial-gradient(circle, ${cfg.marqueColor}10 0%, transparent 70%)`,
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
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "flex",
          gap: 0,
          borderRadius: 16,
          overflow: "hidden",
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
