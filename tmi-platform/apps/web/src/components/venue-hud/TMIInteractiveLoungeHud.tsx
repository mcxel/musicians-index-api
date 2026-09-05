"use client";

/**
 * TMI Interactive Lounge HUD — Sibling Social World HUD.
 *
 * User-facing Name: TMI Interactive Lounge HUD
 * Technical Engine: TMI Lounge HUD Runtime
 *
 * Laws:
 *   1. Sibling to Venue HUD; dedicated strictly to social world interaction.
 *   2. Reuses shared primitives (HudCommandBus, HudRecallControl).
 *   3. Proximity engine injects context-sensitive pills (Sit, Talk, Dance, Play, Order).
 *   4. MY VIEW drawer is the real mount for client-local PersonalMediaRouter recovery.
 *   5. Context ring chevron mounts only when a real participant id is provided.
 *   6. Clean Stage state preserves permanent HUD Recall Control ([ ◰ SHOW HUD ]) in top-right.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import MyViewDrawer from "@/components/personal-media/MyViewDrawer";
import ParticipantMediaContextMenu from "@/components/personal-media/ParticipantMediaContextMenu";
import { defaultPersonalMediaCommandBus, defaultPersonalMediaRouter } from "@/lib/personal-media";
import { requestOneToOneSocial } from "@/lib/trustSafety/requestOneToOneSocial";
import { HudCommandBus } from "@/lib/venue-hud/TMIExperienceHudRuntime";
import VenueToolsToggleButton from "@/components/hud/VenueToolsToggleButton";
import InRoomMixerPanel from "@/components/venue-hud/InRoomMixerPanel";
import { ChannelMixerDirector } from "@/lib/audio/mixer";
import {
  resolveLoungeProximityActions,
  type LoungeMode,
  type ProximityTarget,
} from "@/lib/venue-hud/TMILoungeHudRuntime";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";

export interface TMIInteractiveLoungeHudProps {
  loungeId: string;
  loungeTitle: string;
  loungeMode?: LoungeMode;
  userRole?: "fan" | "performer" | "admin";
  /** When true, user may open VENUE TOOLS for lounge environment controls */
  isLoungeHost?: boolean;
  /** Required for venue tools panel when host */
  userId?: string;
  /** Real participant id only. Omit rather than inventing a lounge context identity. */
  contextParticipantId?: string;
  /** Honest occupancy from audience runtime. Omit rather than inventing viewers. */
  occupancyPresent?: number;
  occupancyCapacity?: number;
  proximityTarget?: ProximityTarget | null;
}

export default function TMIInteractiveLoungeHud({
  loungeId,
  loungeTitle,
  loungeMode = "CHILL_LOUNGE",
  userRole = "fan",
  isLoungeHost = false,
  userId,
  contextParticipantId,
  occupancyPresent,
  occupancyCapacity,
  proximityTarget = null,
}: TMIInteractiveLoungeHudProps) {
  const [hudVisible, setHudVisible] = useState(true);
  const [isSeated, setIsSeated] = useState(false);
  const [isPrivateTalking, setIsPrivateTalking] = useState(false);
  const [activeDance, setActiveDance] = useState<string | null>(null);
  const [showChevron, setShowChevron] = useState(false);
  const [myViewOpen, setMyViewOpen] = useState(false);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const contextIdRef = useRef(contextParticipantId);
  contextIdRef.current = contextParticipantId;
  const proximityRef = useRef(proximityTarget);
  proximityRef.current = proximityTarget;
  const privateTalkingRef = useRef(false);

  useEffect(() => {
    ChannelMixerDirector.bindSession({
      roomId: loungeId,
      liveSessionId: `lounge:${loungeId}`,
      experienceType: "LOUNGE",
    });
  }, [loungeId]);

  useEffect(() => {
    const unbindMedia = defaultPersonalMediaCommandBus.bindToHudBus(
      HudCommandBus as unknown as Parameters<typeof defaultPersonalMediaCommandBus.bindToHudBus>[0],
    );
    const unsubs = [
      HudCommandBus.register("LOUNGE_SIT", () => {
        setIsSeated((s) => {
          const next = !s;
          setStatusLine(next ? "Seated" : "Stood up");
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

      HudCommandBus.register("LOUNGE_PRIVATE_TALK", async () => {
        if (privateTalkingRef.current) {
          privateTalkingRef.current = false;
          setIsPrivateTalking(false);
          setStatusLine("Ended private talk");
          return true;
        }
        const participantId =
          contextIdRef.current ||
          (proximityRef.current?.type === "AVATAR" ? proximityRef.current.id : undefined);
        if (!participantId) {
          setStatusLine("blocked: no person selected for 1:1");
          return false;
        }
        const identity = defaultPersonalMediaRouter.getParticipant(participantId);
        const targetUserId = identity?.canonicalIdentityId || participantId;
        const decision = await requestOneToOneSocial(targetUserId);
        if (!decision.allowed) {
          setStatusLine(decision.reason);
          return false;
        }
        privateTalkingRef.current = true;
        setIsPrivateTalking(true);
        setStatusLine("Private talk session active");
        return true;
      }),

      HudCommandBus.register("EMIT_REACTION", (payload) => {
        const emoji = typeof payload.params?.emoji === "string" ? payload.params.emoji : null;
        setStatusLine(emoji ? `Reaction ${emoji}` : "Reaction sent");
        return true;
      }),
    ];

    return () => {
      unbindMedia();
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

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
      <div style={{ position: "absolute", top: 12, right: 12, pointerEvents: "auto", zIndex: 120, display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => setMixerOpen((v) => !v)}
          title="In-room audio mixer"
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${mixerOpen ? GOLD : CYAN}`,
            background: "rgba(6,6,20,0.85)",
            color: mixerOpen ? GOLD : CYAN,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
          data-testid="lounge-hud-audio-btn"
        >
          🔊 AUDIO
        </button>
        <button
          type="button"
          onClick={() => setMyViewOpen((v) => !v)}
          title="MY VIEW personal media"
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${myViewOpen ? GOLD : CYAN}`,
            background: "rgba(6,6,20,0.85)",
            color: myViewOpen ? GOLD : CYAN,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          MY VIEW
        </button>
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
        {isLoungeHost && userId ? (
          <VenueToolsToggleButton
            accent={GREEN}
            loungeHost
            role="fan"
            roomId={loungeId}
            testId="tmi-venue-tools-lounge-hud"
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 10,
              minHeight: 36,
            }}
          />
        ) : null}
      </div>

      <MyViewDrawer open={myViewOpen} onClose={() => setMyViewOpen(false)} />

      <InRoomMixerPanel
        roomId={loungeId}
        liveSessionId={`lounge:${loungeId}`}
        experienceType="LOUNGE"
        auth={{
          userId: userId ?? `guest-${loungeId}`,
          role: isLoungeHost ? "host" : userRole === "admin" ? "admin" : userRole === "performer" ? "performer" : "fan",
          isRoomOwner: isLoungeHost,
        }}
        open={mixerOpen}
        onClose={() => setMixerOpen(false)}
        compact
      />

      {contextParticipantId ? (
        <div style={{ position: "absolute", bottom: 80, left: 72, pointerEvents: "auto", zIndex: 130 }}>
          <ParticipantMediaContextMenu
            participantId={contextParticipantId}
            onPrivateTalk={() => {
              void HudCommandBus.execute("LOUNGE_PRIVATE_TALK");
            }}
          />
        </div>
      ) : null}

      {hudVisible && (
        <>
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 210,
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

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {typeof occupancyPresent === "number" ? (
                <span style={{ fontSize: 9, color: CYAN, fontWeight: 800 }}>
                  👁 {occupancyPresent} inside{typeof occupancyCapacity === "number" ? ` / ${occupancyCapacity}` : ""}
                </span>
              ) : (
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 800 }}>Occupancy unknown</span>
              )}
              {isSeated ? <span style={{ fontSize: 9, color: GREEN, fontWeight: 800 }}>🪑 SEATED</span> : null}
              {activeDance ? <span style={{ fontSize: 9, color: FUCHSIA, fontWeight: 800 }}>🕺 {activeDance}</span> : null}
              {isPrivateTalking ? <span style={{ fontSize: 9, color: CYAN, fontWeight: 800 }}>💬 PRIVATE TALK</span> : null}
            </div>
          </div>

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
          </div>

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
