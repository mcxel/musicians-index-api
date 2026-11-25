"use client";

/**
 * Adaptive Performance Director HUD — FINISHED / END TURN + recommendation status.
 * Mount inside Performer Green Room / competition HUD only.
 * Does not create a second timer; displays advisory + durable-pending state.
 */

import { useCallback, useEffect, useState } from "react";
import RoleGate from "@/components/auth/RoleGate";
import {
  ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED,
  NEW_TIMING_ENGINE,
  SILENCE_ALONE_MEANS_FINISHED,
} from "@/lib/competition/AdaptivePerformanceDirectorPolicy";
import {
  readDirectorHudSnapshot,
  requestCheckpointRecommendation,
  requestPerformerFinished,
  type DirectorHudSnapshot,
} from "@/lib/competition/adaptivePerformanceDirectorClient";
import { ANTI_STALL_POLICY } from "@/lib/competition/CompetitionAntiStallTakeoverPolicy";
import {
  CYPHER_TURN_DURATION_DEFAULT,
  CYPHER_TURN_DURATION_OPTIONS,
  normalizeCypherTurnDuration,
  resolveCypherTurnDuration,
  writeLocalCypherTurnDurationDraft,
  type CypherTurnDurationSeconds,
} from "@/lib/competition/CypherTurnDurationPolicy";
import { durableSetCypherTurn } from "@/lib/live/DurableGreenRoomPresentationBridge";

const CYAN = "#00FFFF";
const GOLD = "#FFD700";
const FUCHSIA = "#FF2DAA";

export type AdaptivePerformanceDirectorControlsProps = {
  roomId: string;
  liveSessionId: string;
  performerId: string;
  experienceKind?: string | null;
  /** From authoritative room clock — HUD does not invent remaining time. */
  roundRemainingSeconds?: number | null;
  nextPerformerReady?: boolean;
  nextWaitMs?: number;
  /** Authoritative cypher turn seconds from durable STATE (null = non-Cypher / unavailable). */
  serverCypherTurnSeconds?: number | null;
  /** Claude QueueSelfView: SAVED | DEFAULT | null — UI must prefer this over local draft. */
  serverCypherTurnSource?: "SAVED" | "DEFAULT" | null;
  isHost?: boolean;
  onStatus?: (line: string) => void;
};

function Inner(props: AdaptivePerformanceDirectorControlsProps) {
  const [snap, setSnap] = useState<DirectorHudSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [cypherSeconds, setCypherSeconds] = useState<CypherTurnDurationSeconds>(() =>
    resolveCypherTurnDuration({
      serverSeconds: props.serverCypherTurnSeconds,
      localDraftSeconds: null,
    }),
  );
  const isCypher = String(props.experienceKind ?? "").toUpperCase().includes("CYPHER");

  const refresh = useCallback(() => {
    setSnap(readDirectorHudSnapshot(props.roomId));
  }, [props.roomId]);


  useEffect(() => {
    if (props.serverCypherTurnSeconds == null) return;
    setCypherSeconds(normalizeCypherTurnDuration(props.serverCypherTurnSeconds));
  }, [props.serverCypherTurnSeconds]);

  useEffect(() => {
    refresh();
    const onEvt = () => refresh();
    window.addEventListener("tmi:adaptive-director", onEvt);
    return () => window.removeEventListener("tmi:adaptive-director", onEvt);
  }, [refresh]);

  useEffect(() => {
    const remaining = props.roundRemainingSeconds;
    if (typeof remaining !== "number" || remaining > 8 || remaining < 0) return;
    let cancelled = false;
    void (async () => {
      const next = await requestCheckpointRecommendation({
        roomId: props.roomId,
        liveSessionId: props.liveSessionId,
        experienceKind: props.experienceKind,
        roundRemainingSeconds: remaining,
        extensionsGranted: readDirectorHudSnapshot(props.roomId)?.extensionsGranted ?? 0,
        continuity: "ACTIVE",
        nextPerformerReady: props.nextPerformerReady ?? true,
        nextWaitMs: props.nextWaitMs ?? 0,
        atSafeMusicalBoundary: false,
      });
      if (!cancelled) {
        setSnap(next);
        props.onStatus?.(next.lastMessage);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Checkpoint only when remaining crosses near-end band from parent clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.roundRemainingSeconds, props.roomId, props.liveSessionId]);


  const setCypherTurn = async (seconds: CypherTurnDurationSeconds) => {
    if (busy || !props.isHost) return;
    setBusy(true);
    try {
      writeLocalCypherTurnDurationDraft(props.roomId, seconds);
      const res = await durableSetCypherTurn({
        roomId: props.roomId,
        cypherTurnSeconds: seconds,
      });
      if (res.migrationNotApplied) {
        props.onStatus?.("MIGRATION NOT APPLIED — cypher turn not persisted");
        setCypherSeconds(seconds);
        return;
      }
      if (!res.ok) {
        props.onStatus?.(`Cypher turn failed: ${res.error ?? "error"}`);
        return;
      }
      const next = normalizeCypherTurnDuration(
        res.cypherTurnSeconds ?? seconds ?? CYPHER_TURN_DURATION_DEFAULT,
      );
      setCypherSeconds(next);
      const src = res.cypherTurnSource ?? "SAVED";
      props.onStatus?.(
        `Cypher turn ${next}s · ${src} (server STATE authoritative)`,
      );
    } finally {
      setBusy(false);
    }
  };

  const endTurn = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await requestPerformerFinished({
        roomId: props.roomId,
        liveSessionId: props.liveSessionId,
        performerId: props.performerId,
        experienceKind: props.experienceKind,
      });
      setSnap(next);
      props.onStatus?.(next.lastMessage);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:performer-end-turn", {
            detail: {
              roomId: props.roomId,
              performerId: props.performerId,
              serverConfirmed: next.serverConfirmed,
            },
          }),
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      data-testid="adaptive-performance-director"
      data-enforcement={ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED ? "1" : "0"}
      data-anti-stall={ANTI_STALL_POLICY.enforcementActivated ? "1" : "0"}
      data-new-timing-engine={NEW_TIMING_ENGINE ? "1" : "0"}
      style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, color: GOLD }}>
        ADAPTIVE DIRECTOR ·{" "}
        {ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED ? "LIVE" : "ADVISORY"}
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>
        Baseline is a checkpoint — finish when you&apos;re done. Silence ≠ cut (
        {SILENCE_ALONE_MEANS_FINISHED}). Anti-stall enforcement{" "}
        {ANTI_STALL_POLICY.enforcementActivated ? "ON" : "OFF"}. No 2nd timer (
        {NEW_TIMING_ENGINE ? "ERR" : "ok"}).
      </div>

      {snap?.migrationNotApplied ? (
        <div
          data-testid="director-migration-not-applied"
          style={{
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${FUCHSIA}`,
            background: `${FUCHSIA}18`,
            fontSize: 10,
            fontWeight: 800,
            color: FUCHSIA,
          }}
        >
          MIGRATION NOT APPLIED — director / queue durable tables unavailable
        </div>
      ) : null}

      {snap ? (
        <div
          data-testid="director-decision-banner"
          style={{
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${CYAN}66`,
            background: `${CYAN}14`,
            fontSize: 10,
            color: "#fff",
          }}
        >
          <div style={{ fontWeight: 800, color: CYAN }}>
            Decision: {snap.decision}
            {snap.serverConfirmed ? " · server" : snap.durablePending ? " · pending Claude" : ""}
          </div>
          <div style={{ marginTop: 4, color: "rgba(255,255,255,0.7)" }}>{snap.lastMessage}</div>
          {typeof props.roundRemainingSeconds === "number" ? (
            <div style={{ marginTop: 4, color: GOLD }}>
              Clock remaining: {Math.max(0, Math.round(props.roundRemainingSeconds))}s · extensions:{" "}
              {snap.extensionsGranted}
              {" · stillPerforming payload on CHECKPOINT"}
            </div>
          ) : null}
        </div>
      ) : null}


      {isCypher ? (
        <div
          data-testid="cypher-turn-duration"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${GOLD}55`,
            background: `${GOLD}12`,
          }}
        >
          <div
            style={{ fontSize: 10, fontWeight: 800, color: GOLD }}
            data-cypher-turn-source={
              props.serverCypherTurnSource ??
              (props.serverCypherTurnSeconds != null ? "SERVER" : "DRAFT")
            }
          >
            CYPHER TURN · {cypherSeconds}s
            {props.serverCypherTurnSeconds != null
              ? ` · server ${props.serverCypherTurnSource ?? "STATE"}`
              : " · draft fallback only"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CYPHER_TURN_DURATION_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                data-testid={`cypher-turn-${s}`}
                disabled={busy || !props.isHost}
                onClick={() => void setCypherTurn(s)}
                style={{
                  minWidth: 56,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border:
                    cypherSeconds === s ? `1px solid ${CYAN}` : "1px solid rgba(255,255,255,0.15)",
                  background: cypherSeconds === s ? `${CYAN}22` : "rgba(0,0,0,0.4)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: props.isHost ? "pointer" : "not-allowed",
                  opacity: props.isHost ? 1 : 0.55,
                }}
              >
                {s}s
              </button>
            ))}
          </div>
          {!props.isHost ? (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
              Host sets 30 / 45 / 60 — default 60. Refresh uses server value.
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button
          type="button"
          data-testid="performer-finished-end-turn"
          disabled={busy}
          onClick={() => void endTurn()}
          style={{
            minWidth: 120,
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${FUCHSIA}`,
            background: `${FUCHSIA}22`,
            color: "#fff",
            fontWeight: 800,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          {busy ? "Ending…" : "FINISHED / End Turn"}
        </button>
      </div>
    </div>
  );
}

export default function AdaptivePerformanceDirectorControls(
  props: AdaptivePerformanceDirectorControlsProps,
) {
  return (
    <RoleGate allow={["PERFORMER", "ARTIST", "BAND", "ADMIN", "STAFF"]}>
      <Inner {...props} />
    </RoleGate>
  );
}
