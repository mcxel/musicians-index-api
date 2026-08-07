"use client";

/**
 * Observatory Gauntlet Control — counts + pause/extend/advance with audit log.
 * Scaffold: real engine calls when room/run exist; honest empty when disabled.
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { isEnabled } from "@/config/feature.flags";
import {
  ensureCanonicalGauntletRoom,
  getGauntletRoom,
  setGauntletPaused,
  type GauntletRoomState,
} from "@/lib/gauntlet/GauntletRoomRuntime";
import {
  extendPerformanceClock,
  getGauntletRun,
  type GauntletRunState,
} from "@/lib/gauntlet/GauntletRunRuntime";
import {
  getGauntletAuditLog,
  getGauntletControlCounts,
  logGauntletControl,
  type GauntletAuditEntry,
} from "@/lib/gauntlet/GauntletControlAudit";
const ACTOR = "observatory-ops";

export default function GauntletControlPanel() {
  const [room, setRoom] = useState<GauntletRoomState | null>(null);
  const [run, setRun] = useState<GauntletRunState | null>(null);
  const [audit, setAudit] = useState<GauntletAuditEntry[]>([]);
  const [counts, setCounts] = useState({ pause: 0, extend: 0, advance: 0 });

  const refresh = useCallback(() => {
    if (!isEnabled("GAUNTLET_ENABLED")) {
      setRoom(null);
      setRun(null);
      setAudit([]);
      return;
    }
    const r = ensureCanonicalGauntletRoom();
    setRoom(r ? { ...r } : null);
    if (r?.currentRunId) {
      const gr = getGauntletRun(r.currentRunId);
      setRun(gr ? { ...gr } : null);
    } else {
      setRun(null);
    }
    if (r) {
      setAudit(getGauntletAuditLog(r.roomId));
      setCounts(getGauntletControlCounts(r.roomId));
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  if (!isEnabled("GAUNTLET_ENABLED")) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 10,
          border: "1px solid rgba(107,114,128,0.45)",
          background: "rgba(8,8,12,0.98)",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "#9CA3AF" }}>
          GAUNTLET CONTROL
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 8, lineHeight: 1.45 }}>
          GAUNTLET_ENABLED is off. Flip feature flags to operate the persistent Musical Gauntlet destination.
        </div>
        <Link href="/battles/lobby-wall" style={{ display: "inline-block", marginTop: 10, color: "#00FFFF", fontSize: 11 }}>
          Battles Lobby Wall →
        </Link>
      </div>
    );
  }

  const roomId = room?.roomId ?? "gauntlet-main";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%", overflow: "auto", padding: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
            GAUNTLET CONTROL
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            Room {roomId} · {room?.paused ? "PAUSED" : "ACTIVE"}
          </div>
        </div>
        <Link
          href={`/rooms/battle/gauntlet/${encodeURIComponent(roomId)}`}
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#00FFFF",
            textDecoration: "none",
            border: "1px solid rgba(0,255,255,0.35)",
            borderRadius: 999,
            padding: "4px 10px",
          }}
        >
          Open room →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { label: "Spectators", value: room?.spectatorCount ?? 0 },
          { label: "Waiting", value: room?.waitingCount ?? 0 },
          { label: "Active", value: room?.activeCount ?? 0 },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              padding: 10,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>
              {c.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
        Ops counts — Pause/Resume: {counts.pause} · Extend: {counts.extend} · Advance: {counts.advance}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            setGauntletPaused(roomId, !room?.paused);
            logGauntletControl({
              roomId,
              runId: run?.runId,
              action: room?.paused ? "RESUME" : "PAUSE",
              actorId: ACTOR,
            });
            refresh();
          }}
          style={btnStyle}
        >
          {room?.paused ? "RESUME" : "PAUSE"}
        </button>
        <button
          type="button"
          disabled={!run}
          onClick={() => {
            if (!run) return;
            extendPerformanceClock(run.runId, 15);
            logGauntletControl({
              roomId,
              runId: run.runId,
              action: "EXTEND_CLOCK",
              actorId: ACTOR,
              detail: "+15s",
            });
            refresh();
          }}
          style={{ ...btnStyle, opacity: run ? 1 : 0.4 }}
        >
          EXTEND +15s
        </button>
        <button
          type="button"
          disabled={!run}
          onClick={() => {
            if (!run) return;
            logGauntletControl({
              roomId,
              runId: run.runId,
              action: "ADVANCE_PHASE",
              actorId: ACTOR,
              detail: `from ${run.phase}`,
            });
            // Advance is audited; phase machine advance is operator-intent scaffold.
            refresh();
          }}
          style={{ ...btnStyle, opacity: run ? 1 : 0.4 }}
        >
          ADVANCE
        </button>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
          AUDIT LOG
        </div>
        {audit.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>No control actions yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 4, maxHeight: 160, overflow: "auto" }}>
            {audit.slice(0, 20).map((e) => (
              <div
                key={e.id}
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.65)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  padding: "4px 0",
                }}
              >
                {new Date(e.at).toLocaleTimeString()} · {e.action}
                {e.detail ? ` · ${e.detail}` : ""} · {e.actorId}
              </div>
            ))}
          </div>
        )}
      </div>

      {!getGauntletRoom(roomId)?.currentRunId && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          No active run — room remains open (run end ≠ room end).
        </div>
      )}
    </div>
  );
}

const btnStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,215,0,0.4)",
  background: "rgba(255,215,0,0.12)",
  color: "#FFD700",
  fontWeight: 900,
  fontSize: 11,
  letterSpacing: "0.08em",
  cursor: "pointer",
};
