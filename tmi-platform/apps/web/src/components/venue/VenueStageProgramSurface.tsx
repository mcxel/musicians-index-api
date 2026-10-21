"use client";

/**
 * VenueStageProgramSurface — in-venue HD program destination(s).
 * Consumes VenuePresentationExecution snapshot + optional real MediaStream.
 * NOT a second WebRTC engine. NOT broadcast authority.
 */

import type { CSSProperties, Ref } from "react";
import type { VenuePresentationExecutionSnapshot } from "@/lib/venue/VenuePresentationExecution";
import type { ChromaRuntimeSnapshot } from "@/lib/venue/ChromaSegmentationRuntime";
import VenueChromaCompositeLayer from "@/components/venue/VenueChromaCompositeLayer";

export type VenueStageParticipantVisual = {
  id: string;
  displayName?: string | null;
  imageUrl?: string | null;
};

type Props = {
  execution: VenuePresentationExecutionSnapshot;
  /** Canonical local/remote track — one stream shared; slots never duplicate as fake peers. */
  mediaStream?: MediaStream | null;
  videoRef?: Ref<HTMLVideoElement>;
  participants?: VenueStageParticipantVisual[];
  className?: string;
  /** Live chroma runtime snapshot — same session; never remounts WebRTC. */
  chromaRuntime?: ChromaRuntimeSnapshot | null;
};

function mediaStateLabel(state: VenuePresentationExecutionSnapshot["mediaState"]): string {
  switch (state) {
    case "CONNECTING":
      return "CONNECTING…";
    case "WAITING_FOR_PERFORMER":
      return "WAITING FOR PERFORMER";
    case "RECONNECTING":
      return "RECONNECTING…";
    case "SOURCE_UNAVAILABLE":
      return "SOURCE UNAVAILABLE";
    case "CHROMA_FALLBACK":
      return "CHROMA FALLBACK · VIDEO PANEL";
    case "PROGRAM_ENDED":
      return "PROGRAM ENDED";
    case "LIVE":
    default:
      return "LIVE PROGRAM";
  }
}

function slotLabel(slot: VenuePresentationExecutionSnapshot["stageSlots"][number]): string {
  if (slot.kind === "CORNER_A") return "CORNER A";
  if (slot.kind === "CORNER_B") return "CORNER B";
  if (slot.kind === "CIRCLE_MEMBER") return "CIRCLE";
  if (slot.kind === "GROUP") return "GROUP";
  return "STAGE";
}

export default function VenueStageProgramSurface({
  execution,
  mediaStream,
  videoRef,
  participants = [],
  className = "",
  chromaRuntime = null,
}: Props) {
  const { framingCss, stageSlots, mediaState, presentationMode, chroma } = execution;
  const chromaActive =
    Boolean(chroma.active && chromaRuntime?.runtimeReady && chromaRuntime.layout !== "HD_VIDEO_PANEL");
  const isBattle = execution.planPanelComposition === "BATTLE_DUAL_MIXED";
  const isCypher = execution.planPanelComposition === "CYPHER_COLLABORATIVE_ROWS";
  const showLiveVideo =
    mediaState === "LIVE" || mediaState === "CHROMA_FALLBACK";

  const videoStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: framingCss.objectFit,
    objectPosition: framingCss.objectPosition,
    background: "#000",
  };

  const shellStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio: framingCss.aspectRatio,
    background: framingCss.letterbox
      ? "radial-gradient(ellipse at 50% 40%, rgba(0,255,255,0.08), #050510 70%)"
      : "#000",
    border: "1px solid rgba(0,255,255,0.28)",
    borderRadius: 8,
    overflow: "hidden",
  };

  const gridStyle: CSSProperties = isBattle
    ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, width: "100%" }
    : isCypher || execution.planPanelComposition === "MULTI_PERFORMER_STAGE"
      ? {
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(Math.max(stageSlots.length, 1), 4)}, 1fr)`,
          gap: 4,
          width: "100%",
        }
      : { display: "block", width: "100%" };

  return (
    <div
      className={className}
      data-venue-stage-program-surface="1"
      data-venue-media-state={mediaState}
      data-venue-presentation-mode={presentationMode}
      data-venue-framing={execution.planFraming}
      data-venue-panel-composition={execution.planPanelComposition}
      data-venue-chroma-requested={chroma.requested ? "1" : "0"}
      data-venue-chroma-authorized={chroma.authorized ? "1" : "0"}
      data-venue-chroma-active={chroma.active ? "1" : "0"}
      data-venue-chroma-fallback={chroma.fallbackToVideoPanel ? "1" : "0"}
      data-venue-chroma-layout={chromaRuntime?.layout ?? "HD_VIDEO_PANEL"}
      data-venue-chroma-backend={chromaRuntime?.backend ?? "NONE"}
      data-venue-chroma-webrtc-preserved="1"
      data-venue-camera-shot={execution.camera.currentShot.shotType}
      data-venue-camera-label={execution.camera.currentShot.label}
      data-venue-view-mode={execution.viewMode}
      data-venue-env={execution.environment}
      data-venue-jumbotron-bound={execution.jumbotron.bound ? "1" : "0"}
      data-venue-bot-audience-distinct="1"
      data-venue-session-id={execution.sessionId ?? undefined}
      style={{ width: "100%" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        <span data-testid="venue-stage-media-state">{mediaStateLabel(mediaState)}</span>
        <span data-testid="venue-stage-camera-cut">
          CAM · {execution.camera.currentShot.label}
        </span>
        <span data-testid="venue-stage-framing">FRAME · {execution.planFraming}</span>
      </div>

      <div style={gridStyle}>
        {stageSlots.map((slot, index) => {
          const person = participants.find((p) => p.id === slot.participantId);
          const isPrimaryVideoSlot =
            showLiveVideo &&
            mediaStream &&
            (slot.kind === "PRIMARY" ||
              (slot.kind === "CORNER_A" && index === 0) ||
              (stageSlots.length === 1 && slot.hasDistinctSource));

          return (
            <div
              key={slot.slotId}
              data-venue-stage-slot={slot.slotId}
              data-venue-slot-kind={slot.kind}
              data-venue-slot-participant={slot.participantId ?? ""}
              data-venue-slot-has-source={slot.hasDistinctSource ? "1" : "0"}
              style={shellStyle}
            >
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  zIndex: 2,
                  fontSize: 7,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  color: "#00FFFF",
                  background: "rgba(1,3,8,0.75)",
                  padding: "2px 6px",
                  borderRadius: 3,
                }}
              >
                {slotLabel(slot)}
                {slot.displayName ? ` · ${slot.displayName}` : ""}
              </div>

              {isPrimaryVideoSlot &&
              chromaActive &&
              chromaRuntime &&
              chromaRuntime.slots.find((s) => s.slotId === slot.slotId)?.useChroma ? (
                <VenueChromaCompositeLayer
                  mediaStream={mediaStream}
                  runtime={chromaRuntime}
                  active={true}
                  data-slot-id={slot.slotId}
                  underlayCssColor={
                    execution.environment === "outdoor" ? "#1a1020" : "#0a0614"
                  }
                />
              ) : isPrimaryVideoSlot ? (
                <video
                  ref={index === 0 ? videoRef : undefined}
                  autoPlay
                  muted
                  playsInline
                  style={videoStyle}
                  data-venue-hd-panel="1"
                />
              ) : slot.hasDistinctSource && person?.imageUrl ? (
                // Honest still identity — never presented as a second LIVE WebRTC clone.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={person.imageUrl}
                  alt={person.displayName ?? slot.displayName ?? "Performer"}
                  data-venue-slot-still="1"
                  style={videoStyle}
                />
              ) : (
                <div
                  data-venue-slot-empty="1"
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: 120,
                    display: "grid",
                    placeItems: "center",
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                    padding: 12,
                    textAlign: "center",
                  }}
                >
                  {!slot.hasDistinctSource
                    ? isBattle && slot.kind === "CORNER_B"
                      ? "WAITING FOR CORNER B"
                      : mediaStateLabel(mediaState)
                    : "SOURCE UNAVAILABLE"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
