"use client";

/**
 * Performer hub mount — static PerformerShell only (single command-center graph).
 * Loaded via dynamic import() after SessionRoleGate is READY.
 */

import PerformerShell from "@/components/shell/PerformerShell";
import type { SessionRoleReady } from "@/components/auth/SessionRoleGate";

export default function PerformerHubMount({ session }: { session: SessionRoleReady }) {
  return (
    <div data-role-boundary="PERFORMER" data-shell-root="PerformerShell">
      <PerformerShell performerId={session.userId} displayName={session.displayName} />
    </div>
  );
}
