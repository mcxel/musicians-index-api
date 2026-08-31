"use client";

/**
 * CommandCenterSessionControlStrip — primary horizontal session controls.
 * Single-row horizontal touch-scroll bar on mobile & desktop (QP-10).
 * Locked 7 buttons: MIC ON | CAM ON | CAMERA | SNIPS | VIDEO SHUFFLE | STREAM & WIN | GO LIVE
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import InventoryPanelOverlay from "@/components/panels/InventoryPanelOverlay";
import CameraCaptureOverlay from "@/components/panels/CameraCaptureOverlay";
import { useMobileQuickPanelRuntime } from "@/lib/hud/mobileQuickPanelRuntime";
import { useFloatingWorkspace } from "@/lib/workspace/floatingWorkspaceStore";
import { launchDockStore } from "@/lib/dock/launchDockStore";
import { dispatchMediaPlayerGoLiveIntent } from "@/components/commandCenter/MediaPlayerGoLiveControl";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import { getPrimarySessionStripForRole } from "@/lib/commandCenter/sessionControlCapabilities";
import {
  toggleHubCameraPreview,
  toggleHubMicPreview,
  useLivePrivacyState,
} from "@/lib/live/livePrivacyState";
import {
  startVideoShuffle,
  exitVideoShuffle,
  isVideoShuffleActive,
} from "@/lib/shuffle/VideoShuffleModeRuntime";
import {
  startStreamWin,
  exitStreamWin,
  isStreamWinActive,
} from "@/lib/radio/StreamWinModeRuntime";
import { registerShellButtonHealth } from "@/registries/shell/ButtonCommandRegistry";

const GOLD = "#FFD700";

export interface CommandCenterSessionControlStripProps {
  role: "fan" | "performer";
  userId?: string;
  displayName?: string;
}

export default function CommandCenterSessionControlStrip({
  role,
  userId = "",
  displayName = "",
}: CommandCenterSessionControlStripProps) {
  const isPerformer = role === "performer";
  const router = useRouter();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [goLivePhase, setGoLivePhase] = useState<"idle" | "launching" | "error">("idle");
  const [goLiveError, setGoLiveError] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [shuffleActive, setShuffleActive] = useState(false);
  const [streamWinActive, setStreamWinActive] = useState(false);

  const { activePanel, openPanel, closePanel } = useCompactQuickPanelStore();
  const { open: openWorkspace } = useFloatingWorkspace();

  const isMobile = useMobileQuickPanelRuntime((s) => s.isMobile);
  useEffect(() => {
    const { setIsMobile } = useMobileQuickPanelRuntime.getState();
    const mql = window.matchMedia("(max-width: 900px)");
    const check = () => setIsMobile(mql.matches);
    check();
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  const cameraPreviewActive = useLivePrivacyState((s) => s.cameraPreviewActive);
  const micPreviewActive = useLivePrivacyState((s) => s.micPreviewActive);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);

  useEffect(() => {
    launchDockStore.setRole(isPerformer ? "PERFORMER" : "FAN");
  }, [isPerformer]);

  useEffect(() => {
    setShuffleActive(isVideoShuffleActive());
    setStreamWinActive(isStreamWinActive());
  }, [activePanel]);

  const handleCamToggle = async () => {
    setMediaError("");
    registerShellButtonHealth("shell.cam", "ok");
    await toggleHubCameraPreview();
  };

  const openCameraDevicePicker = () => {
    registerShellButtonHealth("shell.camera", "ok");
    setIsCameraOpen(true);
  };

  const handleMicToggle = async () => {
    setMediaError("");
    registerShellButtonHealth("shell.mic", "ok");
    await toggleHubMicPreview();
  };

  const handleGoLive = () => {
    // Hub strip is a deep-link only — media player owns publish / end
    setGoLiveError("");
    setMediaError("");
    registerShellButtonHealth("shell.go-live", "ok");
    const dockRole = isPerformer ? "PERFORMER" : "FAN";
    launchDockStore.setRole(dockRole);
    setGoLivePhase("launching");
    dispatchMediaPlayerGoLiveIntent();
    // MediaPlayerGoLiveControl flips isLivePublished; clear launching shortly
    window.setTimeout(() => setGoLivePhase("idle"), 2500);
  };

  const handleVideoShuffle = () => {
    registerShellButtonHealth("shell.video-shuffle", "ok");
    closePanel();
    if (isVideoShuffleActive()) {
      exitVideoShuffle();
      setShuffleActive(false);
    } else {
      void startVideoShuffle().then((started) => setShuffleActive(Boolean(started)));
    }
  };

  const handleSnips = () => {
    registerShellButtonHealth("shell.snips", "ok");
    closePanel();
    if (activePanel === "snips") closePanel();
    else openPanel("snips", "bottom-right");
  };

  const handleStreamWin = () => {
    registerShellButtonHealth("shell.stream-win", "ok");
    closePanel();
    if (activePanel === "stream-win" || isStreamWinActive()) {
      exitStreamWin();
      setStreamWinActive(false);
      closePanel();
    } else {
      void startStreamWin().then((started) => {
        setStreamWinActive(Boolean(started));
        if (started) openPanel("stream-win", "bottom-left");
      });
    }
  };

  const primaryStrip = getPrimarySessionStripForRole();

  const renderPrimaryButton = (id: string) => {
    switch (id) {
      case "mic":
        return (
          <SessionBtn
            key={id}
            label={micPreviewActive ? "🎙️ MIC ON" : "🎙️ MIC OFF"}
            accent={micPreviewActive ? "#00FF88" : "#fff"}
            border={micPreviewActive ? "#00FF88" : "rgba(255,255,255,0.18)"}
            onClick={() => void handleMicToggle()}
          />
        );
      case "cam":
        return (
          <SessionBtn
            key={id}
            label={cameraPreviewActive ? "📹 CAM ON" : "📹 CAM OFF"}
            accent={cameraPreviewActive ? "#00FF88" : "#fff"}
            border={cameraPreviewActive ? "#00FF88" : "rgba(255,255,255,0.18)"}
            onClick={() => void handleCamToggle()}
          />
        );
      case "camera":
        return (
          <SessionBtn
            key={id}
            label="📷 CAMERA"
            accent="#fff"
            border="rgba(255,255,255,0.18)"
            onClick={openCameraDevicePicker}
          />
        );
      case "snips":
        return (
          <SessionBtn
            key={id}
            label="📱 SNIPS"
            accent={activePanel === "snips" ? GOLD : "rgba(255,255,255,0.7)"}
            border={activePanel === "snips" ? GOLD : "rgba(255,255,255,0.18)"}
            onClick={handleSnips}
          />
        );
      case "video-shuffle":
        return (
          <SessionBtn
            key={id}
            label="🔀 VIDEO SHUFFLE"
            accent={shuffleActive ? "#AA2DFF" : "rgba(255,255,255,0.7)"}
            border={shuffleActive ? "#AA2DFF" : "rgba(255,255,255,0.18)"}
            onClick={handleVideoShuffle}
          />
        );
      case "stream-win":
        return (
          <SessionBtn
            key={id}
            label="📻 STREAM & WIN"
            accent={streamWinActive || activePanel === "stream-win" ? "#FFD700" : "rgba(255,255,255,0.85)"}
            border={streamWinActive || activePanel === "stream-win" ? "#FFD700" : "rgba(255,255,255,0.18)"}
            onClick={handleStreamWin}
          />
        );
      case "go-live":
        return (
          <SessionBtn
            key={id}
            label={
              isLivePublished
                ? "● LIVE · END"
                : goLivePhase === "launching"
                  ? "● GOING LIVE…"
                  : "🔴 GO LIVE"
            }
            gradient="linear-gradient(135deg,#AA2DFF,#FF2DAA)"
            border="#FF2DAA"
            disabled={goLivePhase === "launching"}
            onClick={() => handleGoLive()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <RoleGate allow={["FAN", "ADMIN", "STAFF"]}>
        <InventoryPanelOverlay
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          onOpenAvatarStudio={() => {
            setIsInventoryOpen(false);
            router.push("/avatar/studio");
          }}
          onViewAll={() => {
            setIsInventoryOpen(false);
            openWorkspace("avatar_inventory");
          }}
        />
      </RoleGate>
      <CameraCaptureOverlay isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      <div
        data-session-control-strip
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "8px 12px",
          background: "rgba(5, 5, 20, 0.92)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(0, 255, 255, 0.18)",
          borderBottom: "1px solid rgba(0, 255, 255, 0.18)",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 8,
            width: "max-content",
            margin: isMobile ? "0" : "0 auto",
          }}
        >
          {primaryStrip.map((btn) => renderPrimaryButton(btn.id))}
          {(goLivePhase === "error" && goLiveError) || mediaError ? (
            <span style={{ fontSize: 9, color: "#FF4444", fontWeight: 700, flexShrink: 0 }}>
              {goLiveError || mediaError}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
}

function SessionBtn({
  label,
  onClick,
  accent = "#fff",
  border = "rgba(255,255,255,0.18)",
  gradient,
  disabled = false,
}: {
  label: string;
  onClick?: () => void;
  accent?: string;
  border?: string;
  gradient?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px",
        borderRadius: 12,
        background: gradient ?? "rgba(255,255,255,0.05)",
        border: `1px solid ${border}`,
        color: accent,
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: disabled ? "default" : onClick ? "pointer" : "default",
        fontFamily: "inherit",
        opacity: disabled ? 0.6 : 1,
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
