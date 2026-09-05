"use client";

/**
 * Rare path: session cookie present but tmi_role missing/unclassified.
 * Gate resolves via /api/auth/session, then mounts Fan shell (static, one graph).
 */

import SessionRoleGate from "@/components/auth/SessionRoleGate";
import FanHubMount from "@/components/auth/FanHubMount";

export default function FanHubSessionFallback() {
  return (
    <SessionRoleGate mode="fan-only">
      {(session) => <FanHubMount session={session} />}
    </SessionRoleGate>
  );
}
