"use client";

/**
 * Spectate / Jump Out / Jump Back In / Leave Queue / Rejoin Queue / Return to Stage.
 * Final rule: Leaving the room is not leaving the line. Leaving the queue is.
 */

import { useCallback, useEffect, useState } from "react";
import {
  executeFreeRoamAction,
  membershipFromPresence,
  readFreeRoamPresence,
  subscribeChallengerCallUp,
  type FreeRoamPresenceSnapshot,
} from "@/lib/competition/challengerFreeRoamClient";
import { durableCameraConsent } from "@/lib/live/DurableGreenRoomPresentationBridge";
import { emitEntranceCue } from "@/lib/live/EntranceCueAuthority";
import {
  FORFEITED_POSITION_NEVER_RESTORED,
  LEAVE_QUEUE_REQUIRES_SERVER_CONFIRM,
  SPECTATE_GRANTS_STAGE_PUBLISH,
  SPECTATE_WITHDRAWS_FROM_QUEUE,
  mayJumpBackIn,
  mayRejoinAfterFreeRoam,
  type FreeRoamAction,
} from "@/lib/competition/PerformerSpectatorFreeRoamPolicy";
import type { EliminationKind } from "@/lib/competition/InstantReEntryBackOfQueuePolicy";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";

function chip(active: boolean, accent: string): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 64,
    padding: "8px 6px",
    borderRadius: 10,
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
    background: active ? `${accent}18` : "rgba(0,0,0,0.45)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

export type PerformerFreeRoamControlsProps = {
  roomId: string;
  liveSessionId: string;
  performerId: string;
  /** Only pass when Claude durable API returned this index. */
  serverQueuePosition?: number | null;
  eliminationKind?: EliminationKind | null;
  onStatus?: (line: string) => void;
};

export default function PerformerFreeRoamControls(props: PerformerFreeRoamControlsProps) {
  const [presence, setPresence] = useState<FreeRoamPresenceSnapshot | null>(null);
  const [callUp, setCallUp] = useState<{ position: number; entranceWindowMs: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraConsent, setCameraConsent] = useState(false);
  const [consentBusy, setConsentBusy] = useState(false);
  const [migrationNotApplied, setMigrationNotApplied] = useState(false);

  const refresh = useCallback(() => {
    setPresence(readFreeRoamPresence(props.roomId, props.performerId));
  }, [props.roomId, props.performerId]);

  useEffect(() => {
    refresh();
    const onEvt = () => refresh();
    window.addEventListener("tmi:challenger-free-roam", onEvt);
    return () => window.removeEventListener("tmi:challenger-free-roam", onEvt);
  }, [refresh]);

  useEffect(() => {
    return subscribeChallengerCallUp((d) => {
      if (d.roomId !== props.roomId || d.performerId !== props.performerId) return;
      // Double-ding only from confirmed server call-up (never speculative).
      emitEntranceCue({
        eventId: `callup:${props.roomId}:${props.performerId}:${d.position}:${d.entranceWindowMs}`,
        kind: "COMPETITION_CHALLENGER",
      });
      setCallUp({ position: d.position, entranceWindowMs: d.entranceWindowMs });
      setPresence((p) =>
        p
          ? {
              ...p,
              mode: "CALLED_WHILE_AWAY",
              preservedPosition: d.position,
              serverConfirmed: true,
              forfeited: false,
            }
          : p,
      );
      props.onStatus?.(
        `You're up next (#${d.position + 1}) — ${Math.round(d.entranceWindowMs / 1000)}s entrance window`,
      );
    });
  }, [props.roomId, props.performerId, props.onStatus]);

  const persistCameraConsent = async (next: boolean) => {
    if (consentBusy) return;
    setConsentBusy(true);
    try {
      const r = await durableCameraConsent({
        roomId: props.roomId,
        cameraConsent: next,
      });
      if (r.migrationNotApplied || r.error === "MIGRATION_NOT_APPLIED") {
        setMigrationNotApplied(true);
        setCameraConsent(false);
        props.onStatus?.("MIGRATION NOT APPLIED — camera consent not durable");
        return;
      }
      if (!r.ok) {
        props.onStatus?.(`Camera consent not confirmed: ${r.error ?? "unavailable"}`);
        return;
      }
      setMigrationNotApplied(false);
      setCameraConsent(next);
      props.onStatus?.(
        next
          ? "Backstage camera consent saved on server"
          : "Backstage camera consent revoked — publish stopped",
      );
    } finally {
      setConsentBusy(false);
    }
  };

  const run = async (action: FreeRoamAction) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await executeFreeRoamAction({
        action,
        roomId: props.roomId,
        performerId: props.performerId,
        liveSessionId: props.liveSessionId,
        knownPositionHint: props.serverQueuePosition ?? null,
      });
      if (result.message.includes("MIGRATION_NOT_APPLIED") || result.message.includes("Migration")) {
        setMigrationNotApplied(true);
      }
      setPresence(result.presence);
      props.onStatus?.(result.message);
      if (
        result.ok &&
        result.navigateTo &&
        (action === "JUMP_OUT" ||
          action === "SPECTATE_OTHER" ||
          action === "JUMP_BACK_IN" ||
          action === "RETURN_TO_STAGE")
      ) {
        window.location.assign(result.navigateTo);
      }
    } finally {
      setBusy(false);
    }
  };

  const membership = membershipFromPresence(presence);
  const withdrawn = presence?.mode === "WITHDRAWN" || presence?.forfeited === true;
  const leavePending = presence?.mode === "LEAVE_PENDING";
  const away =
    presence?.mode === "BROWSING" ||
    presence?.mode === "SPECTATING_OTHER" ||
    presence?.mode === "CALLED_WHILE_AWAY";
  const jumpBackGate = mayJumpBackIn(membership);
  const canJumpBack =
    jumpBackGate.allowed &&
    (away || presence?.mode === "SPECTATING_CURRENT" || presence?.mode === "SPECTATING_OTHER");

  const canOfferRejoin = Boolean(withdrawn || props.eliminationKind);
  const rejoinElig = canOfferRejoin
    ? mayRejoinAfterFreeRoam({
        performerId: props.performerId,
        roomId: props.roomId,
        trigger: props.eliminationKind
          ? { kind: "ELIMINATION", eliminationKind: props.eliminationKind }
          : { kind: "WITHDRAWAL" },
        alreadyHasActiveQueueEntry: false,
      })
    : null;

  const posLabel =
    typeof props.serverQueuePosition === "number"
      ? `#${props.serverQueuePosition + 1} (server)`
      : presence?.serverConfirmed && typeof presence.preservedPosition === "number"
        ? `#${presence.preservedPosition + 1} (server)`
        : withdrawn
          ? "forfeited — rejoin at back"
          : leavePending
            ? "leave pending server confirm"
            : "position pending server";

  return (
    <div
      data-testid="performer-free-roam-controls"
      style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, color: CYAN }}>
        SPECTATE / FREE-ROAM · {posLabel}
      </div>
      {migrationNotApplied ? (
        <div
          data-testid="queue-migration-not-applied"
          style={{ fontSize: 10, fontWeight: 800, color: FUCHSIA }}
        >
          MIGRATION NOT APPLIED — positions stay pending until isolated DB cert
        </div>
      ) : null}
      <label
        data-testid="backstage-camera-consent"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 10,
          color: "#fff",
          padding: "6px 8px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.35)",
        }}
      >
        <input
          type="checkbox"
          checked={cameraConsent}
          disabled={consentBusy || withdrawn}
          onChange={(e) => void persistCameraConsent(e.target.checked)}
        />
        Backstage camera consent (server) — required before Green Room video publish
      </label>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>
        Leaving the room ≠ leaving the line. Leave Queue forfeits the seat.
        {FORFEITED_POSITION_NEVER_RESTORED ? " Forfeit never restores." : ""}
        {LEAVE_QUEUE_REQUIRES_SERVER_CONFIRM ? " Leave needs server confirm." : ""}
        {" · "}
        Mode: {presence?.mode ?? "GREEN_ROOM"} · membership: {membership}
        {presence?.durablePending ? " · durable pending Claude" : ""}
        {" · "}
        spectate withdraws={SPECTATE_WITHDRAWS_FROM_QUEUE} · stage publish=
        {SPECTATE_GRANTS_STAGE_PUBLISH}
      </div>

      {callUp && !withdrawn ? (
        <div
          data-testid="challenger-call-up-banner"
          style={{
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${GOLD}`,
            background: `${GOLD}22`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: GOLD }}>
            YOU&apos;RE UP — position #{callUp.position + 1}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button
              type="button"
              data-testid="return-to-stage"
              disabled={busy}
              onClick={() => void run("RETURN_TO_STAGE")}
              style={chip(true, GOLD)}
            >
              <span style={{ fontSize: 9, fontWeight: 700 }}>Return to Stage</span>
            </button>
            <button
              type="button"
              data-testid="pass-not-ready"
              disabled={busy}
              onClick={() => void run("PASS")}
              style={chip(presence?.mode === "PASSED_NOT_READY", FUCHSIA)}
              title="Stay enrolled — move to back of the line"
            >
              <span style={{ fontSize: 9, fontWeight: 700 }}>PASS / Not Ready</span>
            </button>
          </div>
        </div>
      ) : null}

      {presence?.mode === "PASSED_NOT_READY" || presence?.mode === "READY_AGAIN" ? (
        <div
          data-testid="pass-ready-banner"
          style={{
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${CYAN}`,
            background: `${CYAN}14`,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: CYAN, flex: 1 }}>
            {presence.mode === "READY_AGAIN"
              ? "READY AGAIN — waiting for next fair call-up"
              : "PASSED — at back of line; press I'M READY when available"}
          </span>
          <button
            type="button"
            data-testid="im-ready"
            disabled={busy || presence.mode === "READY_AGAIN"}
            onClick={() => void run("IM_READY")}
            style={chip(presence.mode === "READY_AGAIN", GOLD)}
          >
            <span style={{ fontSize: 9, fontWeight: 700 }}>I&apos;m Ready</span>
          </button>
        </div>
      ) : null}

      {!callUp && !withdrawn && !leavePending ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button
            type="button"
            data-testid="pass-not-ready-anytime"
            disabled={busy}
            onClick={() => void run("PASS")}
            style={chip(presence?.mode === "PASSED_NOT_READY", FUCHSIA)}
            title="Yield current / next call-up — move to queue tail"
          >
            <span style={{ fontSize: 16 }}>⏭️</span>
            <span style={{ fontSize: 9, fontWeight: 700 }}>PASS / Not Ready</span>
          </button>
          <button
            type="button"
            data-testid="im-ready-anytime"
            disabled={busy || presence?.mode !== "PASSED_NOT_READY"}
            onClick={() => void run("IM_READY")}
            style={chip(presence?.mode === "READY_AGAIN", GOLD)}
          >
            <span style={{ fontSize: 16 }}>✅</span>
            <span style={{ fontSize: 9, fontWeight: 700 }}>I&apos;m Ready</span>
          </button>
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button
          type="button"
          data-testid="free-roam-spectate-current"
          disabled={busy || withdrawn}
          onClick={() => void run("SPECTATE_CURRENT")}
          style={chip(presence?.mode === "SPECTATING_CURRENT", CYAN)}
        >
          <span style={{ fontSize: 16 }}>👀</span>
          <span style={{ fontSize: 9, fontWeight: 700 }}>Spectate</span>
        </button>
        <button
          type="button"
          data-testid="free-roam-spectate-other"
          disabled={busy || withdrawn}
          onClick={() => void run("SPECTATE_OTHER")}
          style={chip(presence?.mode === "SPECTATING_OTHER", CYAN)}
        >
          <span style={{ fontSize: 16 }}>📺</span>
          <span style={{ fontSize: 9, fontWeight: 700 }}>Other Shows</span>
        </button>
        <button
          type="button"
          data-testid="free-roam-jump-out"
          disabled={busy || away || withdrawn}
          onClick={() => void run("JUMP_OUT")}
          style={chip(presence?.mode === "BROWSING", GOLD)}
        >
          <span style={{ fontSize: 16 }}>🚪</span>
          <span style={{ fontSize: 9, fontWeight: 700 }}>Jump Out</span>
        </button>
        <button
          type="button"
          data-testid="free-roam-jump-back-in"
          disabled={busy || !canJumpBack}
          onClick={() => void run("JUMP_BACK_IN")}
          style={chip(false, CYAN)}
          title={jumpBackGate.reason}
        >
          <span style={{ fontSize: 16 }}>↩️</span>
          <span style={{ fontSize: 9, fontWeight: 700 }}>Jump Back In</span>
        </button>
        <button
          type="button"
          data-testid="free-roam-leave-queue"
          disabled={busy || withdrawn}
          onClick={() => void run("LEAVE_QUEUE")}
          style={chip(withdrawn || leavePending, FUCHSIA)}
        >
          <span style={{ fontSize: 16 }}>✕</span>
          <span style={{ fontSize: 9, fontWeight: 700 }}>
            {leavePending ? "Leave Pending…" : "Leave Queue"}
          </span>
        </button>
        <button
          type="button"
          data-testid="free-roam-rejoin-queue"
          disabled={busy || !canOfferRejoin || !(rejoinElig?.allowed ?? false)}
          onClick={() => void run("REJOIN_QUEUE")}
          style={chip(false, GOLD)}
        >
          <span style={{ fontSize: 16 }}>🔁</span>
          <span style={{ fontSize: 9, fontWeight: 700 }}>Rejoin (Back)</span>
        </button>
      </div>
      {withdrawn ? (
        <div data-testid="queue-forfeited-notice" style={{ fontSize: 10, color: FUCHSIA }}>
          You left the line. Jump Back In cannot restore your old seat — Rejoin joins at the current
          back.
        </div>
      ) : null}
      {rejoinElig && !rejoinElig.allowed && canOfferRejoin ? (
        <div data-testid="rejoin-blocked" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
          Rejoin unavailable: {rejoinElig.reason}
        </div>
      ) : null}
    </div>
  );
}
