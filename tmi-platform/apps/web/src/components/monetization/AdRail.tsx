"use client";

import Link from "next/link";
import { useMemo } from "react";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import { getActiveSponsorForZone } from "@/lib/commerce/SponsorRegistry";
import { ADSENSE_SLOT_ENV } from "@/lib/ads/adConfig";

export type AdRailPlacement = "fan-cc-bottom" | "fan-cc-mid" | "performer-cc-bottom";
export type AdRailRole = "fan" | "performer";
export type AdRailReserve = "medium-rectangle" | "mobile-banner";
export type AdRailExperienceMode = "dashboard" | "workspace" | "live-room" | "observatory";
export type AdRailState =
  | "idle"
  | "resolving"
  | "sponsor"
  | "network"
  | "affiliate"
  | "house"
  | "unavailable";

type AdRailProps = {
  placement: AdRailPlacement;
  role: AdRailRole;
  reserve: AdRailReserve;
  experienceMode: AdRailExperienceMode;
};

type ResolvedMode = "sponsor" | "network" | "affiliate" | "house" | "unavailable";

declare global {
  interface Window {
    __TMI_ADRAIL_FORCE_MODE__?: Partial<Record<AdRailPlacement, ResolvedMode>>;
  }
}

const RESERVE_MIN_HEIGHT: Record<AdRailReserve, number> = {
  "medium-rectangle": 250,
  "mobile-banner": 110,
};

const PLACEMENT_META: Record<
  AdRailPlacement,
  {
    zone: string;
    slotKey: "dashboardMid" | "dashboardBanner";
    format: "rectangle" | "horizontal";
    title: string;
  }
> = {
  "fan-cc-bottom": {
    zone: "dashboard-dashboardMid",
    slotKey: "dashboardMid",
    format: "rectangle",
    title: "SPONSORED",
  },
  "fan-cc-mid": {
    zone: "dashboard-dashboardBanner",
    slotKey: "dashboardBanner",
    format: "horizontal",
    title: "SPONSORED",
  },
  "performer-cc-bottom": {
    zone: "dashboard-dashboardMid",
    slotKey: "dashboardMid",
    format: "rectangle",
    title: "BUSINESS PARTNERS",
  },
};

function canRender(placement: AdRailPlacement, role: AdRailRole, experienceMode: AdRailExperienceMode) {
  if (experienceMode === "live-room") return false;
  if (experienceMode === "workspace") return false;
  if (role === "performer" && placement !== "performer-cc-bottom") return false;
  if (role === "fan" && placement === "performer-cc-bottom") return false;
  return true;
}

function hasNetworkSlot(slotKey: "dashboardMid" | "dashboardBanner") {
  return Boolean(ADSENSE_SLOT_ENV[slotKey]);
}

function readForcedMode(placement: AdRailPlacement): ResolvedMode | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";
  if (!isLocalHost) return null;

  const runtimeForced = window.__TMI_ADRAIL_FORCE_MODE__?.[placement];
  if (runtimeForced) return runtimeForced;

  try {
    const storageValue = window.sessionStorage.getItem(`tmi:adrail:force-mode:${placement}`);
    if (
      storageValue === "sponsor" ||
      storageValue === "network" ||
      storageValue === "affiliate" ||
      storageValue === "house" ||
      storageValue === "unavailable"
    ) {
      return storageValue;
    }
  } catch {
    // ignore storage restrictions in private modes
  }

  return null;
}

function AffiliateCard({ role }: { role: AdRailRole }) {
  const href = role === "performer" ? "/store/performer" : "/store/fan";
  const title = role === "performer" ? "Creator Tools & Partner Offers" : "Fan Deals & Marketplace Offers";
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        border: "1px solid rgba(0,229,255,0.35)",
        borderRadius: 10,
        padding: "14px 16px",
        background: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(5,5,16,0.92))",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, color: "#00E5FF", letterSpacing: "0.06em" }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.62)" }}>
        Open curated offers without interrupting your active workspace.
      </div>
    </Link>
  );
}

function HouseCard({ role }: { role: AdRailRole }) {
  const href = role === "performer" ? "/hub/performer" : "/hub/fan";
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        border: "1px solid rgba(255,215,0,0.35)",
        borderRadius: 10,
        padding: "14px 16px",
        background: "linear-gradient(135deg, rgba(255,215,0,0.11), rgba(5,5,16,0.92))",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, color: "#FFD700", letterSpacing: "0.06em" }}>TMI FEATURED</div>
      <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.62)" }}>
        Featured campaigns, events, and memberships when paid inventory is unavailable.
      </div>
    </Link>
  );
}

export default function AdRail({ placement, role, reserve, experienceMode }: AdRailProps) {
  const meta = PLACEMENT_META[placement];

  const resolved = useMemo(() => {
    if (!canRender(placement, role, experienceMode)) {
      return { state: "unavailable" as AdRailState, mode: "unavailable" as ResolvedMode };
    }

    const forcedMode = readForcedMode(placement);
    if (forcedMode) {
      return { state: forcedMode as AdRailState, mode: forcedMode };
    }

    const sponsor = getActiveSponsorForZone(meta.zone);
    if (sponsor) {
      return { state: "sponsor" as AdRailState, mode: "sponsor" as ResolvedMode };
    }

    if (hasNetworkSlot(meta.slotKey)) {
      return { state: "network" as AdRailState, mode: "network" as ResolvedMode };
    }

    if (role === "performer") {
      return { state: "affiliate" as AdRailState, mode: "affiliate" as ResolvedMode };
    }

    return { state: "house" as AdRailState, mode: "house" as ResolvedMode };
  }, [placement, role, experienceMode, meta.zone, meta.slotKey]);

  if (resolved.mode === "unavailable") return null;

  return (
    <section
      data-monetization-rail
      data-placement={placement}
      data-role={role}
      data-experience-mode={experienceMode}
      data-rail-state={resolved.state}
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 12,
        background: "rgba(8,10,20,0.72)",
        marginTop: 16,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.45)",
          marginBottom: 8,
        }}
      >
        {meta.title}
      </div>

      <div style={{ minHeight: RESERVE_MIN_HEIGHT[reserve] }}>
        {(resolved.mode === "network" || resolved.mode === "sponsor") && (
          <UnifiedAdSlot
            venue="dashboard"
            slotKey={meta.slotKey}
            format={meta.format}
            label=""
            style={{ minHeight: RESERVE_MIN_HEIGHT[reserve] }}
            accentColor={role === "performer" ? "#FF2DAA" : "#00E5FF"}
          />
        )}
        {resolved.mode === "affiliate" && <AffiliateCard role={role} />}
        {resolved.mode === "house" && <HouseCard role={role} />}
      </div>
    </section>
  );
}
