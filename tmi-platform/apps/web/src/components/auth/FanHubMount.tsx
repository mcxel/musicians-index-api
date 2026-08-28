"use client";

/**
 * Fan hub mount — static FanShell only (single command-center graph).
 * Loaded via dynamic import() after SessionRoleGate is READY.
 */

import FanShell from "@/components/shell/FanShell";
import type { SessionRoleReady } from "@/components/auth/SessionRoleGate";

export default function FanHubMount({ session }: { session: SessionRoleReady }) {
  return (
    <div data-role-boundary="FAN" data-shell-root="FanShell">
      <FanShell fanId={session.userId} fanDisplayName={session.displayName} />
    </div>
  );
}
