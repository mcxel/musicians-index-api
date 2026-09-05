"use client";

/**
 * PerformerLivePresentationShell — production host-first presentation for Regular GO LIVE.
 *
 * Replaces bare/diagnostic camera chrome with PerformerLive DNA:
 * LiveVideoPanel texture + IdentityPanel lower-third.
 * Never fabricates audience/tips. LIVE badge only when published.
 * surfaceKind = production (green_debug cannot certify experienceCert).
 */

import type { ReactNode } from "react";
import {
  PROGRAM_PERFORMER_CAMERA,
  type PerformerLiveProgramComposition,
} from "@/lib/experiencePresentation/composePerformerLiveProgram";

export type PerformerLivePresentationShellProps = {
  children: ReactNode;
  displayName?: string | null;
  isLivePublished: boolean;
  cameraPreviewActive: boolean;
  hasLiveVideo: boolean;
  watchingCount?: number;
  composition?: PerformerLiveProgramComposition | null;
  programSourceId?: string;
};

export default function PerformerLivePresentationShell({
  children,
  displayName,
  isLivePublished,
  cameraPreviewActive,
  hasLiveVideo,
  watchingCount = 0,
  composition = null,
  programSourceId = PROGRAM_PERFORMER_CAMERA,
}: PerformerLivePresentationShellProps) {
  const name = (displayName?.trim() || composition?.hostDisplayName || "Performer").trim();
  const layout = composition?.composition ?? "HOST_CLOSE";
  const showIdentity = hasLiveVideo || isLivePublished || cameraPreviewActive;

  return (
    <div
      data-performer-live-presentation="production"
      data-experience-pack="PerformerLive"
      data-presentation-composition={layout}
      data-program-source={programSourceId}
      data-surface-kind="production"
      data-live-published={isLivePublished ? "true" : "false"}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#050510",
      }}
    >
      {/* Host-first stage frame — not a green diagnostic field */}
      <div
        data-primitive="LiveVideoPanel"
        style={{
          position: "absolute",
          inset: 0,
          border: isLivePublished
            ? "1px solid rgba(255,45,170,0.35)"
            : "1px solid rgba(0,255,255,0.18)",
          boxShadow: isLivePublished
            ? "inset 0 0 40px rgba(255,45,170,0.12)"
            : "inset 0 0 28px rgba(0,255,255,0.06)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {showIdentity ? (
        <div
          data-primitive="IdentityPanel"
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 10,
            zIndex: 8,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: 0,
              padding: "8px 12px",
              borderRadius: 8,
              background:
                "linear-gradient(135deg, rgba(5,5,16,0.92) 0%, rgba(10,6,20,0.88) 100%)",
              border: "1px solid rgba(0,255,255,0.28)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isLivePublished ? (
                <span
                  data-live-badge="true"
                  style={{
                    background: "#FF2020",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                  }}
                >
                  ● LIVE
                </span>
              ) : (
                <span
                  style={{
                    background: "rgba(0,255,136,0.12)",
                    color: "#00FF88",
                    border: "1px solid rgba(0,255,136,0.4)",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                  }}
                >
                  PREVIEW
                </span>
              )}
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: "rgba(255,215,0,0.85)",
                  textTransform: "uppercase",
                }}
              >
                Performer Live · {layout.replace(/_/g, " ")}
              </span>
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 280,
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(0,255,255,0.7)",
                textTransform: "uppercase",
              }}
            >
              {programSourceId}
            </div>
          </div>

          <div
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              background: "rgba(5,5,16,0.85)",
              border: "1px solid rgba(170,45,255,0.35)",
              fontSize: 9,
              fontWeight: 800,
              color: "#AA2DFF",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}
            data-audience-watching={watchingCount}
            title="Real human watching count only"
          >
            {watchingCount} watching
          </div>
        </div>
      ) : null}
    </div>
  );
}
