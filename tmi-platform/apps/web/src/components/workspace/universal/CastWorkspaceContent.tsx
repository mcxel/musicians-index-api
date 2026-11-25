"use client";

/**
 * CastWorkspaceContent — CAST section/workspace inside CanonicalBottomDrawerHost.
 *
 * CAST is a section, not a scattered row of platform buttons.
 * External destinations (YT/IG/FB/…) live here via LiveDistributionBezel,
 * capability-gated. Fan does not inherit Performer external-broadcast tooling.
 */

import React from "react";
import LiveDistributionBezel from "@/components/broadcast/LiveDistributionBezel";
import { canBroadcastExternalDestinations } from "@/lib/broadcast/BroadcastCapabilityResolver";
import ShareStudioContent from "@/components/workspace/universal/ShareStudioContent";

export interface CastWorkspaceContentProps {
  role: "fan" | "performer";
  userId?: string | null;
}

export default function CastWorkspaceContent({
  role,
  userId = null,
}: CastWorkspaceContentProps) {
  const canExternal = canBroadcastExternalDestinations({ activeRole: role });

  return (
    <div
      data-testid="cast-workspace-content"
      data-cast-section="1"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        color: "#fff",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#00FFFF",
            marginBottom: 6,
          }}
        >
          CAST
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          Open destinations and cast actions in one workspace. Monitors and live session stay mounted.
        </div>
      </div>

      {canExternal ? (
        <div
          data-cast-external-destinations="1"
          style={{
            border: "1px solid rgba(0,255,255,0.28)",
            borderRadius: 12,
            padding: 12,
            background: "rgba(0,229,255,0.04)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#FFD700",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            External destinations
          </div>
          <LiveDistributionBezel userId={userId} />
        </div>
      ) : (
        <div
          data-cast-fan-honest-empty="1"
          style={{
            border: "1px dashed rgba(255,255,255,0.18)",
            borderRadius: 12,
            padding: 16,
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.45,
          }}
        >
          External platform cast (YouTube, Instagram, Facebook, TikTok, and related destinations)
          is a Performer broadcast capability. Fan Hub keeps Cast for share/session actions only.
        </div>
      )}

      <div
        data-cast-share-studio="1"
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: 12,
          background: "rgba(5,5,16,0.55)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "#AA2DFF",
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          Share / cast media
        </div>
        <ShareStudioContent
          context={{
            sharePath: typeof window !== "undefined" ? window.location.pathname : "/",
          }}
        />
      </div>
    </div>
  );
}
