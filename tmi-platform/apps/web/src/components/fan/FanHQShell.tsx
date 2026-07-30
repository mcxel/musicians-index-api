"use client";

/**
 * Fan HQ / Command Center — thin wrapper over shared CommandCenterShell.
 * Drawer: Avatar Fan Lobby, YoPho, playlists, memory, inventory (Rule 26 Fan-only).
 */

import CommandCenterShell from "@/components/commandCenter/CommandCenterShell";

interface FanHQShellProps {
  fanId: string;
  fanDisplayName: string;
}

export default function FanHQShell({ fanId, fanDisplayName }: FanHQShellProps) {
  return <CommandCenterShell role="fan" userId={fanId} displayName={fanDisplayName} />;
}
