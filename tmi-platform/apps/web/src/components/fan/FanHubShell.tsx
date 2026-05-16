"use client";

import { type ReactNode, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSmartRoom } from "@/lib/rooms/SmartRoomRouter";
import { ProfileMemoryEngine } from "@/lib/profile/ProfileMemoryEngine";
import { ProfileCameraFallbackEngine } from "@/lib/profile/ProfileCameraFallbackEngine";
import FanLiveMonitor from "./FanLiveMonitor";
import FanReactionBar from "./FanReactionBar";
import FanLobbyPopup from "./FanLobbyPopup";
import FanPointsPanel from "./FanPointsPanel";
import FanShopRail from "./FanShopRail";
import FanModeSwitcher from "./FanModeSwitcher";
import FanInviteLobby from "./FanInviteLobby";
import FanVenueFullscreen from "./FanVenueFullscreen";
import { buildSeatFromPoints } from "./FanSeatEngine";
import { nextFanTransitionState } from "./FanShowTransitionEngine";
import {
  getFanTierConfig,
  isModeEnabled,
  type FanHubMode,
  type FanSubscriptionTier,
  type FanTransitionState,
} from "./FanTierSkinEngine";
import ProfileWorldShell from "@/components/profileworld/ProfileWorldShell";
import ProfileVisualFrame from "@/components/profileworld/ProfileVisualFrame";
import ProfileStageMonitor from "@/components/profileworld/ProfileStageMonitor";
import ProfileRightCommandRail from "@/components/profileworld/ProfileRightCommandRail";
import ProfileBottomActionDock from "@/components/profileworld/ProfileBottomActionDock";
import ProfileNeonPanel from "@/components/profileworld/ProfileNeonPanel";
import { getProfileTierSkin, mapFanTierToProfileTier } from "@/components/profileworld/ProfileTierSkinEngine";
import { isCurtainPreShowState } from "@/components/profileworld/ProfileModeStateMachine";
import MonetizationRail from "@/components/monetization/MonetizationRail";
import ProfileStreakRail from "@/components/streaks/ProfileStreakRail";

type FanHubShellProps = {
  fanSlug: string;
  displayName: string;
  tier: FanSubscriptionTier;
  tagline: string;
  startingPoints: number;
  previewWindow?: ReactNode;
};

function BulbRow({ accent }: { accent: string }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "5px 0" }}>
      {Array.from({ length: 28 }, (_, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: i % 2 === 0 ? accent : "#5ad7ff",
            boxShadow: i % 2 === 0 ? `0 0 6px ${accent}` : "0 0 6px #5ad7ff",
            opacity: 0.5 + (i % 3) * 0.16,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

const HUB_STATES: FanTransitionState[] = ["HUB_IDLE", "LOBBY_OPEN", "INVITE_ACCEPTED", "RETURN_TO_HUB"];

export default function FanHubShell({
  fanSlug,
  displayName,
  tier,
  tagline,
  startingPoints,
  previewWindow,
}: FanHubShellProps) {
  const [mode, setMode] = useState<FanHubMode>("neutral");
  const [transitionState, setTransitionState] = useState<FanTransitionState>("HUB_IDLE");
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(startingPoints);
  const [activityLog, setActivityLog] = useState("Hub initialized.");
  const [cameraMode, setCameraMode] = useState<
    "standard" | "crowd-cam" | "friend-cam" | "performer-focus" | "billboard-mode"
  >("standard");

  const router = useRouter();
  const tierConfig = useMemo(() => getFanTierConfig(tier), [tier]);
  const seat = useMemo(() => buildSeatFromPoints(points, fanSlug), [points, fanSlug]);
  const invitedFriends = ["You", "Friend 1", "Friend 2", "Friend 3"];

  // Session tracking — new ID per room visit
  const activeSessionId = useRef<string | null>(null);
  const activeRoomId    = useRef<string | null>(null);
  const sessionStartMs  = useRef<number>(0);

  const leapToRoom = useCallback(() => {
    const roomId = getSmartRoom();
    const sessionId = `session-${roomId}-${Date.now()}`;
    activeSessionId.current = sessionId;
    activeRoomId.current    = roomId;
    sessionStartMs.current  = Date.now();
    router.push(`/live/rooms/${roomId}?from=fan-hub&sid=${sessionId}`);
  }, [router]);

  const inFullscreen = transitionState === "FULLSCREEN_MODE";
  const avatarInHub = HUB_STATES.includes(transitionState);
  const profileSkin = useMemo(() => getProfileTierSkin(mapFanTierToProfileTier(tier)), [tier]);
  const preShowCurtain = isCurtainPreShowState(transitionState);

  const headerZone = (
    <ProfileVisualFrame title="Fan Hub Command Center" titleColor={profileSkin.titleColor}>
      <section
        style={{
          borderRadius: "0 0 22px 22px",
          padding: "12px 18px 14px",
          background: tierConfig.panelBackground,
          boxShadow: tierConfig.glow,
          border: `1px solid ${tierConfig.accent}44`,
          borderTop: "none",
        }}
      >
        <BulbRow accent={tierConfig.accent} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: tierConfig.accent,
                fontWeight: 900,
                marginBottom: 4,
              }}
            >
              FAN DASHBOARD · {tierConfig.badge}
            </div>
            <h1 style={{ margin: "0 0 4px", fontSize: 26, lineHeight: 1.1 }}>{displayName}</h1>
            <div style={{ color: "#a8d7ff", fontSize: 12 }}>{tagline}</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7abed4", marginBottom: 3 }}>
                State
              </div>
              <div style={{ fontSize: 12, color: tierConfig.accent, fontWeight: 900 }}>
                {transitionState.split("_").join(" ")}
              </div>
            </div>
            <button
              type="button"
              onClick={nextTransition}
              style={{
                borderRadius: 12,
                border: `1px solid ${tierConfig.accent}66`,
                background: `${tierConfig.accent}1e`,
                color: tierConfig.accent,
                padding: "8px 14px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Advance →
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {[
            { label: "Trivia", mode: "trivia" as FanHubMode, color: "#5ad7ff" },
            { label: "Vote", mode: "earn-points" as FanHubMode, color: tierConfig.accent },
            { label: "Profile", mode: "neutral" as FanHubMode, color: "#5ad7ff" },
            { label: "Shop", mode: "shop" as FanHubMode, color: "#ffb84a" },
          ].map(({ label, mode: m, color }) => (
            <button
              key={label}
              type="button"
              onClick={() => setMode(m)}
              style={{
                borderRadius: 10,
                border: `1px solid ${color}44`,
                background: mode === m ? `${color}20` : `${color}0e`,
                color,
                padding: "7px 14px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 800,
                boxShadow: mode === m ? `0 0 10px ${color}44` : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <FanModeSwitcher
            mode={mode}
            onChange={setMode}
            modeEnabled={(c) => isModeEnabled(c, tier)}
            accent={tierConfig.accent}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <BulbRow accent={tierConfig.accent} />
        </div>
      </section>
    </ProfileVisualFrame>
  );

  const handleCameraChange = useCallback(
    (mode: typeof cameraMode) => {
      setCameraMode(mode);
      if (mode === "billboard-mode") {
        void triggerCameraFallback();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fanSlug, activeSessionId, tierConfig]
  );

  const stageZone = inFullscreen ? (
    <FanVenueFullscreen
      seat={seat}
      invitedFriends={invitedFriends}
      cameraMode={cameraMode}
      onCameraModeChange={handleCameraChange}
      onAction={applyAction}
    />
  ) : (
    <ProfileStageMonitor
      title="Live Auditorium Feed"
      preShow={preShowCurtain}
      countdownText={transitionState === "SEATED" ? "Starting in 01:30" : "Starting in 03:00"}
    >
      <FanLiveMonitor mode={mode} transitionState={transitionState} title="Main Auditorium Monitor" />
    </ProfileStageMonitor>
  );

  const reactionZone = inFullscreen ? null : <FanReactionBar enabledReactions={tierConfig.reactions} onReaction={applyAction} />;

  const tipZone = inFullscreen ? null : (
    <FanPointsPanel
      points={points}
      goalPoints={1400}
      frontRowLabel="VIP Rail"
      message={message}
      onMessageChange={setMessage}
      onSend={() => setActivityLog(`Message sent: ${message || "(empty)"}`)}
      watchToEarnMultiplier={tierConfig.watchToEarnMultiplier}
    />
  );

  const playlistZone = inFullscreen ? null : (
    <div style={{ display: "grid", gap: 12 }}>
      {previewWindow ? <div>{previewWindow}</div> : null}

      <ProfileNeonPanel borderColor={tierConfig.accent} glow={`0 0 20px ${tierConfig.accent}20`} padding="14px">
        <div
          style={{
            color: "#6ec8ef",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: 10,
            fontWeight: 800,
          }}
        >
          Avatar Lobby Presence
        </div>
        {avatarInHub ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 18,
                border: `2px solid ${tierConfig.accent}`,
                background: `radial-gradient(circle at 40% 35%, ${tierConfig.accent}30, rgba(90,215,255,0.12))`,
                boxShadow: `0 0 18px ${tierConfig.accent}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              🎭
            </div>
            <div>
              <div style={{ color: "#dff2ff", fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                {displayName}
              </div>
              <div style={{ color: "#8fb8d8", fontSize: 11, marginBottom: 6 }}>
                Avatar inside hub — not rendered in the monitor feed.
              </div>
              <div
                style={{
                  display: "inline-flex",
                  gap: 6,
                  alignItems: "center",
                  borderRadius: 999,
                  border: `1px solid ${tierConfig.accent}55`,
                  color: tierConfig.accent,
                  padding: "3px 10px",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: tierConfig.accent,
                    boxShadow: `0 0 5px ${tierConfig.accent}`,
                  }}
                />
                {seat.zone.split("-").join(" ").toUpperCase()} · {seat.fanPointsBoost.toFixed(2)}x
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: "#7aa9cc", fontSize: 12 }}>
            Avatar transferred to seat system — row {seat.row}, zone {seat.zone}.
          </div>
        )}
      </ProfileNeonPanel>

      <ProfileNeonPanel borderColor={tierConfig.accent} glow={`0 0 16px ${tierConfig.accent}1e`} padding="12px">
        <div
          style={{
            color: "#6ec8ef",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: 10,
            fontWeight: 800,
          }}
        >
          Read & Earn
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ color: "#b7dcff", fontSize: 12 }}>
            Read the latest magazine story to earn Fan Points and unlock trivia boost.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href="/magazine/article/wavetek-rise-billboard"
              style={{
                borderRadius: 10,
                border: "1px solid rgba(90,215,255,0.45)",
                background: "rgba(90,215,255,0.12)",
                color: "#d8f4ff",
                padding: "8px 10px",
                textDecoration: "none",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Open Article
            </Link>
            <button
              type="button"
              onClick={() => {
                setPoints((value) => value + Math.round(40 * tierConfig.watchToEarnMultiplier));
                setMode("trivia");
                setActivityLog("Read & Earn applied. Trivia unlocked.");
              }}
              style={{
                borderRadius: 10,
                border: `1px solid ${tierConfig.accent}55`,
                background: `${tierConfig.accent}20`,
                color: tierConfig.accent,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              Claim + Earn
            </button>
          </div>
        </div>
      </ProfileNeonPanel>
    </div>
  );

  const botStripZone = inFullscreen ? null : (
    <div style={{ display: "grid", gap: 12 }}>
      <FanInviteLobby invitedFriends={invitedFriends} onInvite={() => setActivityLog("Invite sent.")} />

      {mode === "lobby" && (
        <FanLobbyPopup
          invitedFriends={invitedFriends}
          lobbySlots={tierConfig.lobbySlots}
          onJoin={() => {
            setTransitionState("SEATED");
            setActivityLog("Joined room and seated.");
          }}
          onMoveCloser={() => {
            setPoints((v) => v + 100);
            setActivityLog("Seat movement requested.");
          }}
        />
      )}
    </div>
  );

  const rightTowerZone = inFullscreen ? null : (
    <ProfileRightCommandRail title="Command Rail">
      <FanShopRail onAction={applyAction} />
    </ProfileRightCommandRail>
  );

  const bottomActionZone = inFullscreen ? null : (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          borderRadius: 14,
          border: "1px solid rgba(90,215,255,0.22)",
          background: "rgba(4,10,24,0.90)",
          padding: 12,
        }}
      >
        <div
          style={{
            color: "#6ec8ef",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: 10,
            fontWeight: 800,
          }}
        >
          Bottom Rail
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
          {[
            { label: "Livestreams", icon: "📺" },
            { label: "Trending Now", icon: "🔥" },
            { label: "Fan Mix", icon: "🎵" },
            { label: "Sponsor Earn", icon: "💰" },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => applyAction(label.toLowerCase())}
              style={{
                borderRadius: 12,
                border: `1px solid ${tierConfig.accent}38`,
                background: `${tierConfig.accent}10`,
                color: "#ffdcb8",
                padding: "10px 8px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <ProfileBottomActionDock onAction={applyAction} />
    </div>
  );

  const engineLogZone = (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid rgba(90,215,255,0.18)",
        background: "rgba(3,8,18,0.92)",
        padding: "8px 12px",
        fontSize: 11,
        color: "#8ab8d2",
      }}
    >
      <span style={{ color: tierConfig.accent, fontWeight: 900 }}>Engine Log: </span>
      {activityLog}
    </div>
  );

  function applyAction(action: string) {
    if (action === "watch & earn") setPoints((v) => v + Math.round(25 * tierConfig.watchToEarnMultiplier));
    if (action === "upgrade") setPoints((v) => v + 15);
    if (action === "livestreams" || action === "trending now") { leapToRoom(); return; }
    setActivityLog(`Action: ${action}`);
  }

  async function triggerCameraFallback() {
    const sid = activeSessionId.current ?? `fallback-${Date.now()}`;
    const ok = await ProfileCameraFallbackEngine.bindFallbackToStream(sid, fanSlug, 'fan');
    setActivityLog(ok ? 'Camera fallback bound — motion portrait active.' : 'Camera fallback failed.');
  }

  async function nextTransition() {
    const next = nextFanTransitionState(transitionState);
    setTransitionState(next);

    if (next === "LOBBY_OPEN") setMode("lobby");

    if (next === "SEATED") {
      setActivityLog(`Seated in ${seat.zone}. Avatar in crowd simulation.`);
    }

    if (next === "FULLSCREEN_MODE") {
      setMode("live-auditorium");
      leapToRoom();
    }

    if (next === "RETURN_TO_HUB") {
      setMode("neutral");
      // Seal the session memory shard
      if (activeSessionId.current) {
        const durationMs  = Date.now() - sessionStartMs.current;
        const pointsEarned = Math.round((durationMs / 60000) * tierConfig.watchToEarnMultiplier * 10);
        setPoints((v) => v + pointsEarned);
        await ProfileMemoryEngine.captureSessionShard(fanSlug, activeSessionId.current, {
          roomId: activeRoomId.current,
          durationMs,
          pointsEarned,
          zone: seat.zone,
          tier,
        });
        setActivityLog(`Session sealed. +${pointsEarned} FP earned. Memory shard saved.`);
        activeSessionId.current = null;
        activeRoomId.current    = null;
      }
    }
  }

  return (
    <ProfileWorldShell
      skin={profileSkin}
      title="Fan Dashboard"
      subtitle={`${displayName} | ${tierConfig.label} | ${transitionState.split("_").join(" ")}`}
      topControls={
        <button
          type="button"
          onClick={nextTransition}
          style={{
            borderRadius: 12,
            border: `1px solid ${profileSkin.actionAccent}66`,
            background: `${profileSkin.actionAccent}22`,
            color: profileSkin.actionAccent,
            padding: "8px 14px",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Advance State
        </button>
      }
      zones={{
        headerZone,
        stageZone,
        reactionZone,
        tipZone,
        playlistZone,
        botStripZone,
        rightTowerZone,
        bottomActionZone,
        engineLogZone,
      }}
    >
      <MonetizationRail
        target={{}}
        actions={["subscribe", "gift", "ticket", "season-pass"]}
        heading="FAN PERKS"
        layout="row"
      />
      <ProfileStreakRail userId={fanSlug} displayName={displayName} mode="full" accentColor="#FF2DAA" />
    </ProfileWorldShell>
  );
}
