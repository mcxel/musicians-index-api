"use client";

/**
 * Performer Green Room Three-View Voltron binder.
 * LIVE STAGE | PRIVATE BACKSTAGE | LIVE AUDIENCE — one monitor or multi-monitor.
 * Mount only inside authorized Performer HUD / Green Room (RoleGate upstream).
 * Fans never receive private backstage mosaic assignment from this control.
 */

import { useCallback, useState } from "react";
import RoleGate from "@/components/auth/RoleGate";
import { applyPerformerGreenRoomThreeView } from "@/lib/monitors/VoltronAutomaticCompositionBridge";
import {
  FAN_MAY_SUBSCRIBE_PRIVATE_GREEN_ROOM,
  REQUIRES_FAN_ACCOUNT_TO_WATCH_PUBLIC,
  mayAccessPrivateGreenRoomSource,
} from "@/lib/live/PerformerGreenRoomThreeViewPolicy";
import { useAuth } from "@/lib/hooks/useAuth";

const CYAN = "#00FFFF";
const GOLD = "#FFD700";
const FUCHSIA = "#FF2DAA";

export type PerformerGreenRoomThreeViewControlsProps = {
  /** Room-scoped backstage membership (invite / queue / host guest). */
  authorizedBackstageMember: boolean;
  backstageVideoConsent?: boolean;
  onStatus?: (line: string) => void;
};

function Inner(props: PerformerGreenRoomThreeViewControlsProps) {
  const { role } = useAuth();
  const [mode, setMode] = useState<"ONE_MONITOR" | "MULTI_MONITOR">("ONE_MONITOR");
  const [lastReason, setLastReason] = useState<string | null>(null);
  const consent = props.backstageVideoConsent !== false;

  const gate = mayAccessPrivateGreenRoomSource({
    role,
    authorizedBackstageMember: props.authorizedBackstageMember,
    backstageVideoConsent: consent,
  });

  const apply = useCallback(
    (nextMode: "ONE_MONITOR" | "MULTI_MONITOR") => {
      setMode(nextMode);
      const result = applyPerformerGreenRoomThreeView({
        role,
        authorizedBackstageMember: props.authorizedBackstageMember,
        backstageVideoConsent: consent,
        mode: nextMode,
      });
      setLastReason(result.reason);
      props.onStatus?.(result.reason);
    },
    [role, props.authorizedBackstageMember, consent, props.onStatus],
  );

  return (
    <div
      data-testid="performer-green-room-three-view"
      data-private-backstage-allowed={gate.allowed ? "1" : "0"}
      data-fan-private-green-room={FAN_MAY_SUBSCRIBE_PRIVATE_GREEN_ROOM}
      data-requires-fan-to-watch={REQUIRES_FAN_ACCOUNT_TO_WATCH_PUBLIC}
      style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, color: CYAN }}>
        GREEN ROOM · THREE-VIEW VOLTRON
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>
        Stage + {gate.allowed ? "private backstage lineup + " : ""}audience — Performer account
        (no Fan switch). Fan private Green Room = {FAN_MAY_SUBSCRIBE_PRIVATE_GREEN_ROOM}.
      </div>
      {!gate.allowed ? (
        <div data-testid="backstage-gate-note" style={{ fontSize: 10, color: FUCHSIA }}>
          {gate.reason}
        </div>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button
          type="button"
          data-testid="green-room-one-monitor"
          onClick={() => apply("ONE_MONITOR")}
          style={chip(mode === "ONE_MONITOR", CYAN)}
        >
          <span style={{ fontSize: 9, fontWeight: 700 }}>One Monitor Voltron</span>
        </button>
        <button
          type="button"
          data-testid="green-room-multi-monitor"
          onClick={() => apply("MULTI_MONITOR")}
          style={chip(mode === "MULTI_MONITOR", GOLD)}
        >
          <span style={{ fontSize: 9, fontWeight: 700 }}>Multi-Monitor Route</span>
        </button>
      </div>
      {lastReason ? (
        <div data-testid="three-view-status" style={{ fontSize: 9, color: "rgba(255,255,255,0.65)" }}>
          {lastReason}
        </div>
      ) : null}
    </div>
  );
}

function chip(active: boolean, accent: string): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
    padding: "8px 10px",
    borderRadius: 10,
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
    background: active ? `${accent}18` : "rgba(0,0,0,0.45)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

export default function PerformerGreenRoomThreeViewControls(
  props: PerformerGreenRoomThreeViewControlsProps,
) {
  return (
    <RoleGate allow={["PERFORMER", "ARTIST", "BAND", "ADMIN", "STAFF"]}>
      <Inner {...props} />
    </RoleGate>
  );
}
