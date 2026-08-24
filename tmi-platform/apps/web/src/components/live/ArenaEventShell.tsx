"use client";

/**
 * ArenaEventShell — universal arena host for all TMI event types.
 *
 * All live events (concerts, battles, cyphers, challenges, live shows,
 * performances) are hosted inside this arena shell.
 *
 * World Dance Party is the ONLY exception and is handled by DanceArena3D
 * (no chairs — standing/dance-floor only).
 *
 * Venue mapping (matches VENUE_SYSTEM_README.md):
 *   concert    → Arena  (1)  — 18,500 cap, stadium wrap
 *   battle     → Arena  (1)  — ring-side + stadium
 *   cypher     → Theater(0)  — 2,730 cap, intimate circle
 *   challenge  → Outdoor(3)  — 8,200 cap, festival stage
 *   song-challenge → Contest Stage(5) — work-vs-work dual song focus
 *   live-show  → Theater(0)  — general go-live performance
 *   monday-stage → Theater(0)— weekly flagship
 */

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { VenueIndex } from "@/components/live/AudienceScene";
import { useActiveCompetitionTheme, type CompetitionFormat } from "@/lib/competition/ThemeRegistry";
import CompetitionPresentationLayer from "@/components/competition/presentation/CompetitionPresentationLayer";
import type {
  CompetitionParticipantView,
  CompetitionPhase,
} from "@/components/competition/presentation/competitionPresentation.types";
import RoomEnvironmentLayer from "@/components/live/RoomEnvironmentLayer";
import { arenaEventTypeToVenueType } from "@/lib/venues/VenueAssetRegistry";
import { MemoryLedger } from "@/core/eos/memoryLedger";
import FanRubricVotingPanel from "@/components/voting/FanRubricVotingPanel";
import CompetitionBeatDock from "@/components/competition/CompetitionBeatDock";
import { getGuestId } from "@/lib/identity/getGuestId";
import { resolveExperiencePersonality } from "@/lib/live/ExperiencePersonality";
import {
  resolveEventVenueEnvironment,
  type VenueEnvironmentKind,
} from "@/lib/venues/EventVenueEnvironment";
import type { VenueSpatialMap, WorldViewMode } from "@/lib/world/WorldScenePlan";
import { useWorldScenePlanStore } from "@/lib/world/worldScenePlanStore";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false },
);

const TMIInteractiveVenueHud = dynamic(
  () => import("@/components/venue-hud/TMIInteractiveVenueHud"),
  { ssr: false },
);

const AvatarVenueAnchor = dynamic(
  () => import("@/components/avatar/AvatarVenueAnchor"),
  { ssr: false },
);

// NOTE (2026-07-23): components/competition/CompetitionAudienceViewport is
// NOT wired in here and never should be as a default render path - every
// performer/chat/viewer-count value inside it is still hardcoded mock data
// (no props flow from real WebRTC participants, no live chat backend), so
// mounting it directly would replace the real Daily.co video + real
// audience for every battle/cypher/challenge room with a fake-data screen.
// Phase 3 of the Competition Runtime plan harvested its genuinely reusable
// presentation pieces (VS overlay, scoreboard, timer, etc.) into
// components/competition/presentation/ instead - CompetitionPresentationLayer
// below is that harvest, mounted as a props-driven overlay on top of the
// real renderer rather than a replacement for it.

export type ArenaEventType =
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

export type ArenaLiveState = "soon" | "live" | "ended";

const VENUE_MAP: Record<ArenaEventType, VenueIndex> = {
  "concert":           1,
  "battle":            1,
  "cypher":            0,
  "challenge":         3,
  "song-challenge":    5,
  "live-show":         0,
  "monday-stage":      0,
  "deal-or-feud":      3,
  "lounge":            0,
  "world-dance-party": 1,
  "slow-jams":         3,
};

const EVENT_LABELS: Record<ArenaEventType, string> = {
  "concert":           "CONCERT ARENA",
  "battle":            "BATTLE ARENA",
  "cypher":            "CYPHER CIRCLE",
  "challenge":         "CHALLENGE STAGE",
  "song-challenge":    "SONG CHALLENGE STAGE",
  "live-show":         "LIVE STAGE",
  "monday-stage":      "MONDAY NIGHT STAGE",
  "deal-or-feud":      "DEAL OR FEUD 1000",
  "lounge":            "VIP LOUNGE",
  "world-dance-party": "WORLD DANCE PARTY",
  "slow-jams":         "SUNDAY SLOW JAMS",
};

// Maps ArenaEventType → venueSlug used by HeroPresenceRegistry
const VENUE_SLUG_MAP: Record<ArenaEventType, string> = {
  "concert":           "world-concert",
  "battle":            "battle-arena",
  "cypher":            "cypher",
  "challenge":         "challenge-arena",
  "song-challenge":    "challenge-arena",
  "live-show":         "world-concert",
  "monday-stage":      "monday-stage",
  "deal-or-feud":      "deal-or-feud",
  "lounge":            "vip-lounge",
  "world-dance-party": "world-dance-party",
  "slow-jams":         "slow-jams",
};

// Only battle/cypher/challenge are competition formats with a themeable
// identity (Rule 21: same one Venue Runtime, theming is presentation-only).
const COMPETITION_FORMAT_MAP: Partial<Record<ArenaEventType, CompetitionFormat>> = {
  battle: "BATTLE",
  cypher: "CYPHER",
  challenge: "CHALLENGE",
  "song-challenge": "CHALLENGE",
};

interface ArenaEventShellProps {
  readonly roomId: string;
  readonly eventType?: ArenaEventType;
  readonly mode?: "audience" | "performer";
  readonly watcherCount?: number;
  readonly liveState?: ArenaLiveState;
  // Competition presentation data - optional and honestly empty by default.
  // No caller currently threads real participant/score/timer state through
  // to this component, so these render pending/empty states (Rule 20) until
  // a real data source is wired up, rather than being fabricated here.
  readonly roundLabel?: string | null;
  readonly remainingSeconds?: number | null;
  readonly leftParticipant?: CompetitionParticipantView | null;
  readonly rightParticipant?: CompetitionParticipantView | null;
  readonly crowdEnergy?: number | null;
  readonly winnerParticipantId?: string | null;
  /** When true, EOS ExperienceWidgetLayer owns presentation — skip duplicate overlay */
  readonly suppressPresentation?: boolean;
  /**
   * Instant Go Live: empty seats first paint; occupancy from real presence only.
   * No progressive bot stadium fill; watching count stays honest (Rule 20).
   */
  readonly instantEmptyStage?: boolean;
  /**
   * Fan rubric dock — open when voting window is live (RESULT / vote phase / etc.).
   * Defaults: open on RESULTS when left+right participants exist.
   */
  readonly rubricVotingOpen?: boolean;
  readonly rubricPerformerIds?: string[];
  readonly rubricPerformerLabels?: Record<string, string>;
  readonly rubricEventId?: string;
  readonly rubricVoterId?: string | null;
  /**
   * Indoor | outdoor venue mode (Marcel lock). Lounges ignore.
   * Monday Night Stage + official game shows force indoor unless specialYearlyOutdoor.
   */
  readonly venueEnvironment?: VenueEnvironmentKind | null;
  readonly venueSkinId?: string | null;
  readonly specialYearlyOutdoor?: boolean;
  /**
   * PREVIEW VENUE / VENUE TEST — same UniversalVenueRenderer path as GO LIVE.
   * Never published as real viewers (Rule 20).
   */
  readonly isPreview?: boolean;
  readonly isCertification?: boolean;
  /** 0–1 TEST occupancy when isPreview. */
  readonly testOccupancyRatio?: number | null;
  readonly testCapacity?: number;
  /** Labeled TEST counter for HUD (e.g. "TEST: 250 / 1,000 OCCUPANCY"). */
  readonly testOccupancyLabel?: string | null;
  /** World Director view mode — falls back to stored WorldScenePlan for roomId. */
  readonly viewMode?: WorldViewMode;
  /** Square-feet spatial map — falls back to stored WorldScenePlan. */
  readonly spatialMap?: VenueSpatialMap | null;
}

const LIVE_STATE_TO_PHASE: Record<ArenaLiveState, CompetitionPhase> = {
  soon: "WAITING",
  live: "LIVE",
  ended: "RESULTS",
};

const LIVE_STATE_LABEL: Record<ArenaLiveState, string> = {
  soon: "SOON",
  live: "LIVE",
  ended: "ENDED",
};

/** Event types that host fan rubric voting via this shared shell. */
const RUBRIC_EVENT_TYPES = new Set<ArenaEventType>([
  "battle",
  "cypher",
  "challenge",
  "song-challenge",
  "monday-stage",
  "deal-or-feud",
]);

export default function ArenaEventShell({
  roomId,
  eventType = "live-show",
  mode = "audience",
  watcherCount,
  liveState = "live",
  roundLabel = null,
  remainingSeconds = null,
  leftParticipant = null,
  rightParticipant = null,
  crowdEnergy = null,
  winnerParticipantId = null,
  suppressPresentation = false,
  instantEmptyStage = false,
  rubricVotingOpen,
  rubricPerformerIds,
  rubricPerformerLabels,
  rubricEventId,
  rubricVoterId,
  venueEnvironment = null,
  venueSkinId = null,
  specialYearlyOutdoor = false,
  isPreview = false,
  isCertification = false,
  testOccupancyRatio = null,
  testCapacity = 1000,
  testOccupancyLabel = null,
  viewMode: viewModeProp,
  spatialMap: spatialMapProp,
}: ArenaEventShellProps) {
  const scenePlan = useWorldScenePlanStore((s) => s.plans[roomId] ?? null);
  const viewMode = viewModeProp ?? scenePlan?.viewMode ?? "FREE_ROAM_3D";
  const spatialMap = spatialMapProp ?? scenePlan?.spatialMap ?? null;
  const venueKindForEnv =
    eventType === "monday-stage"
      ? "monday-night-stage"
      : eventType === "slow-jams"
        ? "slow-jams"
        : eventType === "world-dance-party"
          ? "world-dance-party"
          : eventType === "lounge"
            ? "lounge"
            : eventType === "deal-or-feud"
              ? "deal-or-feud"
              : eventType;
  const envResolution = resolveEventVenueEnvironment({
    kind: venueKindForEnv,
    environment: venueEnvironment,
    skinId: venueSkinId,
    specialYearlyOutdoor,
  });
  const venueIndex =
    envResolution.policy === "exempt"
      ? (VENUE_MAP[eventType] ?? 0)
      : envResolution.venueIndex;
  const label = EVENT_LABELS[eventType] ?? "TMI ARENA";
  const venueSlug = VENUE_SLUG_MAP[eventType];
  const showHeroes = liveState === "live";
  const [guestVoterId] = useState(() => (typeof window !== "undefined" ? getGuestId() : null));

  // Hooks must run unconditionally - default to BATTLE's theme set when this
  // isn't a competition format, but its colors only get used below when
  // competitionFormat is non-null (concert/live-show/monday-stage keep the
  // original red/cyan styling untouched).
  const competitionFormat = COMPETITION_FORMAT_MAP[eventType] ?? null;
  const theme = useActiveCompetitionTheme(competitionFormat ?? "BATTLE");
  const liveColor = competitionFormat ? theme.colors.alert : "#FF2020";
  const watchingColor = competitionFormat ? theme.colors.leftFrame : "#00FFFF";

  const venueType = arenaEventTypeToVenueType(eventType);
  const isLive = liveState === "live";
  const energyLevel =
    envResolution.policy === "exempt"
      ? isLive
        ? 0.75
        : 0.3
      : isLive
        ? envResolution.ambientEnergy
        : envResolution.ambientEnergy * 0.45;

  const rubricIds = useMemo(() => {
    if (rubricPerformerIds && rubricPerformerIds.length > 0) return rubricPerformerIds;
    const derived = [leftParticipant?.id, rightParticipant?.id].filter(
      (id): id is string => Boolean(id?.trim()),
    );
    return derived;
  }, [rubricPerformerIds, leftParticipant?.id, rightParticipant?.id]);

  const rubricLabels = useMemo(() => {
    if (rubricPerformerLabels) return rubricPerformerLabels;
    const labels: Record<string, string> = {};
    if (leftParticipant?.id) labels[leftParticipant.id] = leftParticipant.displayName;
    if (rightParticipant?.id) labels[rightParticipant.id] = rightParticipant.displayName;
    return labels;
  }, [rubricPerformerLabels, leftParticipant, rightParticipant]);

  const showRubric =
    RUBRIC_EVENT_TYPES.has(eventType) &&
    rubricIds.length > 0 &&
    (rubricVotingOpen ?? liveState === "ended");

  // ── Phase 7: Memory Ledger hooks ─────────────────────────────────────────
  // Emit WINNER_DECLARED when a winner surfaces. actorId is the winning
  // participant id — only fires when a real id arrives (Rule 20).
  useEffect(() => {
    if (!winnerParticipantId) return;
    MemoryLedger.record("WINNER_DECLARED", winnerParticipantId, {
      roomId,
      payload: { eventType, liveState },
    });
  }, [winnerParticipantId, roomId, eventType, liveState]);

  // Emit CONCERT_COMPLETED / MATCH_COMPLETED when event transitions to ended.
  useEffect(() => {
    if (liveState !== "ended") return;
    const isConcertFormat = eventType === "concert" || eventType === "monday-stage";
    const kind = isConcertFormat ? "CONCERT_COMPLETED" : "MATCH_COMPLETED";
    // Prefer real winner as actor; roomId is a stable proxy only when none (Rule 20).
    const actorId = winnerParticipantId?.trim() || roomId;
    MemoryLedger.record(kind, actorId, {
      roomId,
      payload: { eventType, winnerParticipantId: winnerParticipantId ?? undefined },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveState]);   // intentionally omit eventType/roomId — fires once on end

  const liveStateLabel = isPreview
    ? isCertification
      ? "VENUE CERT"
      : "VENUE TEST"
    : LIVE_STATE_LABEL[liveState];

  return (
    <RoomEnvironmentLayer
      venueType={venueType}
      mode={mode}
      energyLevel={energyLevel}
      showSponsorZones={false}
    >
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ── Arena header badge ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
        background: "rgba(5,5,16,0.88)", borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: isPreview ? "#FFD700" : liveColor,
          flexShrink: 0,
          animation: isPreview ? undefined : "tmiArenaBlink 1s step-end infinite",
          boxShadow: `0 0 6px ${isPreview ? "#FFD700" : liveColor}`,
        }} />
        <style>{`@keyframes tmiArenaBlink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        <span style={{
          fontSize: 9, fontWeight: 900, letterSpacing: "0.28em",
          color: isPreview ? "#FFD700" : liveColor,
        }}>
          {liveStateLabel}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.55)", marginLeft: 4,
        }}>
          {label}
        </span>
        {isPreview && testOccupancyLabel ? (
          <span style={{ marginLeft: "auto", fontSize: 9, color: "#FFD700", fontWeight: 700 }}>
            {testOccupancyLabel}
          </span>
        ) : watcherCount !== undefined ? (
          <span style={{ marginLeft: "auto", fontSize: 9, color: watchingColor, fontWeight: 700 }}>
            {watcherCount.toLocaleString()} watching
          </span>
        ) : null}
      </div>

      {/* ── Hero overlay sits above the renderer's own AudienceScene ──
           Skip when EOS suppressPresentation — ExperienceWidgetLayer owns HUD,
           and R3F PropLoader can hard-crash the page in constrained clients. */}
      {showHeroes && !suppressPresentation && (
        <div style={{ position: "relative" }}>
          <AvatarVenueAnchor venueSlug={venueSlug} venueIndex={venueIndex} />
        </div>
      )}

      {/* ── Universal Venue Renderer: AudienceScene + seats + chat + moderation +
           performer controls, all in one (Phase 3B convergence, 2026-06-20).
           CompetitionPresentationLayer sits on top as a pointer-events-none
           overlay for battle/cypher/challenge - it never owns Daily.co,
           participant lifecycle, or venue routing, all of which stay here. ── */}
      <div style={{ position: "relative" }}>
        <UniversalVenueRenderer
          roomId={roomId}
          mode={mode}
          venueIndex={venueIndex}
          instantEmptyStage={instantEmptyStage && !isPreview}
          isPreview={isPreview}
          forcedOccupancyRatio={isPreview ? (testOccupancyRatio ?? 0) : null}
          previewCapacity={testCapacity}
          viewMode={viewMode}
          spatialMap={spatialMap}
        />
        {competitionFormat && !suppressPresentation && (
          <CompetitionPresentationLayer
            format={competitionFormat}
            phase={LIVE_STATE_TO_PHASE[liveState]}
            roomId={roomId}
            roundLabel={roundLabel}
            remainingSeconds={remainingSeconds}
            leftParticipant={leftParticipant}
            rightParticipant={rightParticipant}
            crowdEnergy={crowdEnergy}
            winnerParticipantId={winnerParticipantId}
            personality={resolveExperiencePersonality({
              format: competitionFormat,
              eventType,
              roomKind:
                eventType === "cypher"
                  ? "cypher"
                  : eventType === "battle"
                    ? "battle"
                    : eventType === "challenge" || eventType === "song-challenge"
                      ? "challenge"
                      : undefined,
            })}
          />
        )}
        {/* Participation Law HUD — votingOpen from real rubric/phase signals only */}
        <TMIInteractiveVenueHud
          roomId={roomId}
          roomTitle={label}
          experienceType={
            eventType === "battle"
              ? "BATTLE"
              : eventType === "cypher"
                ? "CYPHER"
                : eventType === "challenge" || eventType === "song-challenge"
                  ? "CHALLENGE"
                  : eventType === "deal-or-feud"
                    ? "GAME_SHOW"
                    : "LIVE"
          }
          role={mode === "performer" ? "performer" : "fan"}
          votingOpen={showRubric}
          ownership={
            eventType === "monday-stage" || eventType === "deal-or-feud"
              ? "bot_operated"
              : "human_owned"
          }
          battleId={roomId.startsWith("battle-") ? roomId.replace(/^battle-/, "") : roomId}
          humanViewerCount={isPreview ? 0 : typeof watcherCount === "number" ? watcherCount : 0}
          isPreview={isPreview}
          testOccupancyLabel={isPreview ? testOccupancyLabel : null}
        />
      </div>

      {/* Fan rubric dock — shared wire for battle / challenge / monday-stage /
          deal-or-feud / song-challenge / cypher when a roster + window exist. */}
      {showRubric && (
        <FanRubricVotingPanel
          roomId={roomId}
          eventId={rubricEventId ?? roomId}
          performerIds={rubricIds}
          performerLabels={rubricLabels}
          voterId={rubricVoterId ?? guestVoterId}
          votingOpen={showRubric}
        />
      )}

      {/* Live performance beat dock — battle + cypher only (challenges use Content Picker). */}
      {(eventType === "battle" || eventType === "cypher") && (
        <CompetitionBeatDock
          roomId={roomId}
          lane={eventType === "cypher" ? "cypher" : "battle"}
          performerId={rubricVoterId ?? guestVoterId}
          performerIds={rubricIds.slice(0, 2)}
          dock="left"
          canControl={mode === "performer" || Boolean(leftParticipant || rightParticipant)}
        />
      )}
    </div>
    </RoomEnvironmentLayer>
  );
}

