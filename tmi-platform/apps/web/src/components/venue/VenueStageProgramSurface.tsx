"use client";

/**
 * VenueStageProgramSurface — in-venue HD program destination(s).
 * Consumes VenuePresentationExecution snapshot + optional real MediaStream.
 * NOT a second WebRTC engine. NOT broadcast authority.
 */

import { useEffect, useRef, type CSSProperties, type Ref } from "react";
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
  /**
   * Real per-participant remote media, keyed by the same stable participantId
   * carried on VenuePresentationExecutionSnapshot.stageSlots[].participantId
   * (never array position/display name/tile index). When a slot's
   * participantId has an entry here, it renders that participant's own real
   * video — independent of (and never overridden by) the single shared
   * mediaStream/videoRef above, which remains the local-performer fallback.
   */
  participantMediaStreams?: ReadonlyMap<string, MediaStream> | null;
};

/** One real remote participant's own video — independent ref per slot so
 *  multiple simultaneous peer streams never collide on one shared videoRef. */
function SlotPeerVideo({ stream, style }: { stream: MediaStream; style: CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
    void el.play().catch(() => {});
  }, [stream]);
  // Muted: remote peer audio routes through the canonical TMI audio mixer
  // (ChannelMixerDirector), never raw HTMLVideoElement audio — same rule
  // useLobbyPeerMediaSession already follows for Fan Lobby/Song Challenge.
  return <video ref={ref} autoPlay muted playsInline style={style} data-venue-hd-panel="1" data-venue-peer-video="1" />;
}

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
  if (slot.roleLabel) return slot.roleLabel;
  if (slot.kind === "CORNER_A") return "CORNER A";
  if (slot.kind === "CORNER_B") return "CORNER B";
  if (slot.kind === "CHALLENGER") return "CHALLENGER";
  if (slot.kind === "CHALLENGED") return "CHALLENGED";
  if (slot.kind === "DJ_BOOTH") return "DJ BOOTH";
  if (slot.kind === "GAUNTLET_SURVIVOR") return "SURVIVOR";
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
  participantMediaStreams = null,
}: Props) {
  const { framingCss, stageSlots, mediaState, presentationMode, chroma } = execution;
  const chromaActive =
    Boolean(chroma.active && chromaRuntime?.runtimeReady && chromaRuntime.layout !== "HD_VIDEO_PANEL");
  const isBattle = execution.planPanelComposition === "BATTLE_DUAL_MIXED";
  const isChallenge = execution.planPanelComposition === "CHALLENGE_FOCUS";
  const isCypher = execution.planPanelComposition === "CYPHER_COLLABORATIVE_ROWS";
  const isDanceParty = execution.planCameraProfile === "DANCE_PARTY";
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

  const gridStyle: CSSProperties =
    isBattle || (isChallenge && stageSlots.length >= 2)
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
      data-venue-active-performer-id={execution.activePerformerId ?? ""}
      data-venue-winner-performer-id={execution.winnerPerformerId ?? ""}
      data-venue-dj-booth-mode={execution.djBoothMode ?? ""}
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
          const peerStream = slot.participantId
            ? participantMediaStreams?.get(slot.participantId) ?? null
            : null;
          const isPrimaryVideoSlot =
            !peerStream &&
            showLiveVideo &&
            mediaStream &&
            (slot.kind === "PRIMARY" ||
              slot.kind === "DJ_BOOTH" ||
              (slot.kind === "CHALLENGER" && index === 0) ||
              (slot.kind === "CORNER_A" && index === 0) ||
              (slot.kind === "GAUNTLET_SURVIVOR" && index === 0) ||
              (stageSlots.length === 1 && slot.hasDistinctSource));

          const slotRingStyle: CSSProperties = slot.isWinner
            ? {
                ...shellStyle,
                border: "2px solid #FFD700",
                boxShadow: "0 0 22px rgba(255,215,0,0.6), inset 0 0 14px rgba(255,215,0,0.22)",
              }
            : slot.isActivePerformer
              ? {
                  ...shellStyle,
                  border: "2px solid #00FFFF",
                  boxShadow: "0 0 18px rgba(0,255,255,0.55), inset 0 0 12px rgba(0,255,255,0.18)",
                }
              : shellStyle;

          return (
            <div
              key={slot.slotId}
              data-venue-stage-slot={slot.slotId}
              data-venue-panel-id={slot.panelId}
              data-venue-media-source-id={slot.mediaSourceId ?? ""}
              data-venue-slot-kind={slot.kind}
              data-venue-slot-participant={slot.participantId ?? ""}
              data-venue-slot-has-source={slot.hasDistinctSource ? "1" : "0"}
              data-venue-active-performer={slot.isActivePerformer ? "1" : "0"}
              data-venue-on-point={slot.isOnPoint ? "1" : "0"}
              data-venue-winner={slot.isWinner ? "1" : "0"}
              style={slotRingStyle}
            >
              {slot.isActivePerformer && (
                <div
                  data-testid="official-active-performer-ring"
                  data-active-performer-id={slot.participantId ?? ""}
                  data-active-slot-id={slot.slotId}
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 3,
                    borderRadius: 7,
                    border: "2px solid rgba(0,255,255,0.92)",
                    boxShadow: "0 0 16px rgba(0,255,255,0.6), inset 0 0 10px rgba(0,255,255,0.25)",
                  }}
                />
              )}

              {slot.isOnPoint && (
                <div
                  data-testid="stage-performance-point"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    zIndex: 4,
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    color: slot.isWinner ? "#050510" : "#00FFFF",
                    background: slot.isWinner
                      ? "linear-gradient(90deg, #FFD700, #FFA500)"
                      : "rgba(0,255,255,0.18)",
                    border: `1px solid ${slot.isWinner ? "#FFD700" : "rgba(0,255,255,0.65)"}`,
                    padding: "2px 6px",
                    borderRadius: 3,
                  }}
                >
                  {slot.isWinner ? "👑 WINNER" : "● ACTIVE ON STAGE"}
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  zIndex: 4,
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

              {peerStream ? (
                <SlotPeerVideo stream={peerStream} style={videoStyle} />
              ) : isPrimaryVideoSlot &&
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

              {(slot.kind === "DJ_BOOTH" || isDanceParty) && (
                <div
                  data-testid="dj-booth-foreground-layer"
                  data-dj-booth-mode={execution.djBoothMode ?? "REAL_EQUIPMENT_WIDE"}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 5,
                    pointerEvents: "none",
                    background:
                      "linear-gradient(180deg, rgba(5,5,16,0.12) 0%, rgba(10,6,24,0.92) 45%, rgba(5,5,16,0.98) 100%)",
                    borderTop: "2px solid rgba(0,255,255,0.65)",
                    boxShadow: "0 -6px 20px rgba(255,45,170,0.35)",
                    padding: "6px 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid #00FFFF",
                        background:
                          "radial-gradient(circle, #FFD700 22%, #050510 26%, #161830 70%)",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 7,
                        fontWeight: 900,
                        letterSpacing: "0.14em",
                        color: "#00FFFF",
                      }}
                    >
                      DECK A · SYNC
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 7,
                      fontWeight: 900,
                      letterSpacing: "0.16em",
                      color: "#FFD700",
                      padding: "2px 8px",
                      borderRadius: 3,
                      border: "1px solid rgba(255,215,0,0.45)",
                      background: "rgba(255,215,0,0.12)",
                    }}
                  >
                    {execution.djBoothMode === "VIRTUAL_BOOTH_DECK"
                      ? "TMI VIRTUAL BOOTH · DUAL TURNTABLES"
                      : "DJ BOOTH · REAL EQUIPMENT CAM (16:9 WIDE)"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 7,
                        fontWeight: 900,
                        letterSpacing: "0.14em",
                        color: "#FF2DAA",
                      }}
                    >
                      DECK B · LIVE
                    </span>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid #FF2DAA",
                        background:
                          "radial-gradient(circle, #00FFFF 22%, #050510 26%, #161830 70%)",
                        display: "inline-block",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
