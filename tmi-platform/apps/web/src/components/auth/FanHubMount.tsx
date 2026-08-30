"use client";

/**
 * Fan hub mount — static FanShell only (single command-center graph).
 * Loaded via dynamic import() after SessionRoleGate is READY.
 */

import { useEffect } from "react";
import FanShell from "@/components/shell/FanShell";
import type { SessionRoleReady } from "@/components/auth/SessionRoleGate";
import { preloadFoundryAvatarGlb } from "@/components/3d/AvatarLobbyCanvas";
import { resolveCertifiedAvatarGlbUrl, DEFAULT_FAN_AVATAR_GLB_SLOT } from "@/lib/avatars/AvatarGlbRegistry";

export default function FanHubMount({ session }: { session: SessionRoleReady }) {
  // Start Foundry GLB download immediately on Fan hub — before drawer opens and
  // before hub telemetry saturates the browser connection pool.
  useEffect(() => {
    preloadFoundryAvatarGlb(resolveCertifiedAvatarGlbUrl(DEFAULT_FAN_AVATAR_GLB_SLOT));
  }, []);

  return (
    <div data-role-boundary="FAN" data-shell-root="FanShell">
      <FanShell fanId={session.userId} fanDisplayName={session.displayName} />
    </div>
  );
}
