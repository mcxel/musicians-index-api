"use client";

/**
 * MY VIEW — mandatory personal media recovery drawer.
 * Client-local lists only. Restore actions go through PersonalMediaCommandBus.
 * Honest empty states. Does not certify live lounge / WebRTC.
 */

import { useMemo, useSyncExternalStore, type CSSProperties } from "react";
import {
  defaultPersonalMediaCommandBus,
  defaultPersonalMediaRouter,
  labelMonitorTarget,
  type PersonalMediaCommandBus,
  type PersonalMediaRouter,
  type PersonalMediaViewSnapshot,
} from "@/lib/personal-media";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";

export type MyViewDrawerProps = {
  open: boolean;
  onClose: () => void;
  router?: PersonalMediaRouter;
  commandBus?: PersonalMediaCommandBus;
};

const emptySnapshot: PersonalMediaViewSnapshot = {
  identities: [],
  assignments: [],
  pinnedAudio: [],
  mutedPeople: [],
  hiddenVideo: [],
  removedPeople: [],
  interactionTargetId: null,
};

export default function MyViewDrawer({
  open,
  onClose,
  router = defaultPersonalMediaRouter,
  commandBus = defaultPersonalMediaCommandBus,
}: MyViewDrawerProps) {
  const subscribe = useMemo(() => (listener: () => void) => router.subscribe(listener), [router]);
  const snapshot = useSyncExternalStore(subscribe, () => router.getSnapshot(), () => emptySnapshot);

  if (!open) return null;

  return (
    <aside
      role="dialog"
      aria-label="MY VIEW"
      style={shell}
    >
      <header style={header}>
        <div>
          <div style={{ color: GOLD, fontSize: 10, fontWeight: 900, letterSpacing: "0.14em" }}>MY VIEW</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 4 }}>
            Local to this device. Does not kick, ban, or reconnect live media.
          </div>
        </div>
        <button type="button" onClick={onClose} style={closeBtn}>
          CLOSE
        </button>
      </header>

      <section style={section}>
        <h3 style={h3}>Monitor Assignments</h3>
        {snapshot.assignments.length === 0 ? (
          <p style={empty}>No monitor assignments yet.</p>
        ) : (
          snapshot.assignments.map((row) => (
            <div key={`${row.target.monitorId}:${row.target.slotId}`} style={rowStyle}>
              <span>
                {labelMonitorTarget(row.target)} — {row.identity.displayName ?? row.identity.participantId}
              </span>
              <button
                type="button"
                onClick={() => commandBus.execute("MEDIA.REMOVE_FROM_MONITOR", { target: row.target })}
                style={ghostBtn}
              >
                REMOVE
              </button>
            </div>
          ))
        )}
      </section>

      <section style={section}>
        <h3 style={h3}>Pinned Audio</h3>
        {snapshot.pinnedAudio.length === 0 ? (
          <p style={empty}>No pinned audio.</p>
        ) : (
          snapshot.pinnedAudio.map((identity) => (
            <div key={identity.participantId} style={rowStyle}>
              <span>{identity.displayName ?? identity.participantId}</span>
              <button
                type="button"
                onClick={() => commandBus.execute("MEDIA.UNPIN_AUDIO", { participantId: identity.participantId })}
                style={ghostBtn}
              >
                UNPIN
              </button>
            </div>
          ))
        )}
      </section>

      <section style={section}>
        <h3 style={h3}>Muted People</h3>
        {snapshot.mutedPeople.length === 0 ? (
          <p style={empty}>No one muted for you.</p>
        ) : (
          snapshot.mutedPeople.map((identity) => (
            <div key={identity.participantId} style={rowStyle}>
              <span>{identity.displayName ?? identity.participantId}</span>
              <button
                type="button"
                onClick={() => commandBus.execute("MEDIA.UNMUTE_LOCAL", { participantId: identity.participantId })}
                style={ghostBtn}
              >
                UNMUTE FOR ME
              </button>
            </div>
          ))
        )}
      </section>

      <section style={section}>
        <h3 style={h3}>Hidden Video</h3>
        {snapshot.hiddenVideo.length === 0 ? (
          <p style={empty}>No hidden video.</p>
        ) : (
          snapshot.hiddenVideo.map((identity) => (
            <div key={identity.participantId} style={rowStyle}>
              <span>{identity.displayName ?? identity.participantId}</span>
              <button
                type="button"
                onClick={() =>
                  commandBus.execute("MEDIA.RESTORE_VIDEO_LOCAL", { participantId: identity.participantId })
                }
                style={ghostBtn}
              >
                RESTORE VIDEO
              </button>
            </div>
          ))
        )}
      </section>

      <section style={section}>
        <h3 style={h3}>Removed People</h3>
        {snapshot.removedPeople.length === 0 ? (
          <p style={empty}>No one removed from your view.</p>
        ) : (
          snapshot.removedPeople.map((identity) => (
            <div key={identity.participantId} style={rowStyle}>
              <span>{identity.displayName ?? identity.participantId}</span>
              <button
                type="button"
                onClick={() => commandBus.execute("MEDIA.RESTORE_TO_VIEW", { participantId: identity.participantId })}
                style={ghostBtn}
              >
                RESTORE
              </button>
            </div>
          ))
        )}
      </section>

      <button
        type="button"
        onClick={() => commandBus.execute("MEDIA.RESTORE_ALL")}
        style={restoreAll}
      >
        RESTORE ALL
      </button>
    </aside>
  );
}

const shell: CSSProperties = {
  position: "absolute",
  top: 56,
  right: 12,
  width: 320,
  maxHeight: "min(70vh, 640px)",
  overflowY: "auto",
  zIndex: 140,
  pointerEvents: "auto",
  padding: 14,
  borderRadius: 16,
  border: `1px solid ${CYAN}66`,
  background: "rgba(5,5,16,0.94)",
  boxShadow: `0 0 24px ${CYAN}22`,
  fontFamily: "var(--font-sans, system-ui, sans-serif)",
};

const header: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 12,
};

const closeBtn: CSSProperties = {
  border: `1px solid ${GOLD}66`,
  background: `${GOLD}18`,
  color: GOLD,
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.08em",
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
};

const section: CSSProperties = { marginBottom: 12 };

const h3: CSSProperties = {
  color: CYAN,
  fontSize: 9,
  letterSpacing: "0.12em",
  fontWeight: 900,
  margin: "0 0 6px",
};

const empty: CSSProperties = {
  color: "rgba(255,255,255,0.4)",
  fontSize: 11,
  margin: 0,
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  color: "#fff",
  fontSize: 11,
  padding: "4px 0",
};

const ghostBtn: CSSProperties = {
  border: `1px solid ${FUCHSIA}66`,
  background: "transparent",
  color: FUCHSIA,
  fontSize: 8,
  fontWeight: 900,
  letterSpacing: "0.06em",
  borderRadius: 8,
  padding: "4px 8px",
  cursor: "pointer",
};

const restoreAll: CSSProperties = {
  width: "100%",
  marginTop: 4,
  border: `1px solid ${GOLD}`,
  background: `${GOLD}22`,
  color: GOLD,
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.1em",
  borderRadius: 12,
  padding: "10px 12px",
  cursor: "pointer",
};
