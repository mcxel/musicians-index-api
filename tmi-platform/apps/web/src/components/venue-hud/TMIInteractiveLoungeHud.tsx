"use client";

/**
 * TMI Interactive Lounge HUD — Sibling Social World HUD with PersonalMediaRouter UI.
 *
 * User-facing Name: TMI Interactive Lounge HUD
 * Technical Engine: TMI Lounge HUD Runtime + PersonalMediaRouter
 *
 * Laws:
 *   1. Sibling to Venue HUD; dedicated strictly to social world interaction.
 *   2. Reuses shared primitives (HudCommandBus, HudRecallControl).
 *   3. Proximity engine & Context Ring injects PersonalMediaRouter actions:
 *        - WATCH ON › (Monitor A / Monitor B / Split Slot)
 *        - 📌 PIN AUDIO (Pin Audio overrides proximity attenuation while roaming)
 *        - MUTE FOR ME / HIDE VIDEO FOR ME / REMOVE FROM MY VIEW
 *   4. MY VIEW › Recovery Drawer exposes local curation states with RESTORE ALL control.
 *   5. Clean Stage state preserves permanent HUD Recall Control ([ ◰ SHOW HUD ]).
 */

import { useEffect, useState, type CSSProperties } from "react";
import MyViewDrawer from "@/components/personal-media/MyViewDrawer";
import ParticipantMediaContextMenu from "@/components/personal-media/ParticipantMediaContextMenu";
import { defaultPersonalMediaCommandBus } from "@/lib/personal-media";
import { HudCommandBus } from "@/lib/venue-hud/TMIExperienceHudRuntime";
import {
  resolveLoungeProximityActions,
  type LoungeMode,
  type ProximityTarget,
} from "@/lib/venue-hud/TMILoungeHudRuntime";
import {
  PersonalMediaRouter,
  type ParticipantMediaIdentity,
  type MonitorTarget,
} from "@/lib/venue-hud/PersonalMediaRouter";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";
const RED = "#FF4466";

export interface TMIInteractiveLoungeHudProps {
  loungeId: string;
  loungeTitle: string;
  loungeMode?: LoungeMode;
  userRole?: "fan" | "performer" | "admin";
  /** Real participant id only. Omit rather than inventing a lounge context identity. */
  contextParticipantId?: string;
}

export default function TMIInteractiveLoungeHud({
  loungeId,
  loungeTitle,
  loungeMode = "CHILL_LOUNGE",
  userRole = "fan",
  contextParticipantId,
}: TMIInteractiveLoungeHudProps) {
  const [hudVisible, setHudVisible] = useState(true);
  const [isSeated, setIsSeated] = useState(false);
  const [isPrivateTalking, setIsPrivateTalking] = useState(false);
  const [activeDance, setActiveDance] = useState<string | null>(null);
  const [showChevron, setShowChevron] = useState(false);
  const [myViewOpen, setMyViewOpen] = useState(false);
  const [showMyViewDrawer, setShowMyViewDrawer] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantMediaIdentity | null>({
    participantId: "part-alice",
    roomId: loungeId,
    videoTrackId: "v-alice",
    audioTrackId: "a-alice",
    spatialPodId: "pod-alice",
    canonicalIdentityId: "user-alice",
    displayName: "Alice",
  });
  const [showContextRing, setShowContextRing] = useState(false);

  const [proximityTarget, setProximityTarget] = useState<ProximityTarget | null>({
    id: "seat-vip-1",
    type: "SEAT",
    label: "VIP Couch 01",
    distanceMeters: 1.2,
    availableActions: ["LOUNGE_SIT"],
  });

  const [pinnedUsers, setPinnedUsers] = useState<Set<string>>(new Set());
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [hiddenVideoUsers, setHiddenVideoUsers] = useState<Set<string>>(new Set());
  const [removedUsers, setRemovedUsers] = useState<Set<string>>(new Set());
  const [monitorAAssigned, setMonitorAAssigned] = useState<string | null>(null);
  const [monitorBAssigned, setMonitorBAssigned] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);

  // Register participant in router
  useEffect(() => {
    if (selectedParticipant) {
      PersonalMediaRouter.registerParticipant(selectedParticipant);
    }
  }, [selectedParticipant]);

  // Command handlers
  useEffect(() => {
    const unsubs = [
      HudCommandBus.register("LOUNGE_SIT", () => {
        setIsSeated((s) => {
          const next = !s;
          setStatusLine(next ? "Seated on VIP Couch 01" : "Stood up");
          return next;
        });
        return true;
      }),

      HudCommandBus.register("LOUNGE_DANCE", () => {
        setActiveDance((d) => {
          const next = d ? null : "Spin Dance";
          setStatusLine(next ? "Dancing: Spin Dance" : "Stopped dancing");
          return next;
        });
        return true;
      }),

      HudCommandBus.register("LOUNGE_PRIVATE_TALK", () => {
        setIsPrivateTalking((p) => {
          const next = !p;
          setStatusLine(next ? "Private talk session active" : "Ended private talk");
          return next;
        });
        return true;
      }),

      HudCommandBus.register("MEDIA.ASSIGN_TO_MONITOR", (payload) => {
        const pId = payload.params?.participantId ?? selectedParticipant?.participantId;
        const target: MonitorTarget = payload.params?.target ?? { monitorId: "MONITOR_A", slotId: "PRIMARY" };
        if (!pId) return false;

        const res = PersonalMediaRouter.assignToMonitor(pId, target);
        if (target.monitorId === "MONITOR_A") setMonitorAAssigned(pId);
        if (target.monitorId === "MONITOR_B") setMonitorBAssigned(pId);

        setStatusLine(`Assigned to ${target.monitorId} (0 WebRTC reconnections)`);
        setShowContextRing(false);
        return res.ok;
      }),

      HudCommandBus.register("MEDIA.REMOVE_FROM_MONITOR", (payload) => {
        const target: MonitorTarget = payload.params?.target ?? { monitorId: "MONITOR_A", slotId: "PRIMARY" };
        PersonalMediaRouter.removeFromMonitor(target);
        if (target.monitorId === "MONITOR_A") setMonitorAAssigned(null);
        if (target.monitorId === "MONITOR_B") setMonitorBAssigned(null);

        setStatusLine(`Removed from ${target.monitorId}`);
        return true;
      }),

      HudCommandBus.register("MEDIA.PIN_AUDIO", (payload) => {
        const pId = payload.params?.participantId ?? selectedParticipant?.participantId;
        if (!pId) return false;

        if (pinnedUsers.has(pId)) {
          PersonalMediaRouter.unpinAudio(pId);
          setPinnedUsers((prev) => {
            const next = new Set(prev);
            next.delete(pId);
            return next;
          });
          setStatusLine("Unpinned audio.");
        } else {
          PersonalMediaRouter.pinAudio(pId);
          setPinnedUsers((prev) => new Set(prev).add(pId));
          setStatusLine("📌 AUDIO PINNED — Voice stays in foreground mix while roaming!");
        }
        setShowContextRing(false);
        return true;
      }),

      HudCommandBus.register("MEDIA.MUTE_LOCAL", (payload) => {
        const pId = payload.params?.participantId ?? selectedParticipant?.participantId;
        if (!pId) return false;

        if (mutedUsers.has(pId)) {
          PersonalMediaRouter.unmuteLocal(pId);
          setMutedUsers((prev) => {
            const next = new Set(prev);
            next.delete(pId);
            return next;
          });
          setStatusLine("Unmuted locally.");
        } else {
          PersonalMediaRouter.muteLocal(pId);
          setMutedUsers((prev) => new Set(prev).add(pId));
          setStatusLine("Muted for me.");
        }
        setShowContextRing(false);
        return true;
      }),

      HudCommandBus.register("MEDIA.HIDE_VIDEO_LOCAL", (payload) => {
        const pId = payload.params?.participantId ?? selectedParticipant?.participantId;
        if (!pId) return false;

        if (hiddenVideoUsers.has(pId)) {
          PersonalMediaRouter.restoreVideoLocal(pId);
          setHiddenVideoUsers((prev) => {
            const next = new Set(prev);
            next.delete(pId);
            return next;
          });
          setStatusLine("Video restored locally.");
        } else {
          PersonalMediaRouter.hideVideoLocal(pId);
          setHiddenVideoUsers((prev) => new Set(prev).add(pId));
          setStatusLine("Video hidden for me.");
        }
        setShowContextRing(false);
        return true;
      }),

      HudCommandBus.register("MEDIA.REMOVE_FROM_VIEW", (payload) => {
        const pId = payload.params?.participantId ?? selectedParticipant?.participantId;
        if (!pId) return false;

        PersonalMediaRouter.removeFromView(pId);
        setRemovedUsers((prev) => new Set(prev).add(pId));
        setStatusLine("Removed from my view.");
        setShowContextRing(false);
        return true;
      }),

      HudCommandBus.register("MEDIA.RESTORE_ALL", () => {
        PersonalMediaRouter.restoreAllPersonalViewSettings();
        setPinnedUsers(new Set());
        setMutedUsers(new Set());
        setHiddenVideoUsers(new Set());
        setRemovedUsers(new Set());
        setMonitorAAssigned(null);
        setMonitorBAssigned(null);
        setStatusLine("Restored all personal view settings.");
        setShowMyViewDrawer(false);
        return true;
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [selectedParticipant, pinnedUsers, mutedUsers, hiddenVideoUsers]);

  const proximityActions = proximityTarget ? resolveLoungeProximityActions(proximityTarget) : [];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
        overflow: "hidden",
        isolation: "isolate",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* PERMANENT HUD RECALL CONTROL IN TOP-RIGHT EDGE */}
      <div style={{ position: "absolute", top: 12, right: 12, pointerEvents: "auto", zIndex: 120 }}>
        <button
          type="button"
          onClick={() => setHudVisible((v) => !v)}
          title={hudVisible ? "Hide Lounge HUD" : "Show Lounge HUD"}
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${hudVisible ? CYAN : GOLD}`,
            background: "rgba(6,6,20,0.85)",
            color: hudVisible ? CYAN : GOLD,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            boxShadow: `0 0 12px ${hudVisible ? CYAN : GOLD}44`,
          }}
        >
          {hudVisible ? "◱ HIDE HUD" : "◰ SHOW HUD"}
        </button>
      </div>

      {hudVisible && (
        <>
          {/* TOP STATUS RAIL */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 120,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              borderRadius: 14,
              border: `1px solid ${GOLD}44`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: GOLD, letterSpacing: "0.12em" }}>
                LOUNGE: {loungeMode}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{loungeTitle}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isSeated ? <span style={{ fontSize: 9, color: GREEN, fontWeight: 800 }}>🪑 SEATED</span> : null}
              {activeDance ? <span style={{ fontSize: 9, color: FUCHSIA, fontWeight: 800 }}>🕺 {activeDance}</span> : null}
              {isPrivateTalking ? <span style={{ fontSize: 9, color: CYAN, fontWeight: 800 }}>💬 PRIVATE TALK</span> : null}
              {pinnedUsers.size > 0 ? <span style={{ fontSize: 9, color: GOLD, fontWeight: 800 }}>📌 {pinnedUsers.size} PINNED</span> : null}

              <button
                type="button"
                onClick={() => setShowMyViewDrawer((d) => !d)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 12,
                  border: `1px solid ${CYAN}`,
                  background: `${CYAN}22`,
                  color: CYAN,
                  fontSize: 9,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                👁️ MY VIEW ›
              </button>
            </div>
          </div>

          {/* LEFT SOCIAL ACTION RAIL */}
          <div
            style={{
              position: "absolute",
              top: 68,
              left: 12,
              width: 50,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 8,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            <button
              type="button"
              title={isSeated ? "Stand up" : "Sit down"}
              onClick={() => HudCommandBus.execute("LOUNGE_SIT")}
              style={sideIconBtn(isSeated ? GREEN : CYAN)}
            >
              🪑
            </button>

            <button
              type="button"
              title={activeDance ? "Stop dancing" : "Start dancing"}
              onClick={() => HudCommandBus.execute("LOUNGE_DANCE")}
              style={sideIconBtn(activeDance ? FUCHSIA : CYAN)}
            >
              🕺
            </button>

            <button
              type="button"
              title="Private conversation"
              onClick={() => HudCommandBus.execute("LOUNGE_PRIVATE_TALK")}
              style={sideIconBtn(isPrivateTalking ? GOLD : CYAN)}
            >
              💬
            </button>

            <button
              type="button"
              title="Target Participant Context Ring"
              onClick={() => setShowContextRing((c) => !c)}
              style={sideIconBtn(showContextRing ? GOLD : CYAN)}
            >
              👤
            </button>
          </div>

          {/* CONTEXT RING PARTICIPANT MENU */}
          {showContextRing && selectedParticipant && (
            <div
              style={{
                position: "absolute",
                top: 70,
                left: 70,
                width: 220,
                padding: 12,
                borderRadius: 16,
                border: `1.5px solid ${CYAN}`,
                background: "rgba(8,8,24,0.96)",
                backdropFilter: "blur(16px)",
                pointerEvents: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                boxShadow: `0 0 20px ${CYAN}44`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: CYAN }}>
                  {selectedParticipant.displayName}
                </span>
                <button type="button" onClick={() => setShowContextRing(false)} style={tinyBtn}>
                  ✕
                </button>
              </div>

              {/* WATCH ON › MONITOR TARGETS */}
              <div style={{ fontSize: 9, color: GOLD, fontWeight: 800 }}>WATCH ON ›</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() =>
                    HudCommandBus.execute("MEDIA.ASSIGN_TO_MONITOR", {
                      params: { participantId: selectedParticipant.participantId, target: { monitorId: "MONITOR_A", slotId: "PRIMARY" } },
                    })
                  }
                  style={chipBtn(monitorAAssigned === selectedParticipant.participantId ? GREEN : CYAN)}
                >
                  {monitorAAssigned === selectedParticipant.participantId ? "✓ MONITOR A" : "MONITOR A"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    HudCommandBus.execute("MEDIA.ASSIGN_TO_MONITOR", {
                      params: { participantId: selectedParticipant.participantId, target: { monitorId: "MONITOR_B", slotId: "PRIMARY" } },
                    })
                  }
                  style={chipBtn(monitorBAssigned === selectedParticipant.participantId ? GREEN : CYAN)}
                >
                  {monitorBAssigned === selectedParticipant.participantId ? "✓ MONITOR B" : "MONITOR B"}
                </button>
              </div>

              {/* PIN AUDIO / MUTE / HIDE / REMOVE */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => HudCommandBus.execute("MEDIA.PIN_AUDIO", { params: { participantId: selectedParticipant.participantId } })}
                  style={menuActionBtn(pinnedUsers.has(selectedParticipant.participantId) ? GOLD : CYAN)}
                >
                  {pinnedUsers.has(selectedParticipant.participantId) ? "📌 UNPIN AUDIO" : "📌 PIN AUDIO (ROAM)"}
                </button>

                <button
                  type="button"
                  onClick={() => HudCommandBus.execute("MEDIA.MUTE_LOCAL", { params: { participantId: selectedParticipant.participantId } })}
                  style={menuActionBtn(mutedUsers.has(selectedParticipant.participantId) ? RED : CYAN)}
                >
                  {mutedUsers.has(selectedParticipant.participantId) ? "🔊 UNMUTE FOR ME" : "🔇 MUTE FOR ME"}
                </button>

                <button
                  type="button"
                  onClick={() => HudCommandBus.execute("MEDIA.HIDE_VIDEO_LOCAL", { params: { participantId: selectedParticipant.participantId } })}
                  style={menuActionBtn(hiddenVideoUsers.has(selectedParticipant.participantId) ? RED : CYAN)}
                >
                  {hiddenVideoUsers.has(selectedParticipant.participantId) ? "👁️ RESTORE VIDEO" : "🙈 HIDE VIDEO FOR ME"}
                </button>

                <button
                  type="button"
                  onClick={() => HudCommandBus.execute("MEDIA.REMOVE_FROM_VIEW", { params: { participantId: selectedParticipant.participantId } })}
                  style={menuActionBtn(RED)}
                >
                  🚫 REMOVE FROM MY VIEW
                </button>
              </div>
            </div>
          )}

          {/* MY VIEW RECOVERY DRAWER */}
          {showMyViewDrawer && (
            <div
              style={{
                position: "absolute",
                top: 64,
                right: 12,
                width: 240,
                padding: 12,
                borderRadius: 16,
                border: `1.5px solid ${GOLD}`,
                background: "rgba(6,6,22,0.96)",
                backdropFilter: "blur(16px)",
                pointerEvents: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: `0 0 24px ${GOLD}44`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: GOLD, letterSpacing: "0.08em" }}>
                  👁️ MY VIEW RECOVERY
                </span>
                <button type="button" onClick={() => setShowMyViewDrawer(false)} style={tinyBtn}>
                  ✕
                </button>
              </div>

              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", gap: 4 }}>
                <div>📌 Pinned Audio: {pinnedUsers.size}</div>
                <div>🔇 Muted People: {mutedUsers.size}</div>
                <div>🙈 Hidden Video: {hiddenVideoUsers.size}</div>
                <div>🚫 Removed People: {removedUsers.size}</div>
                <div>📺 Monitor A: {monitorAAssigned ?? "None"}</div>
                <div>📺 Monitor B: {monitorBAssigned ?? "None"}</div>
              </div>

              <button
                type="button"
                onClick={() => HudCommandBus.execute("MEDIA.RESTORE_ALL")}
                style={{
                  padding: "8px",
                  borderRadius: 10,
                  border: `1px solid ${GREEN}`,
                  background: `${GREEN}22`,
                  color: GREEN,
                  fontSize: 10,
                  fontWeight: 900,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                🔄 RESTORE ALL PERSONAL SETTINGS
              </button>
            </div>
          )}

          {/* CONTEXTUAL PROXIMITY PILL BAR */}
          {proximityTarget && (
            <div
              style={{
                position: "absolute",
                bottom: 74,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 20,
                border: `1px solid ${CYAN}66`,
                background: "rgba(8,8,24,0.92)",
                backdropFilter: "blur(12px)",
                pointerEvents: "auto",
                boxShadow: `0 0 16px ${CYAN}33`,
              }}
            >
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", alignSelf: "center" }}>
                NEAR {proximityTarget.label} ({proximityTarget.distanceMeters}m):
              </span>
              {proximityActions.map((act) => (
                <button
                  key={act.actionId}
                  type="button"
                  onClick={() => HudCommandBus.execute(act.actionId)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 12,
                    border: `1px solid ${CYAN}`,
                    background: `${CYAN}22`,
                    color: CYAN,
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>{act.icon}</span>
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* BOTTOM CHEVRON EMOTE & SOCIAL TRAY */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              right: 12,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              borderRadius: 14,
              border: `1px solid ${GOLD}44`,
              background: "rgba(6,6,20,0.88)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {["👋", "💃", "🙌", "😂"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => HudCommandBus.execute("EMIT_REACTION", { params: { emoji } })}
                  style={emojiCircleBtn}
                >
                  {emoji}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowChevron((c) => !c)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 10,
                  border: `1px solid ${GOLD}66`,
                  background: `${GOLD}22`,
                  color: GOLD,
                  fontSize: 9,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {showChevron ? "▲ CLOSE" : "⋯ MORE"}
              </button>
            </div>

            {showChevron && (
              <div style={{ display: "flex", gap: 6 }}>
                {["👑", "💎", "🍸", "🎵"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => HudCommandBus.execute("EMIT_REACTION", { params: { emoji } })}
                    style={emojiCircleBtn}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {statusLine ? (
        <div
          style={{
            position: "absolute",
            bottom: 130,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "4px 12px",
            borderRadius: 12,
            background: "rgba(0,0,0,0.85)",
            border: `1px solid ${CYAN}66`,
            color: CYAN,
            fontSize: 10,
            fontWeight: 800,
            pointerEvents: "none",
          }}
        >
          {statusLine}
        </div>
      ) : null}
    </div>
  );
}

function sideIconBtn(color: string): CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function chipBtn(color: string): CSSProperties {
  return {
    padding: "4px 8px",
    borderRadius: 8,
    border: `1px solid ${color}`,
    background: `${color}22`,
    color,
    fontSize: 9,
    fontWeight: 900,
    cursor: "pointer",
  };
}

function menuActionBtn(color: string): CSSProperties {
  return {
    padding: "6px 8px",
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
  };
}

const tinyBtn: CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  borderRadius: 4,
  fontSize: 10,
  width: 20,
  height: 20,
  cursor: "pointer",
};

const emojiCircleBtn: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.06)",
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
