"use client";

/**
 * Rare path: session cookie present but tmi_role missing/unclassified.
 * Gate resolves via /api/auth/session, then mounts Performer shell (static, one graph).
 */

import SessionRoleGate from "@/components/auth/SessionRoleGate";
import PerformerHubMount from "@/components/auth/PerformerHubMount";

export default function PerformerHubSessionFallback() {
  return (
    <SessionRoleGate mode="performer-only">
      {(session) => <PerformerHubMount session={session} />}
    </SessionRoleGate>
  );
}
