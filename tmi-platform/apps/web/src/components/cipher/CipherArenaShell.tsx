"use client";

/**
 * CipherArenaShell.tsx
 *
 * Top-level Cipher Presentation Runtime component.
 * Wires all cipher presentation layers together in the correct z-order
 * and drives them via CipherPresentationStateMachine.
 *
 * Z-order stack (bottom → top):
 *   z-0  Background architecture (arena walls, structural elements)
 *   z-1  Atmosphere (fog, ambient glow)
 *   z-2  Audience wall alcoves (existing AudienceReactionBar / face tiles)
 *   z-3  Floor base + CipherFloorUnderlay
 *   z-10 Performer / video surfaces (CipherPerformerPanel)
 *   z-20 Attached performer overlays (CompetitionPresentationLayer)
 *   z-30 World-space panels (CypherQueuePanel, CipherVoteBar)
 *   z-40 PiP panels (CipherPiPPanel)
 *   z-50 Critical screen overlays (BroadcastHeader, phase badge)
 *   z-60 Transitions + ceremony (CipherWinnerCeremony)
 *
 * Assembly rules:
 *   - Uses existing CypherQueuePanel, CypherRoundTimer, CypherStatusHUD
 *     from components/eos/widgets/ — no duplication.
 *   - Uses existing CompetitionPresentationLayer for HUD/VS/scoreboard overlays.
 *   - CipherPresentationStateMachine drives all state transitions.
 *   - Presentation bus: CipherPresentationStateMachine → tmi:system:event →
 *     CypherPresentationAdapter → DirectorRegistry (no Experience Director invent).
 *   - All data must come from real props — no invented values (Rule 20).
 *   - audienceCount must be PresenceKind.HUMAN only.
 *
 * Canonical mount: /rooms/cypher
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import CipherFloorUnderlay from "./CipherFloorUnderlay";
import CipherPerformerPanel from "./CipherPerformerPanel";
import CipherPiPPanel from "./CipherPiPPanel";
import CipherVoteBar from "./CipherVoteBar";
import CipherWinnerCeremony from "./CipherWinnerCeremony";

import CipherPresentationStateMachine from "@/lib/cipher/CipherPresentationStateMachine";
import type {
  CipherArenaConfig,
  CipherPresentationState,
  CipherPerformer,
  CipherVoteState,
  CipherPiPMode,
  CipherFloorMode,
} from "@/lib/cipher/CipherPresentationTypes";
import type { CipherWinnerStats } from "./CipherWinnerCeremony";
import {
  allowsVsUi,
  allowsWinnerUi,
  resolveExperiencePersonality,
} from "@/lib/live/ExperiencePersonality";

// Existing EOS widgets — consume them, don't duplicate
import CypherQueuePanel from "@/components/eos/widgets/CypherQueuePanel";
import CypherRoundTimer from "@/components/eos/widgets/CypherRoundTimer";
import CypherStatusHUD from "@/components/eos/widgets/CypherStatusHUD";

// Existing competition overlay layer
import CompetitionPresentationLayer from "@/components/competition/presentation/CompetitionPresentationLayer";

export interface CipherArenaShellProps {
  config: CipherArenaConfig;
  /** Initial presentation state — defaults to LOBBY_OPEN */
  initialState?: CipherPresentationState;
  /** Winner stats (from BattleWinnerEngine.settleWinner) — required for CEREMONY */
  winnerStats?: CipherWinnerStats;
  /** Beat intensity 0–1 from CypherBeatPlayer — drives floor animation */
  beatIntensity?: number;
  /** Waveform data per performer ID (from Web Audio AnalyserNode) */
  waveformData?: Record<string, Uint8Array>;
  /** Sponsor for winner ceremony lower-third */
  sponsor?: { name: string; logoUrl?: string };
  /**
   * Called when the viewer votes — server handles the rest.
   * The parent must update config.voteState.displayedPercentages from the server response.
   */
  onVote?: (performerId: string) => void;
  /**
   * Called when the ceremony "Continue →" button is clicked.
   * Parent should advance to NEXT_ROUND or EXIT.
   */
  onCeremonyContinue?: () => void;
  /**
   * External state override — allows a parent (e.g. CypherRuntimeEngine event)
   * to drive the state machine. When provided, the machine transitions automatically.
   */
  externalStateOverride?: {
    nextState: CipherPresentationState;
    activePerformerId?: string;
    winnerId?: string;
    roundLabel?: string;
  } | null;
}

// ─── Phase header badge ───────────────────────────────────────────────────────

function PhaseHeaderBadge({ label, state }: { label: string; state: CipherPresentationState }) {
  const isWarning = state === "TIME_WARNING" || state === "VOTING_LOCKING";
  const isWin = state === "WINNER_DECLARED" || state === "CEREMONY";

  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 14px",
        borderRadius: 4,
        background: isWin
          ? "rgba(255,215,0,0.15)"
          : isWarning
          ? "rgba(255,30,30,0.15)"
          : "rgba(0,255,255,0.08)",
        border: `1px solid ${isWin ? "rgba(255,215,0,0.5)" : isWarning ? "rgba(255,30,30,0.5)" : "rgba(0,255,255,0.3)"}`,
        color: isWin ? "#FFD700" : isWarning ? "#FF2020" : "#00FFFF",
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: 2,
        textTransform: "uppercase",
      }}
    >
      {isWin ? "👑" : isWarning ? "⚠" : "◈"} {label}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CipherArenaShell({
  config,
  initialState = "LOBBY_OPEN",
  winnerStats,
  beatIntensity = 0,
  waveformData = {},
  sponsor,
  onVote,
  onCeremonyContinue,
  externalStateOverride,
}: CipherArenaShellProps) {
  const { roomId, performers, activePerformerIndex, winnerId, voteState, mode } = config;

  // ─── State machine subscription ────────────────────────────────────────────
  const [machineEntry, setMachineEntry] = useState(
    () => CipherPresentationStateMachine.getCurrent(roomId) ?? CipherPresentationStateMachine.initialize(roomId)
  );

  useEffect(() => {
    // Boot the machine on mount if not already running
    if (!CipherPresentationStateMachine.getCurrent(roomId)) {
      CipherPresentationStateMachine.initialize(roomId);
    }
    const unsubscribe = CipherPresentationStateMachine.subscribe(roomId, (entry) => {
      setMachineEntry(entry);
    });
    return unsubscribe;
  }, [roomId]);

  // ─── External state override ────────────────────────────────────────────────
  useEffect(() => {
    if (!externalStateOverride) return;
    CipherPresentationStateMachine.transition(roomId, externalStateOverride.nextState, {
      activePerformerId: externalStateOverride.activePerformerId,
      winnerId: externalStateOverride.winnerId,
      roundLabel: externalStateOverride.roundLabel,
    });
  }, [externalStateOverride, roomId]);

  // ─── Derived layout state ───────────────────────────────────────────────────
  const presentationState = machineEntry?.state ?? initialState;
  const stateConfig = machineEntry?.config;
  const floorMode: CipherFloorMode = stateConfig?.floorMode ?? "IDLE";
  const showVoteBar = stateConfig?.showVoteBar ?? false;
  const showPiP = stateConfig?.showPiP ?? false;

  // Marcel lock: normal cypher = STATS_ONLY votes, no VS/winner; clash/faceoff = CYPHER_KING
  const personality = resolveExperiencePersonality({
    roomKind: "cypher",
    cipherMode: mode,
    cypherKing: mode === "clash" || mode === "faceoff",
  });
  const showVs = allowsVsUi(personality);
  const showWinner = allowsWinnerUi(personality);

  const activePerformer: CipherPerformer | undefined = performers[activePerformerIndex];
  const winnerPerformer =
    showWinner && winnerId ? performers.find((p) => p.id === winnerId) : undefined;
  const loserPerformer = winnerId
    ? performers.find((p) => p.id !== winnerId && performers.indexOf(p) <= 1)
    : undefined;

  // Split-clash / VS layout only when personality allows confrontation UI
  const isSplitClash =
    showVs &&
    (presentationState === "SPLIT_CLASH" ||
      presentationState === "VOTING_OPEN" ||
      presentationState === "VOTING_LOCKING");
  const secondaryPerformer: CipherPerformer | undefined = isSplitClash
    ? performers.find((p) => p.id !== activePerformer?.id)
    : undefined;

  // PiP mode
  const pipMode: CipherPiPMode =
    presentationState === "WINNER_DECLARED" || presentationState === "CEREMONY"
      ? "PREVIOUS_PERFORMER"
      : showPiP
      ? "NEXT_PERFORMER"
      : "OFF";

  const pipPerformer: CipherPerformer | undefined =
    pipMode === "PREVIOUS_PERFORMER"
      ? loserPerformer
      : performers[(activePerformerIndex + 1) % performers.length];

  // Vote progress (for floor sweep ring)
  const voteProgress =
    voteState?.closesAt && voteState?.opensAt
      ? (Date.now() - voteState.opensAt) / (voteState.closesAt - voteState.opensAt)
      : 0;

  // ─── CompetitionPresentationLayer props ─────────────────────────────────────
  const leftParticipant: import("@/components/competition/presentation/competitionPresentation.types").CompetitionParticipantView | undefined = activePerformer
    ? {
        id: activePerformer.id,
        displayName: activePerformer.displayName,
        score: activePerformer.liveScore ?? 0,
      }
    : undefined;
  const rightParticipant: import("@/components/competition/presentation/competitionPresentation.types").CompetitionParticipantView | undefined = secondaryPerformer
    ? {
        id: secondaryPerformer.id,
        displayName: secondaryPerformer.displayName,
        score: secondaryPerformer.liveScore ?? 0,
      }
    : undefined;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 480,
        background: "linear-gradient(180deg, #06070d 0%, #050510 60%, #06070d 100%)",
        overflow: "hidden",
        borderRadius: 10,
      }}
    >
      {/* ── z-0-1: Background atmosphere ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,255,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── z-3: Floor underlay ───────────────────────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3 }}>
        <CipherFloorUnderlay
          mode={floorMode}
          beatIntensity={beatIntensity}
          voteProgress={Math.min(1, Math.max(0, voteProgress))}
          leftColor={activePerformer?.accentColor ?? "#00FFFF"}
          rightColor={secondaryPerformer?.accentColor ?? "#FFD700"}
        />
      </div>

      {/* ── z-5: Phase header ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="wait">
          {stateConfig && (
            <PhaseHeaderBadge
              key={stateConfig.phaseLabel}
              label={stateConfig.phaseLabel}
              state={presentationState}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── z-10: Performer panels ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "60px 12px 80px",
          pointerEvents: "none",
        }}
      >
        {/* Left performer panel or primary solo */}
        <AnimatePresence mode="wait">
          {activePerformer && !winnerPerformer && (
            <motion.div
              key={`primary-${activePerformer.id}`}
              style={{
                flex: isSplitClash ? "0 0 42%" : "0 0 min(52%, 380px)",
                maxWidth: isSplitClash ? "42%" : 380,
              }}
            >
              <CipherPerformerPanel
                performer={activePerformer}
                variant={isSplitClash ? "PRIMARY" : "PRIMARY"}
                presentationState={presentationState}
                waveformData={waveformData[activePerformer.id]}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* VS badge — Cypher King / clash only (normal cypher: no confrontation) */}
        <AnimatePresence>
          {showVs && isSplitClash && secondaryPerformer && (
            <motion.div
              key="vs-badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              style={{
                flex: "0 0 auto",
                color: "#FF6600",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 2,
                textShadow: "0 0 20px #FF6600",
                textTransform: "uppercase",
              }}
            >
              VS
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right performer panel (split-clash only) */}
        <AnimatePresence mode="wait">
          {isSplitClash && secondaryPerformer && (
            <motion.div
              key={`secondary-${secondaryPerformer.id}`}
              style={{ flex: "0 0 42%", maxWidth: "42%" }}
            >
              <CipherPerformerPanel
                performer={secondaryPerformer}
                variant="SECONDARY"
                presentationState={presentationState}
                waveformData={waveformData[secondaryPerformer.id]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── z-20: Competition presentation overlays ───────────────────────── */}
      {stateConfig && (
        <CompetitionPresentationLayer
          format={mode === "faceoff" ? "BATTLE" : "CYPHER"}
          phase={isSplitClash ? "LIVE" : presentationState === "VERSE_ACTIVE" ? "LIVE" : "WAITING"}
          roomId={roomId}
          roundLabel={machineEntry?.roundLabel}
          remainingSeconds={undefined}
          leftParticipant={leftParticipant}
          rightParticipant={rightParticipant}
          crowdEnergy={0}
          winnerParticipantId={showWinner ? (winnerId ?? undefined) : undefined}
          personality={personality}
        />
      )}

      {/* ── z-25: Right rail — queue, timer, status (existing EOS widgets) ─ */}
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 10,
          width: 200,
          zIndex: 25,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "auto",
        }}
      >
        <CypherStatusHUD roomId={roomId} />
        <CypherRoundTimer />
        <CypherQueuePanel />
      </div>

      {/* ── z-30: Vote bar — keep for STATS_ONLY + competitive (never strip votes) ─ */}
      <AnimatePresence>
        {showVoteBar && voteState && activePerformer && (secondaryPerformer || !showVs) && (
          <div
            key="vote-bar-slot"
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 580,
              zIndex: 30,
              pointerEvents: "auto",
            }}
          >
            <CipherVoteBar
              voteState={voteState}
              leftPerformer={activePerformer}
              rightPerformer={secondaryPerformer ?? activePerformer}
              onVote={onVote}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── z-40: PiP panel ──────────────────────────────────────────────── */}
      {showPiP && pipPerformer && (
        <CipherPiPPanel
          mode={pipMode}
          performer={pipPerformer}
          anchor="BOTTOM_LEFT"
          voteBarVisible={showVoteBar}
        />
      )}

      {/* ── z-60: Winner ceremony — Cypher King only ──────────────────────── */}
      {showWinner && winnerPerformer && winnerStats && (
        <CipherWinnerCeremony
          endKind="CHAMPION"
          winner={winnerPerformer}
          loser={loserPerformer}
          stats={winnerStats}
          presentationState={presentationState}
          sponsor={sponsor}
          onClose={onCeremonyContinue}
        />
      )}

      {/* ── Audience count (top left) ─────────────────────────────────────── */}
      {config.audienceCount !== undefined && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: "rgba(255,255,255,0.55)",
            fontSize: 10,
            fontWeight: 700,
            pointerEvents: "none",
          }}
        >
          <span style={{ color: "#FF2DAA" }}>●</span>
          {config.audienceCount.toLocaleString()} watching
        </div>
      )}
    </div>
  );
}
