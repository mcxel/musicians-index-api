"use client";

/**
 * FanShell — standalone Fan root experience.
 * Owns fan nav, avatar, inventory, fan lobbies — never Performer production chrome.
 */

import CommandCenterShell from "@/components/commandCenter/CommandCenterShell";

export interface FanShellProps {
  fanId: string;
  fanDisplayName: string;
  publishedRoomId?: string | null;
}

export default function FanShell({ fanId, fanDisplayName, publishedRoomId }: FanShellProps) {
  return (
    <div data-shell="FanShell" data-role-shell="FAN" data-canonical-shell="fan" style={{ minHeight: "100vh", width: "100%" }}>
      <CommandCenterShell role="fan" userId={fanId} displayName={fanDisplayName} publishedRoomId={publishedRoomId} />
    </div>
  );
}
