"use client";

/**
 * FanShell — standalone Fan root experience.
 * Owns fan nav, avatar, inventory, fan lobbies — never Performer production chrome.
 */

import CommandCenterShell from "@/components/commandCenter/CommandCenterShell";

export interface FanShellProps {
  fanId: string;
  fanDisplayName: string;
}

export default function FanShell({ fanId, fanDisplayName }: FanShellProps) {
  return (
    <div data-shell="FanShell" data-role-shell="FAN" data-canonical-shell="fan" style={{ minHeight: "100vh", width: "100%" }}>
      <CommandCenterShell role="fan" userId={fanId} displayName={fanDisplayName} />
    </div>
  );
}
