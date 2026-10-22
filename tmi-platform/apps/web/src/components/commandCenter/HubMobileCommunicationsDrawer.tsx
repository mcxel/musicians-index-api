"use client";

/**
 * HubMobileCommunicationsDrawer — the one phone Messages entry: Messages / Room / People / Community.
 * Opens in the shared Hub drawer frame and reuses HubCommunicationsRail
 * (MessagingCanister + RoomChatPanel) — no second chat engine.
 */

import HubDrawerFrame from "@/components/workspace/universal/HubDrawerFrame";
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
  if (!open) return null;

  const accent = role === "performer" ? "#FFD700" : "#00FF88";

  return (
    <HubDrawerFrame drawerId="communications" title="MESSAGES" onRequestClose={onClose} bodyMode="contain">
      <div data-hub-mobile-comms-drawer="1" style={{ position: "absolute", inset: 0, display: "flex" }}>
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
    </HubDrawerFrame>
  );
}
