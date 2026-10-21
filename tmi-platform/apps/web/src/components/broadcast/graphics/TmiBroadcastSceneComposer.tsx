"use client";

/**
 * TmiBroadcastSceneComposer — mounts frozen starter scenes as visible composition.
 * Uses resolveApprovedScene + GraphicsKit. Does not invent winners/votes/media.
 */

import { useMemo } from "react";
import type { TmiExperienceType } from "@/lib/experience/UniversalPlayableExperienceContract";
import {
  resolveApprovedScene,
  type BroadcastSceneDef,
  type SceneTrigger,
} from "@/lib/broadcast/TmiBroadcastGraphicsRegistry";
import {
  filterComponentsForExperience,
  layoutStyle,
  renderBroadcastGraphic,
  type GraphicsLiveState,
  type GraphicsParticipant,
  type GraphicsSceneContext,
} from "@/components/broadcast/graphics/TmiBroadcastGraphicsKit";

export type ArenaEventTypeForGraphics =
  | "concert"
  | "battle"
  | "cypher"
  | "challenge"
  | "song-challenge"
  | "live-show"
  | "monday-stage"
  | "deal-or-feud"
  | "lounge"
  | "world-dance-party"
  | "slow-jams";

export function mapArenaEventToExperience(
  eventType: ArenaEventTypeForGraphics | string,
): TmiExperienceType {
  switch (eventType) {
    case "battle":
      return "BATTLE";
    case "cypher":
      return "CYPHER";
    case "challenge":
    case "song-challenge":
      return "CHALLENGE";
    case "monday-stage":
      return "MONDAY_NIGHT_STAGE";
    case "world-dance-party":
      return "WORLD_DANCE_PARTY";
    case "lounge":
    case "slow-jams":
      return "LOUNGE";
    case "deal-or-feud":
      return "GAME_SHOW";
    case "concert":
      return "WORLD_CONCERT";
    case "live-show":
    default:
      return "LIVE_SHOW";
  }
}

export function mapLiveStateToGraphics(
  liveState: "soon" | "live" | "ended" | string,
): GraphicsLiveState {
  if (liveState === "live") return "LIVE";
  if (liveState === "ended") return "ENDED";
  return "WAITING";
}

export function mapLiveStateToTrigger(
  liveState: "soon" | "live" | "ended" | string,
  hasParticipants: boolean,
): SceneTrigger {
  if (liveState === "ended") return "SESSION_END";
  if (liveState === "live" && hasParticipants) return "TURN_START";
  if (hasParticipants) return "PARTICIPANT_READY";
  return "SESSION_READY";
}

type Props = {
  eventType: ArenaEventTypeForGraphics | string;
  liveState?: "soon" | "live" | "ended";
  roomId: string;
  title?: string | null;
  phaseLabel?: string | null;
  participants?: GraphicsParticipant[];
  activeParticipantId?: string | null;
  nextParticipantId?: string | null;
  timerLabel?: string | null;
  countdownSeconds?: number | null;
  scoreA?: number | null;
  scoreB?: number | null;
  winnerId?: string | null;
  voteOpen?: boolean;
  hasProgramMedia?: boolean;
  /** Force a specific scene (tests / director). */
  sceneOverride?: BroadcastSceneDef | null;
  className?: string;
};

export default function TmiBroadcastSceneComposer({
  eventType,
  liveState = "live",
  roomId,
  title,
  phaseLabel,
  participants = [],
  activeParticipantId,
  nextParticipantId,
  timerLabel,
  countdownSeconds,
  scoreA,
  scoreB,
  winnerId,
  voteOpen,
  hasProgramMedia,
  sceneOverride = null,
  className = "",
}: Props) {
  const experience = mapArenaEventToExperience(eventType);
  const variantCompetitive = experience !== "CYPHER";

  const scene = useMemo(() => {
    if (sceneOverride) return sceneOverride;
    const trigger = mapLiveStateToTrigger(
      liveState,
      participants.length > 0,
    );
    return resolveApprovedScene({
      experience,
      trigger,
      variantCompetitive,
    });
  }, [
    sceneOverride,
    liveState,
    participants.length,
    experience,
    variantCompetitive,
  ]);

  if (!scene) {
    return (
      <div
        className={className}
        data-tmi-broadcast-scene="none"
        data-tmi-experience={experience}
        data-room-id={roomId}
        style={{ display: "none" }}
      />
    );
  }

  const allowed = filterComponentsForExperience(
    scene.components,
    experience,
    variantCompetitive,
  );

  const ctx: GraphicsSceneContext = {
    experience,
    title: title ?? scene.sceneId,
    phaseLabel,
    liveState: mapLiveStateToGraphics(liveState),
    participants,
    activeParticipantId,
    nextParticipantId,
    timerLabel,
    countdownSeconds,
    scoreA,
    scoreB,
    winnerId,
    voteOpen,
    hasProgramMedia,
    variantCompetitive,
  };

  return (
    <div
      className={className}
      data-tmi-broadcast-scene={scene.sceneId}
      data-tmi-broadcast-layout={scene.layout}
      data-tmi-experience={experience}
      data-tmi-scene-trigger={scene.trigger}
      data-tmi-component-count={allowed.length}
      data-room-id={roomId}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 18,
        pointerEvents: "none",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        justifyContent: "space-between",
      }}
    >
      <div style={layoutStyle(scene.layout)}>
        {allowed.map((id) => (
          <div key={id} data-tmi-gfx-slot={id}>
            {renderBroadcastGraphic(id, ctx)}
          </div>
        ))}
      </div>
    </div>
  );
}
