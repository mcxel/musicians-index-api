"use client";

/**
 * VenuePreviewStage — PREVIEW VENUE / VENUE TEST on the SAME path as GO LIVE:
 * ArenaEventShell → UniversalVenueRenderer → Venue HUD.
 * No VenuePreviewV2. No fake demo venue.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ArenaEventType } from "@/components/live/ArenaEventShell";
import type { VenueEnvironmentKind } from "@/lib/venues/EventVenueEnvironment";
import {
  DEFAULT_PREVIEW_CAPACITY,
  buildTestOccupancyMesh,
  createPreviewSessionFlags,
  crowdLayoutForEnvironment,
  formatTestOccupancyLabel,
  occupancyRatioForLevel,
  testOccupiedCount,
  type TestOccupancyLevel,
  type VenuePreviewViewMode,
} from "@/lib/venues/VenuePreviewCertification";
import VenueTestOccupancyBar from "@/components/venues/VenueTestOccupancyBar";
import VenueCertificationChecklist from "@/components/venues/VenueCertificationChecklist";

const ArenaEventShell = dynamic(() => import("@/components/live/ArenaEventShell"), {
  ssr: false,
});

const VIEW_MODES: VenuePreviewViewMode[] = [
  "FREE_ROAM_3D",
  "PANORAMA_180",
  "PANORAMA_360",
  "SPHERICAL_360",
];

const GOLD = "#FFD700";
const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";

export interface VenuePreviewStageProps {
  roomId: string;
  eventType?: ArenaEventType;
  venueEnvironment?: VenueEnvironmentKind | null;
  venueSkinId?: string | null;
  isCertification?: boolean;
  initialOccupancy?: TestOccupancyLevel;
  initialViewMode?: VenuePreviewViewMode;
  capacity?: number;
  mode?: "audience" | "performer";
}

export default function VenuePreviewStage({
  roomId,
  eventType = "live-show",
  venueEnvironment = "indoor",
  venueSkinId = "red-theater",
  isCertification = false,
  initialOccupancy = "EMPTY",
  initialViewMode = "FREE_ROAM_3D",
  capacity = DEFAULT_PREVIEW_CAPACITY,
  mode = "performer",
}: VenuePreviewStageProps) {
  const flags = useMemo(
    () => createPreviewSessionFlags(isCertification),
    [isCertification],
  );
  const [occupancy, setOccupancy] = useState<TestOccupancyLevel>(initialOccupancy);
  const [viewMode, setViewMode] = useState<VenuePreviewViewMode>(initialViewMode);

  const layout = crowdLayoutForEnvironment(venueEnvironment, eventType);
  const ratio = occupancyRatioForLevel(occupancy);
  const occupied = testOccupiedCount(occupancy, capacity);
  const testLabel = formatTestOccupancyLabel(occupied, capacity);

  const meshFill = useMemo(
    () =>
      buildTestOccupancyMesh({
        roomId,
        level: occupancy,
        layout,
      }),
    [roomId, occupancy, layout],
  );

  const panelMode =
    eventType === "lounge" ||
    venueSkinId?.includes("tv-studio") ||
    venueSkinId === "tv-studio";

  return (
    <div
      data-venue-preview-stage="true"
      data-is-preview={flags.isPreview ? "true" : "false"}
      data-publish-discovery="false"
      data-view-mode={viewMode}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: "100%",
        background: "#050510",
        color: "#fff",
      }}
    >
      {/* Preview chrome — not part of fake live broadcast */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          padding: "10px 12px",
          borderBottom: `1px solid ${GOLD}33`,
          background: "rgba(5,5,16,0.95)",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.2em",
            color: GOLD,
            border: `1px solid ${GOLD}66`,
            padding: "4px 10px",
            borderRadius: 6,
          }}
        >
          {isCertification ? "VENUE CERTIFICATION" : "PREVIEW VENUE / VENUE TEST"}
        </span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
          Same runtime as GO LIVE · roomId {roomId}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 9, color: FUCHSIA, fontWeight: 700 }}>
          NOT PUBLISHED · not real viewers
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(240px, 320px)",
          gap: 10,
          padding: "0 10px 10px",
        }}
        className="venue-preview-layout"
      >
        <style>{`
          @media (max-width: 430px) {
            .venue-preview-layout { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 390px) {
            .venue-preview-viewport { min-height: 52vh !important; }
          }
          @media (max-width: 360px) {
            .venue-preview-viewport { min-height: 48vh !important; }
          }
        `}</style>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <VenueTestOccupancyBar
            level={occupancy}
            onChange={setOccupancy}
            label={testLabel}
            capacity={capacity}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: CYAN }}>
              VIEW MODE
            </span>
            {VIEW_MODES.map((vm) => (
              <button
                key={vm}
                type="button"
                onClick={() => setViewMode(vm)}
                style={{
                  padding: "4px 8px",
                  fontSize: 8,
                  fontWeight: 800,
                  cursor: "pointer",
                  borderRadius: 6,
                  border:
                    viewMode === vm
                      ? `1px solid ${CYAN}`
                      : "1px solid rgba(255,255,255,0.15)",
                  background:
                    viewMode === vm ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)",
                  color: viewMode === vm ? CYAN : "rgba(255,255,255,0.65)",
                }}
              >
                {vm}
              </button>
            ))}
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
              Prefer FREE_ROAM_3D · HUD overlays all modes
            </span>
          </div>

          <div
            className="venue-preview-viewport"
            data-view-mode={viewMode}
            style={{
              position: "relative",
              minHeight: "58vh",
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${GOLD}33`,
              // View-mode framing only — same renderer underneath (no parallel engine).
              transform:
                viewMode === "PANORAMA_180"
                  ? "perspective(900px) rotateY(-6deg)"
                  : viewMode === "PANORAMA_360" || viewMode === "SPHERICAL_360"
                    ? "perspective(1100px) scale(1.02)"
                    : undefined,
            }}
          >
            <ArenaEventShell
              roomId={roomId}
              eventType={eventType}
              mode={mode}
              liveState="soon"
              instantEmptyStage={false}
              venueEnvironment={venueEnvironment}
              venueSkinId={venueSkinId}
              isPreview
              isCertification={isCertification}
              testOccupancyRatio={ratio}
              testCapacity={capacity}
              testOccupancyLabel={testLabel}
            />
          </div>

          {/* Honest occupancy mapping readout */}
          <div
            style={{
              fontSize: 8,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.04em",
              padding: "6px 8px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
            }}
          >
            Spatial fill ({layout}): {meshFill.occupied}/{meshFill.capacity} seat points · front→
            {panelMode ? "performer panels" : "seating"}→standing/dance ·{" "}
            {meshFill.labeledOccupants.slice(0, 3).map((o) => o.label).join(", ") || "empty"}
            {meshFill.labeledOccupants.length > 3 ? "…" : ""}
            {" · "}
            synthetic [TEST] AvatarRig seats (Fan bobbleheads — Rule 26, no Performer ownership)
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <VenueCertificationChecklist skinId={venueSkinId ?? "red-theater"} />
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.5,
              padding: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
            }}
          >
            <div style={{ color: CYAN, fontWeight: 800, marginBottom: 6 }}>PATH</div>
            Venue definition → UniversalVenueRenderer → lighting → seating map → Venue HUD →
            TEST occupancy. Share this URL on phone/PC — same roomId session.
          </div>
        </div>
      </div>
    </div>
  );
}
