"use client";

/**
 * Overlay on an existing Monitor A/B surface.
 * Reads PersonalMediaRouter.getAssignment() — never creates a second <video>.
 */

import { useMemo, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import {
  consumeCanonicalMonitorAssignment,
  defaultPersonalMediaRouter,
  type MonitorTarget,
  type PersonalMediaRouter,
} from "@/lib/personal-media";

const CYAN = "#00FFFF";

export type CanonicalMonitorAssignmentOverlayProps = {
  target: MonitorTarget;
  children: ReactNode;
  router?: PersonalMediaRouter;
};

export default function CanonicalMonitorAssignmentOverlay({
  target,
  children,
  router = defaultPersonalMediaRouter,
}: CanonicalMonitorAssignmentOverlayProps) {
  const subscribe = useMemo(() => (listener: () => void) => router.subscribe(listener), [router]);
  const snapshot = useSyncExternalStore(subscribe, () => router.getSnapshot(), () => router.getSnapshot());
  const consumed = consumeCanonicalMonitorAssignment(target, router);
  void snapshot;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 0 }} data-canonical-monitor={target.monitorId}>
      {children}
      {consumed.identity ? (
        <div style={badge} data-canonical-monitor-assignment={consumed.identity.participantId}>
          <span style={{ color: CYAN, fontWeight: 900, letterSpacing: "0.1em" }}>WATCHING</span>
          <span>{consumed.identity.displayName ?? consumed.identity.participantId}</span>
          <span style={{ opacity: 0.55 }}>
            {consumed.identity.videoTrackId ? "assigned identity" : "identity only · live track OPEN"}
          </span>
        </div>
      ) : null}
    </div>
  );
}

const badge: CSSProperties = {
  position: "absolute",
  left: 8,
  bottom: 8,
  zIndex: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "6px 8px",
  borderRadius: 8,
  border: `1px solid ${CYAN}55`,
  background: "rgba(4,4,16,0.86)",
  color: "#fff",
  fontSize: 8,
  fontWeight: 700,
  pointerEvents: "none",
  maxWidth: "90%",
};
