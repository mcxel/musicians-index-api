"use client";

/**
 * In-flow session controls (leave, mic, cam, hand, emotes picker, go live).
 * Sits directly above the persistent Media/Interaction dock under monitors.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import InventoryPanelOverlay from "@/components/panels/InventoryPanelOverlay";
import CameraCaptureOverlay from "@/components/panels/CameraCaptureOverlay";
import YoPhoStudioDrawer from "@/components/studio/YoPhoStudioDrawer";
import { useFloatingWorkspace } from "@/lib/workspace/floatingWorkspaceStore";
import { launchDockStore } from "@/lib/dock/launchDockStore";
import { executeInstantGoLive } from "@/lib/dock/executeInstantGoLive";

export interface CommandCenterSessionControlStripProps {
  role: "fan" | "performer";
  onLeaveRoom?: () => void;
  /** Command Center dashboard: use MONITORS / HIDE STAGE — not venue LEAVE. */
  leaveLabel?: string;
  onEnterStage?: () => void;
  onEmotesFocus?: () => void;
}

export default function CommandCenterSessionControlStrip({
  role,
  onLeaveRoom,
  leaveLabel = "🚪 LEAVE",
  onEnterStage,
  onEmotesFocus,
}: CommandCenterSessionControlStripProps) {
  const router = useRouter();
  const isPerformer = role === "performer";
  const [isMicActive, setIsMicActive] = useState(true);
  const [isCamActive, setIsCamActive] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { open: openWorkspace } = useFloatingWorkspace();

  useEffect(() => {
    launchDockStore.setRole(isPerformer ? "PERFORMER" : "FAN");
  }, [isPerformer]);

  const openPrimaryQuickPanel = () => {
    if (isPerformer) {
      openWorkspace("venue_concierge");
      return;
    }
    setIsInventoryOpen(true);
  };

  return (
    <>
      <RoleGate allow={["FAN", "ADMIN", "STAFF"]}>
        <InventoryPanelOverlay
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          onOpenAvatarStudio={() => {
            setIsInventoryOpen(false);
            setIsStudioOpen(true);
          }}
          onViewAll={() => {
            setIsInventoryOpen(false);
            openWorkspace("avatar_inventory");
          }}
        />
      </RoleGate>
      <YoPhoStudioDrawer
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        role={role}
      />
      <CameraCaptureOverlay isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          padding: "10px 12px 6px",
          background: "rgba(5, 5, 20, 0.55)",
          borderTop: "1px solid rgba(0, 255, 255, 0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            maxWidth: "100%",
          }}
        >
          <SessionBtn label={leaveLabel} accent="#FF4D4D" border="#E63000" onClick={onLeaveRoom} />
          <SessionBtn
            label={isMicActive ? "🎙️ MIC ON" : "🎙️ MIC OFF"}
            accent={isMicActive ? "#00FF88" : "#fff"}
            border={isMicActive ? "#00FF88" : "rgba(255,255,255,0.18)"}
            onClick={() => setIsMicActive((v) => !v)}
          />
          <SessionBtn
            label={isCamActive ? "📹 CAM ON" : "📹 CAM OFF"}
            accent={isCamActive ? "#00FF88" : "#fff"}
            border={isCamActive ? "#00FF88" : "rgba(255,255,255,0.18)"}
            onClick={() => setIsCamActive((v) => !v)}
          />
          <SessionBtn
            label="✋ HAND"
            accent={isHandRaised ? "#FFD700" : "#fff"}
            border={isHandRaised ? "#FFD700" : "rgba(255,255,255,0.18)"}
            onClick={() => setIsHandRaised((v) => !v)}
          />
          <SessionBtn
            label={isPerformer ? "🗺️ CONCIERGE" : "😃 EMOTES"}
            onClick={() => {
              openPrimaryQuickPanel();
              onEmotesFocus?.();
            }}
          />
          <SessionBtn label="📷 CAMERA" onClick={() => setIsCameraOpen(true)} />
          <SessionBtn
            label="🔴 GO LIVE"
            gradient="linear-gradient(135deg,#AA2DFF,#FF2DAA)"
            border="#FF2DAA"
            onClick={() => {
              const dockRole = isPerformer ? "PERFORMER" : "FAN";
              launchDockStore.setRole(dockRole);
              if (launchDockStore.isReady()) {
                void executeInstantGoLive({ role: dockRole }).then((r) => {
                  if (r.ok && r.href) router.push(r.href);
                  else launchDockStore.open();
                });
                return;
              }
              launchDockStore.open();
            }}
          />
          <SessionBtn
            label="⭐ STAGE"
            gradient="linear-gradient(135deg,#AA2DFF,#FF2DAA)"
            border="#FF2DAA"
            onClick={onEnterStage}
          />
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
}: {
  label: string;
  onClick?: () => void;
  accent?: string;
  border?: string;
  gradient?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 12,
        background: gradient ?? "rgba(255,255,255,0.05)",
        border: `1px solid ${border}`,
        color: accent,
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}
