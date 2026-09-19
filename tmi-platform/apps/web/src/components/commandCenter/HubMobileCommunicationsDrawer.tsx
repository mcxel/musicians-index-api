"use client";

/**
 * HubMobileCommunicationsDrawer — mobile ONE-DRAWER host for Messages / Room / People / Community.
 * Reuses HubCommunicationsRail (MessagingCanister + RoomChatPanel) — no second chat engine.
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import HubCommunicationsRail, {
  type HubCommunicationsTab,
} from "./HubCommunicationsRail";

export interface HubMobileCommunicationsDrawerProps {
  open: boolean;
  tab: HubCommunicationsTab;
  onTabChange: (tab: HubCommunicationsTab) => void;
  onClose: () => void;
  role: "fan" | "performer";
  userId: string;
  displayName: string;
  roomId?: string | null;
  isAuthorizedHost?: boolean;
  isOfficialModerator?: boolean;
}

export default function HubMobileCommunicationsDrawer({
  open,
  tab,
  onTabChange,
  onClose,
  role,
  userId,
  displayName,
  roomId,
  isAuthorizedHost = false,
  isOfficialModerator = false,
}: HubMobileCommunicationsDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const accent = role === "performer" ? "#FFD700" : "#00FF88";

  return createPortal(
    <div
      data-hub-mobile-comms-drawer="1"
      role="dialog"
      aria-label="Communications drawer"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9400,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <button
        type="button"
        aria-label="Close communications"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          border: "none",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          position: "relative",
          maxHeight: "min(78dvh, 720px)",
          height: "min(78dvh, 720px)",
          width: "100%",
          background: "rgba(4,6,14,0.98)",
          borderTop: `2px solid ${accent}`,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.65)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px 6px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: accent,
            }}
          >
            COMMUNICATIONS
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              padding: "4px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            CLOSE
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <HubCommunicationsRail
            variant="drawer"
            role={role}
            userId={userId}
            displayName={displayName}
            roomId={roomId}
            tab={tab}
            onTabChange={onTabChange}
            accentColor={accent}
            roomClass="PERSONAL_OWNED"
            isAuthorizedHost={isAuthorizedHost}
            isOfficialModerator={isOfficialModerator}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
