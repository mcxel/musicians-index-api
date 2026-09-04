"use client";

/**
 * Fan HQ — thin alias to FanShell (standalone root).
 * Kept for leftover imports; prefer FanShell / AuthenticatedRoleBoundary.
 */

import FanShell from "@/components/shell/FanShell";

interface FanHQShellProps {
  fanId: string;
  fanDisplayName: string;
}

export default function FanHQShell({ fanId, fanDisplayName }: FanHQShellProps) {
  return <FanShell fanId={fanId} fanDisplayName={fanDisplayName} />;
}
